"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createBulkNotifications } from "./announcement"

export type ActionResult<T = unknown> = {
    success: boolean
    message: string
    data?: T
    errors?: Record<string, string[]>
}

// ==================== VALIDATION SCHEMAS ====================

const judgingCriteriaSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    weight: z.number().min(0).max(100).default(100),
    maxScore: z.number().min(1).default(10),
})

const createStageSchema = z.object({
    hackathonId: z.string().min(1, "Hackathon ID is required"),
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    description: z.string().max(2000).optional(),
    type: z.enum([
        "REGISTRATION",
        "TEAM_FORMATION",
        "IDEATION",
        "MENTORING_SESSION",
        "CHECKPOINT",
        "DEVELOPMENT",
        "EVALUATION",
        "PRESENTATION",
        "RESULTS",
        "CUSTOM",
    ]),
    order: z.number().int().min(0).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
    
    // Timing
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    
    // Dependencies
    dependsOnStageId: z.string().optional().nullable(),
    allowParallel: z.boolean().default(false),
    
    // Elimination
    isElimination: z.boolean().default(false),
    eliminationType: z.enum(["TOP_N", "PERCENTAGE", "SCORE_THRESHOLD"]).optional().nullable(),
    eliminationValue: z.number().optional().nullable(),
    eliminationNotes: z.string().optional().nullable(),
    
    // Judging (for EVALUATION stages)
    judgingCriteria: z.array(judgingCriteriaSchema).optional().nullable(),
    minJudgesRequired: z.number().int().min(1).optional().nullable(),
    blindJudging: z.boolean().default(false),
    
    // Submissions
    requiresSubmission: z.boolean().default(false),
    submissionInstructions: z.string().optional().nullable(),
    submissionDeadline: z.string().or(z.date()).optional().nullable(),
    allowLateSubmission: z.boolean().default(false),
    lateSubmissionPenalty: z.number().min(0).max(100).optional().nullable(),
    
    // Mentoring (for MENTORING_SESSION stages)
    mentorSlotDuration: z.number().int().min(5).optional().nullable(),
    maxSlotsPerTeam: z.number().int().min(1).optional().nullable(),
    
    // Notifications
    notifyOnStart: z.boolean().default(true),
    notifyBeforeDeadline: z.boolean().default(true),
    deadlineReminderHours: z.array(z.number()).default([24, 6, 1]),
    notifyOnComplete: z.boolean().default(true),
    notifyOnElimination: z.boolean().default(true),
    
    // Status
    isActive: z.boolean().default(true),
})

const updateStageSchema = createStageSchema.partial().omit({ hackathonId: true })

const reorderStagesSchema = z.object({
    hackathonId: z.string().min(1),
    stageOrder: z.array(z.object({
        id: z.string(),
        order: z.number().int().min(0),
    })),
})

export type CreateStageInput = z.infer<typeof createStageSchema>
export type UpdateStageInput = z.infer<typeof updateStageSchema>
export type JudgingCriteria = z.infer<typeof judgingCriteriaSchema>

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

async function getNextStageOrder(hackathonId: string): Promise<number> {
    const lastStage = await prisma.hackathonStage.findFirst({
        where: { hackathonId },
        orderBy: { order: "desc" },
        select: { order: true },
    })
    return (lastStage?.order ?? -1) + 1
}

// ==================== STAGE CRUD ACTIONS ====================

export async function createStage(
    input: CreateStageInput
): Promise<ActionResult<{ id: string }>> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Validate input
    const validated = createStageSchema.safeParse(input)
    if (!validated.success) {
        console.error("Validation errors:", validated.error.flatten())
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    const data = validated.data

    // Check permissions
    const isOrganizer = await isHackathonOrganizer(session.user.id, data.hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "You don't have permission to manage stages" }
    }

    try {
        // Get order if not provided
        const order = data.order ?? await getNextStageOrder(data.hackathonId)

        const stage = await prisma.hackathonStage.create({
            data: {
                hackathonId: data.hackathonId,
                name: data.name,
                description: data.description,
                type: data.type,
                order,
                color: data.color,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                dependsOnStageId: data.dependsOnStageId,
                allowParallel: data.allowParallel,
                isElimination: data.isElimination,
                eliminationType: data.eliminationType,
                eliminationValue: data.eliminationValue,
                eliminationNotes: data.eliminationNotes,
                judgingCriteria: data.judgingCriteria ?? undefined,
                minJudgesRequired: data.minJudgesRequired,
                blindJudging: data.blindJudging,
                requiresSubmission: data.requiresSubmission,
                submissionInstructions: data.submissionInstructions,
                submissionDeadline: data.submissionDeadline ? new Date(data.submissionDeadline) : null,
                allowLateSubmission: data.allowLateSubmission,
                lateSubmissionPenalty: data.lateSubmissionPenalty,
                mentorSlotDuration: data.mentorSlotDuration,
                maxSlotsPerTeam: data.maxSlotsPerTeam,
                notifyOnStart: data.notifyOnStart,
                notifyBeforeDeadline: data.notifyBeforeDeadline,
                deadlineReminderHours: data.deadlineReminderHours,
                notifyOnComplete: data.notifyOnComplete,
                notifyOnElimination: data.notifyOnElimination,
                isActive: data.isActive,
            },
        })

        // Get hackathon slug for revalidation
        const hackathon = await prisma.hackathon.findUnique({
            where: { id: data.hackathonId },
            select: { slug: true },
        })

        if (hackathon) {
            revalidatePath(`/hackathons/${hackathon.slug}`)
            revalidatePath(`/hackathons/${hackathon.slug}/manage`)
        }

        return {
            success: true,
            message: "Stage created successfully",
            data: { id: stage.id },
        }
    } catch (error) {
        console.error("Create stage error:", error)
        return { success: false, message: "Failed to create stage" }
    }
}

export async function updateStage(
    stageId: string,
    input: UpdateStageInput
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Get existing stage
    const existingStage = await prisma.hackathonStage.findUnique({
        where: { id: stageId },
        select: { hackathonId: true },
    })

    if (!existingStage) {
        return { success: false, message: "Stage not found" }
    }

    // Check permissions
    const isOrganizer = await isHackathonOrganizer(session.user.id, existingStage.hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "You don't have permission to update this stage" }
    }

    // Validate input
    const validated = updateStageSchema.safeParse(input)
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    const data = validated.data

    try {
        // Build update data, excluding undefined values and handling nullables
        const updateData: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                if (key === 'startDate' || key === 'endDate' || key === 'submissionDeadline') {
                    updateData[key] = value ? new Date(value as string) : null
                } else {
                    updateData[key] = value
                }
            }
        }

        await prisma.hackathonStage.update({
            where: { id: stageId },
            data: updateData,
        })

        const hackathon = await prisma.hackathon.findUnique({
            where: { id: existingStage.hackathonId },
            select: { slug: true },
        })

        if (hackathon) {
            revalidatePath(`/hackathons/${hackathon.slug}`)
            revalidatePath(`/hackathons/${hackathon.slug}/manage`)
        }

        return { success: true, message: "Stage updated successfully" }
    } catch (error) {
        console.error("Update stage error:", error)
        return { success: false, message: "Failed to update stage" }
    }
}

export async function deleteStage(stageId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Get existing stage
    const existingStage = await prisma.hackathonStage.findUnique({
        where: { id: stageId },
        select: { hackathonId: true, order: true },
    })

    if (!existingStage) {
        return { success: false, message: "Stage not found" }
    }

    // Check permissions
    const isOrganizer = await isHackathonOrganizer(session.user.id, existingStage.hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "You don't have permission to delete this stage" }
    }

    try {
        // Delete the stage
        await prisma.hackathonStage.delete({
            where: { id: stageId },
        })

        // Reorder remaining stages
        await prisma.hackathonStage.updateMany({
            where: {
                hackathonId: existingStage.hackathonId,
                order: { gt: existingStage.order },
            },
            data: {
                order: { decrement: 1 },
            },
        })

        const hackathon = await prisma.hackathon.findUnique({
            where: { id: existingStage.hackathonId },
            select: { slug: true },
        })

        if (hackathon) {
            revalidatePath(`/hackathons/${hackathon.slug}`)
            revalidatePath(`/hackathons/${hackathon.slug}/manage`)
        }

        return { success: true, message: "Stage deleted successfully" }
    } catch (error) {
        console.error("Delete stage error:", error)
        return { success: false, message: "Failed to delete stage" }
    }
}

export async function reorderStages(
    hackathonId: string,
    stageOrder: { id: string; order: number }[]
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Check permissions
    const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "You don't have permission to reorder stages" }
    }

    try {
        // Update all stages in a transaction
        await prisma.$transaction(
            stageOrder.map(({ id, order }) =>
                prisma.hackathonStage.update({
                    where: { id },
                    data: { order },
                })
            )
        )

        const hackathon = await prisma.hackathon.findUnique({
            where: { id: hackathonId },
            select: { slug: true },
        })

        if (hackathon) {
            revalidatePath(`/hackathons/${hackathon.slug}`)
            revalidatePath(`/hackathons/${hackathon.slug}/manage`)
        }

        return { success: true, message: "Stages reordered successfully" }
    } catch (error) {
        console.error("Reorder stages error:", error)
        return { success: false, message: "Failed to reorder stages" }
    }
}

// ==================== STAGE QUERY ACTIONS ====================

export async function getHackathonStages(hackathonId: string) {
    return prisma.hackathonStage.findMany({
        where: { hackathonId },
        orderBy: { order: "asc" },
        include: {
            dependsOnStage: {
                select: { id: true, name: true },
            },
            _count: {
                select: { submissions: true },
            },
        },
    })
}

export async function getStageById(stageId: string) {
    return prisma.hackathonStage.findUnique({
        where: { id: stageId },
        include: {
            dependsOnStage: {
                select: { id: true, name: true },
            },
            dependentStages: {
                select: { id: true, name: true },
            },
            hackathon: {
                select: { id: true, title: true, slug: true },
            },
            _count: {
                select: { submissions: true },
            },
        },
    })
}

export async function getCurrentStage(hackathonId: string) {
    const now = new Date()
    return prisma.hackathonStage.findFirst({
        where: {
            hackathonId,
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
        },
        orderBy: { order: "asc" },
    })
}

export async function getUpcomingStages(hackathonId: string, limit = 3) {
    const now = new Date()
    return prisma.hackathonStage.findMany({
        where: {
            hackathonId,
            isActive: true,
            startDate: { gt: now },
        },
        orderBy: { startDate: "asc" },
        take: limit,
    })
}

// ==================== STAGE STATUS ACTIONS ====================

export async function activateStage(stageId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const stage = await prisma.hackathonStage.findUnique({
        where: { id: stageId },
        include: {
            hackathon: { select: { slug: true } },
            dependsOnStage: { select: { isCompleted: true } },
        },
    })

    if (!stage) {
        return { success: false, message: "Stage not found" }
    }

    // Check permissions
    const isOrganizer = await isHackathonOrganizer(session.user.id, stage.hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "You don't have permission to activate this stage" }
    }

    // Check if dependency is completed
    if (stage.dependsOnStage && !stage.dependsOnStage.isCompleted) {
        return { success: false, message: "The dependent stage must be completed first" }
    }

    try {
        await prisma.hackathonStage.update({
            where: { id: stageId },
            data: { isActive: true },
        })

        // Send notifications if enabled
        if (stage.notifyOnStart) {
            const registrations = await prisma.hackathonRegistration.findMany({
                where: { hackathonId: stage.hackathonId, status: "APPROVED" },
                select: { userId: true },
            })

            await createBulkNotifications(
                registrations.map(r => r.userId),
                {
                    type: "STAGE",
                    title: `${stage.name} has started!`,
                    message: stage.description || `The ${stage.name} stage is now active.`,
                    link: `/hackathons/${stage.hackathon.slug}`,
                    hackathonId: stage.hackathonId,
                }
            )
        }

        revalidatePath(`/hackathons/${stage.hackathon.slug}`)

        return { success: true, message: "Stage activated successfully" }
    } catch (error) {
        console.error("Activate stage error:", error)
        return { success: false, message: "Failed to activate stage" }
    }
}

export async function completeStage(stageId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const stage = await prisma.hackathonStage.findUnique({
        where: { id: stageId },
        include: {
            hackathon: { select: { slug: true } },
        },
    })

    if (!stage) {
        return { success: false, message: "Stage not found" }
    }

    // Check permissions
    const isOrganizer = await isHackathonOrganizer(session.user.id, stage.hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "You don't have permission to complete this stage" }
    }

    try {
        await prisma.hackathonStage.update({
            where: { id: stageId },
            data: {
                isCompleted: true,
                completedAt: new Date(),
            },
        })

        // Send notifications if enabled
        if (stage.notifyOnComplete) {
            const registrations = await prisma.hackathonRegistration.findMany({
                where: { hackathonId: stage.hackathonId, status: "APPROVED" },
                select: { userId: true },
            })

            await createBulkNotifications(
                registrations.map(r => r.userId),
                {
                    type: "STAGE",
                    title: `${stage.name} has ended`,
                    message: `The ${stage.name} stage has been completed.`,
                    link: `/hackathons/${stage.hackathon.slug}`,
                    hackathonId: stage.hackathonId,
                }
            )
        }

        revalidatePath(`/hackathons/${stage.hackathon.slug}`)

        return { success: true, message: "Stage marked as completed" }
    } catch (error) {
        console.error("Complete stage error:", error)
        return { success: false, message: "Failed to complete stage" }
    }
}

// ==================== STAGE TEMPLATE ACTIONS ====================

const createTemplateSchema = z.object({
    organizationId: z.string().min(1),
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    type: z.enum([
        "REGISTRATION",
        "TEAM_FORMATION",
        "IDEATION",
        "MENTORING_SESSION",
        "CHECKPOINT",
        "DEVELOPMENT",
        "EVALUATION",
        "PRESENTATION",
        "RESULTS",
        "CUSTOM",
    ]),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    defaultDurationHours: z.number().int().min(1).default(24),
    settings: z.record(z.string(), z.any()), // Flexible settings object
    isPublic: z.boolean().default(false),
})

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>

export async function createStageTemplate(
    input: CreateTemplateInput
): Promise<ActionResult<{ id: string }>> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const validated = createTemplateSchema.safeParse(input)
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    const data = validated.data

    // Check if user is org admin
    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: data.organizationId,
            },
        },
    })

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
        return { success: false, message: "You don't have permission to create templates" }
    }

    try {
        const template = await prisma.stageTemplate.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                description: data.description,
                type: data.type,
                color: data.color,
                defaultDurationHours: data.defaultDurationHours,
                settings: data.settings,
                isPublic: data.isPublic,
            },
        })

        return {
            success: true,
            message: "Template created successfully",
            data: { id: template.id },
        }
    } catch (error) {
        console.error("Create template error:", error)
        return { success: false, message: "Failed to create template" }
    }
}

export async function getOrganizationTemplates(organizationId: string) {
    return prisma.stageTemplate.findMany({
        where: { organizationId },
        orderBy: { usageCount: "desc" },
    })
}

export async function getPublicTemplates() {
    return prisma.stageTemplate.findMany({
        where: { isPublic: true },
        orderBy: { usageCount: "desc" },
        take: 20,
        include: {
            organization: {
                select: { name: true, logo: true },
            },
        },
    })
}

export async function createStageFromTemplate(
    templateId: string,
    hackathonId: string,
    overrides?: {
        name?: string
        startDate: string | Date
        endDate: string | Date
        order?: number
    }
): Promise<ActionResult<{ id: string }>> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Check permissions
    const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "You don't have permission to add stages" }
    }

    const template = await prisma.stageTemplate.findUnique({
        where: { id: templateId },
    })

    if (!template) {
        return { success: false, message: "Template not found" }
    }

    try {
        const settings = template.settings as Record<string, unknown>
        const order = overrides?.order ?? await getNextStageOrder(hackathonId)

        const stage = await prisma.hackathonStage.create({
            data: {
                hackathonId,
                name: overrides?.name || template.name,
                description: template.description,
                type: template.type,
                order,
                color: template.color,
                startDate: new Date(overrides?.startDate || new Date()),
                endDate: new Date(overrides?.endDate || new Date()),
                isElimination: (settings.isElimination as boolean) || false,
                eliminationType: settings.eliminationType as "TOP_N" | "PERCENTAGE" | "SCORE_THRESHOLD" | null,
                eliminationValue: settings.eliminationValue as number | null,
                requiresSubmission: (settings.requiresSubmission as boolean) || false,
                submissionInstructions: settings.submissionInstructions as string | null,
                judgingCriteria: settings.judgingCriteria ?? undefined,
                notifyOnStart: (settings.notifyOnStart as boolean) ?? true,
                notifyBeforeDeadline: (settings.notifyBeforeDeadline as boolean) ?? true,
                notifyOnComplete: (settings.notifyOnComplete as boolean) ?? true,
            },
        })

        // Increment usage count
        await prisma.stageTemplate.update({
            where: { id: templateId },
            data: { usageCount: { increment: 1 } },
        })

        return {
            success: true,
            message: "Stage created from template",
            data: { id: stage.id },
        }
    } catch (error) {
        console.error("Create from template error:", error)
        return { success: false, message: "Failed to create stage from template" }
    }
}

// ==================== CLONE STAGES ====================

export async function cloneStagesFromHackathon(
    sourceHackathonId: string,
    targetHackathonId: string,
    offsetDays: number = 0
): Promise<ActionResult<{ count: number }>> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Check permissions for target hackathon
    const isOrganizer = await isHackathonOrganizer(session.user.id, targetHackathonId)
    if (!isOrganizer) {
        return { success: false, message: "You don't have permission to add stages" }
    }

    try {
        // Get stages from source hackathon
        const sourceStages = await prisma.hackathonStage.findMany({
            where: { hackathonId: sourceHackathonId },
            orderBy: { order: "asc" },
        })

        if (sourceStages.length === 0) {
            return { success: false, message: "No stages found in source hackathon" }
        }

        // Calculate date offset in milliseconds
        const offsetMs = offsetDays * 24 * 60 * 60 * 1000

        // Create stages in target hackathon
        const currentMaxOrder = await getNextStageOrder(targetHackathonId)

        const createdStages = await prisma.$transaction(
            sourceStages.map((stage, index) =>
                prisma.hackathonStage.create({
                    data: {
                        hackathonId: targetHackathonId,
                        name: stage.name,
                        description: stage.description,
                        type: stage.type,
                        order: currentMaxOrder + index,
                        color: stage.color,
                        startDate: new Date(stage.startDate.getTime() + offsetMs),
                        endDate: new Date(stage.endDate.getTime() + offsetMs),
                        isElimination: stage.isElimination,
                        eliminationType: stage.eliminationType,
                        eliminationValue: stage.eliminationValue,
                        eliminationNotes: stage.eliminationNotes,
                        judgingCriteria: stage.judgingCriteria ?? undefined,
                        minJudgesRequired: stage.minJudgesRequired,
                        blindJudging: stage.blindJudging,
                        requiresSubmission: stage.requiresSubmission,
                        submissionInstructions: stage.submissionInstructions,
                        allowLateSubmission: stage.allowLateSubmission,
                        lateSubmissionPenalty: stage.lateSubmissionPenalty,
                        mentorSlotDuration: stage.mentorSlotDuration,
                        maxSlotsPerTeam: stage.maxSlotsPerTeam,
                        notifyOnStart: stage.notifyOnStart,
                        notifyBeforeDeadline: stage.notifyBeforeDeadline,
                        deadlineReminderHours: stage.deadlineReminderHours,
                        notifyOnComplete: stage.notifyOnComplete,
                        notifyOnElimination: stage.notifyOnElimination,
                    },
                })
            )
        )

        const hackathon = await prisma.hackathon.findUnique({
            where: { id: targetHackathonId },
            select: { slug: true },
        })

        if (hackathon) {
            revalidatePath(`/hackathons/${hackathon.slug}/manage`)
        }

        return {
            success: true,
            message: `${createdStages.length} stages cloned successfully`,
            data: { count: createdStages.length },
        }
    } catch (error) {
        console.error("Clone stages error:", error)
        return { success: false, message: "Failed to clone stages" }
    }
}
