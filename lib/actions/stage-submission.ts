"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSystemNotification } from "./announcement"

export type ActionResult<T = unknown> = {
    success: boolean
    message: string
    data?: T
    errors?: Record<string, string[]>
}

// ==================== VALIDATION SCHEMAS ====================

const linkSchema = z.object({
    label: z.string().min(1),
    url: z.string().url(),
})

const attachmentSchema = z.object({
    name: z.string().min(1),
    url: z.string().url(),
    type: z.string(),
    size: z.number(),
})

const createSubmissionSchema = z.object({
    stageId: z.string().min(1, "Stage ID is required"),
    title: z.string().max(200).optional(),
    description: z.string().max(5000).optional(),
    content: z.string().optional(), // Rich text content
    links: z.array(linkSchema).optional(),
    attachments: z.array(attachmentSchema).optional(),
})

const updateSubmissionSchema = createSubmissionSchema.partial().omit({ stageId: true })

const judgeSubmissionSchema = z.object({
    score: z.number().min(0),
    feedback: z.string().max(5000).optional(),
})

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>

// ==================== HELPER FUNCTIONS ====================

async function isHackathonOrganizer(userId: string, hackathonId: string): Promise<boolean> {
    const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
        select: { organizationId: true },
    })

    if (!hackathon) return false

    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId,
                organizationId: hackathon.organizationId,
            },
        },
    })

    return membership?.role === "OWNER" || membership?.role === "ADMIN"
}

async function isParticipantApproved(userId: string, hackathonId: string): Promise<boolean> {
    const registration = await prisma.hackathonRegistration.findUnique({
        where: {
            hackathonId_userId: {
                hackathonId,
                userId,
            },
        },
    })

    return registration?.status === "APPROVED"
}

// ==================== SUBMISSION CRUD ACTIONS ====================

export async function createSubmission(
    input: CreateSubmissionInput
): Promise<ActionResult<{ id: string }>> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const validated = createSubmissionSchema.safeParse(input)
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    const data = validated.data

    // Get stage info
    const stage = await prisma.hackathonStage.findUnique({
        where: { id: data.stageId },
        include: {
            hackathon: { select: { slug: true } },
        },
    })

    if (!stage) {
        return { success: false, message: "Stage not found" }
    }

    // Check if user is approved participant
    const isApproved = await isParticipantApproved(session.user.id, stage.hackathonId)
    if (!isApproved) {
        return { success: false, message: "You must be an approved participant to submit" }
    }

    // Check if stage requires submission
    if (!stage.requiresSubmission) {
        return { success: false, message: "This stage does not accept submissions" }
    }

    // Check if stage is active
    if (!stage.isActive) {
        return { success: false, message: "This stage is not active" }
    }

    // Check deadline
    const now = new Date()
    const deadline = stage.submissionDeadline || stage.endDate
    const isLate = now > deadline

    if (isLate && !stage.allowLateSubmission) {
        return { success: false, message: "Submission deadline has passed" }
    }

    // Check if user already has a submission
    const existingSubmission = await prisma.stageSubmission.findUnique({
        where: {
            stageId_userId: {
                stageId: data.stageId,
                userId: session.user.id,
            },
        },
    })

    if (existingSubmission) {
        return { success: false, message: "You have already submitted for this stage. Use update instead." }
    }

    try {
        const submission = await prisma.stageSubmission.create({
            data: {
                stageId: data.stageId,
                hackathonId: stage.hackathonId,
                userId: session.user.id,
                title: data.title,
                description: data.description,
                content: data.content,
                links: data.links,
                attachments: data.attachments,
                status: "SUBMITTED",
                isLate,
            },
        })

        revalidatePath(`/hackathons/${stage.hackathon.slug}`)

        return {
            success: true,
            message: isLate ? "Submission received (late)" : "Submission received successfully",
            data: { id: submission.id },
        }
    } catch (error) {
        console.error("Create submission error:", error)
        return { success: false, message: "Failed to create submission" }
    }
}

export async function updateSubmission(
    submissionId: string,
    input: UpdateSubmissionInput
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const validated = updateSubmissionSchema.safeParse(input)
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    // Get existing submission
    const submission = await prisma.stageSubmission.findUnique({
        where: { id: submissionId },
        include: {
            stage: {
                include: {
                    hackathon: { select: { slug: true } },
                },
            },
        },
    })

    if (!submission) {
        return { success: false, message: "Submission not found" }
    }

    // Check ownership
    if (submission.userId !== session.user.id) {
        return { success: false, message: "You can only update your own submissions" }
    }

    // Check if submission is still editable
    if (submission.status === "APPROVED" || submission.status === "REJECTED") {
        return { success: false, message: "This submission can no longer be edited" }
    }

    // Check deadline
    const now = new Date()
    const stage = submission.stage
    const deadline = stage.submissionDeadline || stage.endDate

    if (now > deadline && !stage.allowLateSubmission) {
        return { success: false, message: "Submission deadline has passed" }
    }

    try {
        await prisma.stageSubmission.update({
            where: { id: submissionId },
            data: {
                ...validated.data,
                submittedAt: new Date(),
                isLate: now > deadline,
            },
        })

        revalidatePath(`/hackathons/${stage.hackathon.slug}`)

        return { success: true, message: "Submission updated successfully" }
    } catch (error) {
        console.error("Update submission error:", error)
        return { success: false, message: "Failed to update submission" }
    }
}

export async function deleteSubmission(submissionId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const submission = await prisma.stageSubmission.findUnique({
        where: { id: submissionId },
        include: {
            stage: {
                include: {
                    hackathon: { select: { slug: true } },
                },
            },
        },
    })

    if (!submission) {
        return { success: false, message: "Submission not found" }
    }

    // Check ownership or organizer
    const isOrganizer = await isHackathonOrganizer(session.user.id, submission.stage.hackathonId)
    if (submission.userId !== session.user.id && !isOrganizer) {
        return { success: false, message: "You don't have permission to delete this submission" }
    }

    try {
        await prisma.stageSubmission.delete({
            where: { id: submissionId },
        })

        revalidatePath(`/hackathons/${submission.stage.hackathon.slug}`)

        return { success: true, message: "Submission deleted successfully" }
    } catch (error) {
        console.error("Delete submission error:", error)
        return { success: false, message: "Failed to delete submission" }
    }
}

// ==================== SUBMISSION QUERY ACTIONS ====================

export async function getStageSubmissions(stageId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return []
    }

    const stage = await prisma.hackathonStage.findUnique({
        where: { id: stageId },
        select: { hackathonId: true },
    })

    if (!stage) return []

    // Check if user is organizer
    const isOrganizer = await isHackathonOrganizer(session.user.id, stage.hackathonId)

    if (isOrganizer) {
        // Organizers can see all submissions
        return prisma.stageSubmission.findMany({
            where: { stageId },
            orderBy: { submittedAt: "desc" },
        })
    }

    // Regular users can only see their own submissions
    return prisma.stageSubmission.findMany({
        where: { stageId, userId: session.user.id },
    })
}

export async function getUserSubmission(stageId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return null
    }

    return prisma.stageSubmission.findUnique({
        where: {
            stageId_userId: {
                stageId,
                userId: session.user.id,
            },
        },
    })
}

export async function getSubmissionById(submissionId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return null
    }

    const submission = await prisma.stageSubmission.findUnique({
        where: { id: submissionId },
        include: {
            stage: {
                select: {
                    hackathonId: true,
                    name: true,
                    type: true,
                },
            },
        },
    })

    if (!submission) return null

    // Check if user can view this submission
    const isOrganizer = await isHackathonOrganizer(session.user.id, submission.stage.hackathonId)
    if (submission.userId !== session.user.id && !isOrganizer) {
        return null
    }

    return submission
}

// ==================== JUDGING ACTIONS ====================

export async function judgeSubmission(
    submissionId: string,
    input: { score: number; feedback?: string }
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const validated = judgeSubmissionSchema.safeParse(input)
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    const submission = await prisma.stageSubmission.findUnique({
        where: { id: submissionId },
        include: {
            stage: {
                include: {
                    hackathon: { select: { slug: true } },
                },
            },
        },
    })

    if (!submission) {
        return { success: false, message: "Submission not found" }
    }

    // Check if user is organizer (can judge)
    const isOrganizer = await isHackathonOrganizer(session.user.id, submission.stage.hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "You don't have permission to judge submissions" }
    }

    try {
        await prisma.stageSubmission.update({
            where: { id: submissionId },
            data: {
                score: validated.data.score,
                feedback: validated.data.feedback,
                status: "APPROVED",
                judgedAt: new Date(),
                judgedBy: session.user.id,
            },
        })

        // Notify the submitter
        await createSystemNotification(submission.userId, {
            type: "JUDGING",
            title: "Your submission has been reviewed",
            message: `Your submission for "${submission.stage.name}" has been scored.`,
            link: `/hackathons/${submission.stage.hackathon.slug}`,
            hackathonId: submission.stage.hackathonId,
        })

        revalidatePath(`/hackathons/${submission.stage.hackathon.slug}/manage`)

        return { success: true, message: "Submission judged successfully" }
    } catch (error) {
        console.error("Judge submission error:", error)
        return { success: false, message: "Failed to judge submission" }
    }
}

export async function updateSubmissionStatus(
    submissionId: string,
    status: "PENDING" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "NEEDS_REVISION"
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const submission = await prisma.stageSubmission.findUnique({
        where: { id: submissionId },
        include: {
            stage: {
                include: {
                    hackathon: { select: { slug: true } },
                },
            },
        },
    })

    if (!submission) {
        return { success: false, message: "Submission not found" }
    }

    // Check if user is organizer
    const isOrganizer = await isHackathonOrganizer(session.user.id, submission.stage.hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "You don't have permission to update submission status" }
    }

    try {
        await prisma.stageSubmission.update({
            where: { id: submissionId },
            data: { status },
        })

        // Notify the submitter
        const statusMessages: Record<string, string> = {
            UNDER_REVIEW: "is now under review",
            APPROVED: "has been approved",
            REJECTED: "has been rejected",
            NEEDS_REVISION: "needs revision",
        }

        if (statusMessages[status]) {
            await createSystemNotification(submission.userId, {
                type: "SUBMISSION",
                title: `Submission ${statusMessages[status]}`,
                message: `Your submission for "${submission.stage.name}" ${statusMessages[status]}.`,
                link: `/hackathons/${submission.stage.hackathon.slug}`,
                hackathonId: submission.stage.hackathonId,
            })
        }

        revalidatePath(`/hackathons/${submission.stage.hackathon.slug}/manage`)

        return { success: true, message: "Submission status updated" }
    } catch (error) {
        console.error("Update submission status error:", error)
        return { success: false, message: "Failed to update submission status" }
    }
}

// ==================== BULK ACTIONS ====================

export async function getStageSubmissionStats(stageId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return null
    }

    const stage = await prisma.hackathonStage.findUnique({
        where: { id: stageId },
        select: { hackathonId: true },
    })

    if (!stage) return null

    // Check if user is organizer
    const isOrganizer = await isHackathonOrganizer(session.user.id, stage.hackathonId)
    if (!isOrganizer) {
        return null
    }

    const [total, submitted, reviewed, approved, rejected] = await Promise.all([
        prisma.hackathonRegistration.count({
            where: { hackathonId: stage.hackathonId, status: "APPROVED" },
        }),
        prisma.stageSubmission.count({ where: { stageId } }),
        prisma.stageSubmission.count({
            where: { stageId, judgedAt: { not: null } },
        }),
        prisma.stageSubmission.count({
            where: { stageId, status: "APPROVED" },
        }),
        prisma.stageSubmission.count({
            where: { stageId, status: "REJECTED" },
        }),
    ])

    return {
        totalParticipants: total,
        submitted,
        pending: submitted - reviewed,
        reviewed,
        approved,
        rejected,
        submissionRate: total > 0 ? Math.round((submitted / total) * 100) : 0,
    }
}
