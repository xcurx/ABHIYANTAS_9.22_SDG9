"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { 
    createCodingContestSchema, 
    updateCodingContestSchema,
    registerForContestSchema,
    type CreateCodingContestInput 
} from "@/lib/validations/coding-contest"

export type ActionResult<T = unknown> = {
    success: boolean
    message: string
    data?: T
    errors?: Record<string, string[]>
}

// Helper to generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
}

// Helper to check if user is organization admin
async function isOrgAdmin(userId: string, organizationId: string): Promise<boolean> {
    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId,
                organizationId,
            },
        },
    })
    return membership?.role === "OWNER" || membership?.role === "ADMIN"
}

// ==================== CONTEST CRUD ====================

export async function createCodingContest(
    input: CreateCodingContestInput
): Promise<ActionResult<{ slug: string; id: string }>> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Check if user is admin of the organization
    const isAdmin = await isOrgAdmin(session.user.id, input.organizationId)
    if (!isAdmin) {
        return { success: false, message: "You don't have permission to create contests for this organization" }
    }

    const validated = createCodingContestSchema.safeParse(input)
    
    if (!validated.success) {
        console.error("Validation errors:", JSON.stringify(validated.error.flatten(), null, 2))
        console.error("Input received:", JSON.stringify(input, null, 2))
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    // Check if slug already exists
    const existingContest = await prisma.codingContest.findUnique({
        where: { slug: validated.data.slug },
    })

    if (existingContest) {
        return {
            success: false,
            message: "A contest with this slug already exists",
            errors: { slug: ["This slug is already taken"] },
        }
    }

    try {
        const contest = await prisma.codingContest.create({
            data: {
                ...validated.data,
                maxParticipants: validated.data.maxParticipants ?? null,
            },
        })

        revalidatePath("/coding-contests")
        revalidatePath(`/organizations/${contest.organizationId}`)

        return {
            success: true,
            message: "Contest created successfully!",
            data: { slug: contest.slug, id: contest.id },
        }
    } catch (error) {
        console.error("Create contest error:", error)
        return { success: false, message: "Failed to create contest" }
    }
}

export async function updateCodingContest(
    contestId: string,
    input: Partial<CreateCodingContestInput>
): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const contest = await prisma.codingContest.findUnique({
        where: { id: contestId },
    })

    if (!contest) {
        return { success: false, message: "Contest not found" }
    }

    // Check permission
    const isAdmin = await isOrgAdmin(session.user.id, contest.organizationId)
    if (!isAdmin) {
        return { success: false, message: "You don't have permission to update this contest" }
    }

    const validated = updateCodingContestSchema.safeParse(input)
    
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    try {
        await prisma.codingContest.update({
            where: { id: contestId },
            data: validated.data,
        })

        revalidatePath(`/coding-contests/${contest.slug}`)
        revalidatePath("/coding-contests")

        return { success: true, message: "Contest updated successfully!" }
    } catch (error) {
        console.error("Update contest error:", error)
        return { success: false, message: "Failed to update contest" }
    }
}

export async function deleteCodingContest(contestId: string): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const contest = await prisma.codingContest.findUnique({
        where: { id: contestId },
    })

    if (!contest) {
        return { success: false, message: "Contest not found" }
    }

    // Check permission
    const isAdmin = await isOrgAdmin(session.user.id, contest.organizationId)
    if (!isAdmin) {
        return { success: false, message: "You don't have permission to delete this contest" }
    }

    try {
        await prisma.codingContest.delete({
            where: { id: contestId },
        })

        revalidatePath("/coding-contests")

        return { success: true, message: "Contest deleted successfully!" }
    } catch (error) {
        console.error("Delete contest error:", error)
        return { success: false, message: "Failed to delete contest" }
    }
}

export async function publishCodingContest(contestId: string): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const contest = await prisma.codingContest.findUnique({
        where: { id: contestId },
        include: {
            questions: true,
        },
    })

    if (!contest) {
        return { success: false, message: "Contest not found" }
    }

    // Check permission
    const isAdmin = await isOrgAdmin(session.user.id, contest.organizationId)
    if (!isAdmin) {
        return { success: false, message: "You don't have permission to publish this contest" }
    }

    // Validation checks
    if (contest.questions.length === 0) {
        return { success: false, message: "Contest must have at least one question" }
    }

    if (new Date(contest.startTime) < new Date()) {
        return { success: false, message: "Start time must be in the future" }
    }

    try {
        await prisma.codingContest.update({
            where: { id: contestId },
            data: { status: "PUBLISHED" },
        })

        revalidatePath(`/coding-contests/${contest.slug}`)
        revalidatePath("/coding-contests")

        return { success: true, message: "Contest published successfully!" }
    } catch (error) {
        console.error("Publish contest error:", error)
        return { success: false, message: "Failed to publish contest" }
    }
}

// ==================== CONTEST QUERIES ====================

export async function getCodingContests(filters?: {
    status?: string
    visibility?: string
    organizationId?: string
    search?: string
    limit?: number
    offset?: number
}) {
    const where: Record<string, unknown> = {}
    
    if (filters?.status) {
        where.status = filters.status
    }
    
    if (filters?.visibility) {
        where.visibility = filters.visibility
    }
    
    if (filters?.organizationId) {
        where.organizationId = filters.organizationId
    }
    
    if (filters?.search) {
        where.OR = [
            { title: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
        ]
    }

    const [contests, total] = await Promise.all([
        prisma.codingContest.findMany({
            where,
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true,
                    },
                },
                _count: {
                    select: {
                        questions: true,
                        participants: true,
                    },
                },
            },
            orderBy: { startTime: "desc" },
            take: filters?.limit ?? 20,
            skip: filters?.offset ?? 0,
        }),
        prisma.codingContest.count({ where }),
    ])

    return { contests, total }
}

export async function getCodingContestBySlug(slug: string) {
    const session = await auth()
    
    const contest = await prisma.codingContest.findUnique({
        where: { slug },
        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                },
            },
            questions: {
                where: { isActive: true },
                orderBy: { order: "asc" },
                select: {
                    id: true,
                    type: true,
                    title: true,
                    difficulty: true,
                    points: true,
                    order: true,
                    tags: true,
                },
            },
            _count: {
                select: {
                    questions: true,
                    participants: true,
                },
            },
        },
    })

    if (!contest) return null

    // Check if current user is admin
    let isAdmin = false
    let isRegistered = false
    let participantId: string | null = null

    if (session?.user?.id) {
        isAdmin = await isOrgAdmin(session.user.id, contest.organizationId)
        
        const participant = await prisma.contestParticipant.findUnique({
            where: {
                contestId_userId: {
                    contestId: contest.id,
                    userId: session.user.id,
                },
            },
        })
        
        isRegistered = !!participant
        participantId = participant?.id ?? null
    }

    return {
        ...contest,
        isAdmin,
        isRegistered,
        participantId,
    }
}

export async function getCodingContestById(id: string) {
    return prisma.codingContest.findUnique({
        where: { id },
        include: {
            organization: true,
            questions: {
                orderBy: { order: "asc" },
                include: {
                    testCases: {
                        orderBy: { order: "asc" },
                    },
                    _count: {
                        select: { submissions: true },
                    },
                },
            },
            _count: {
                select: {
                    participants: true,
                },
            },
        },
    })
}

// ==================== PARTICIPANT REGISTRATION ====================

export async function registerForContest(contestId: string): Promise<ActionResult<{ participantId: string }>> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const contest = await prisma.codingContest.findUnique({
        where: { id: contestId },
        include: {
            _count: {
                select: { participants: true },
            },
        },
    })

    if (!contest) {
        return { success: false, message: "Contest not found" }
    }

    // Check if contest is open for registration
    if (contest.status === "DRAFT" || contest.status === "CANCELLED") {
        return { success: false, message: "This contest is not open for registration" }
    }

    if (contest.status === "ENDED") {
        return { success: false, message: "This contest has ended" }
    }

    // Check max participants
    if (contest.maxParticipants && contest._count.participants >= contest.maxParticipants) {
        return { success: false, message: "This contest has reached maximum participants" }
    }

    // Check if already registered
    const existing = await prisma.contestParticipant.findUnique({
        where: {
            contestId_userId: {
                contestId,
                userId: session.user.id,
            },
        },
    })

    if (existing) {
        return { success: false, message: "You are already registered for this contest" }
    }

    try {
        const participant = await prisma.contestParticipant.create({
            data: {
                contestId,
                userId: session.user.id,
                status: "REGISTERED",
            },
        })

        revalidatePath(`/coding-contests/${contest.slug}`)

        return {
            success: true,
            message: "Successfully registered for the contest!",
            data: { participantId: participant.id },
        }
    } catch (error) {
        console.error("Register error:", error)
        return { success: false, message: "Failed to register for contest" }
    }
}

export async function startContest(contestId: string, browserInfo?: string): Promise<ActionResult<{ participantId: string }>> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const contest = await prisma.codingContest.findUnique({
        where: { id: contestId },
    })

    if (!contest) {
        return { success: false, message: "Contest not found" }
    }

    // Check if contest is live
    const now = new Date()
    if (now < new Date(contest.startTime)) {
        return { success: false, message: "Contest has not started yet" }
    }

    if (now > new Date(contest.endTime) && !contest.allowLateJoin) {
        return { success: false, message: "Contest has ended" }
    }

    // Find participant
    const participant = await prisma.contestParticipant.findUnique({
        where: {
            contestId_userId: {
                contestId,
                userId: session.user.id,
            },
        },
    })

    if (!participant) {
        return { success: false, message: "You are not registered for this contest" }
    }

    if (participant.status === "DISQUALIFIED") {
        return { success: false, message: "You have been disqualified from this contest" }
    }

    if (participant.submittedAt) {
        return { success: false, message: "You have already submitted this contest" }
    }

    try {
        // Update participant status if not already started
        if (!participant.startedAt) {
            await prisma.contestParticipant.update({
                where: { id: participant.id },
                data: {
                    status: "IN_PROGRESS",
                    startedAt: new Date(),
                    browserInfo,
                },
            })
        }

        // Also update contest status to LIVE if it's the start time
        if (contest.status === "PUBLISHED" || contest.status === "REGISTRATION_OPEN") {
            await prisma.codingContest.update({
                where: { id: contestId },
                data: { status: "LIVE" },
            })
        }

        return {
            success: true,
            message: "Contest started!",
            data: { participantId: participant.id },
        }
    } catch (error) {
        console.error("Start contest error:", error)
        return { success: false, message: "Failed to start contest" }
    }
}

export async function submitContest(contestId: string): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const participant = await prisma.contestParticipant.findUnique({
        where: {
            contestId_userId: {
                contestId,
                userId: session.user.id,
            },
        },
    })

    if (!participant) {
        return { success: false, message: "You are not registered for this contest" }
    }

    if (participant.submittedAt) {
        return { success: false, message: "You have already submitted" }
    }

    try {
        // Calculate final score
        const submissions = await prisma.questionSubmission.findMany({
            where: { participantId: participant.id },
        })

        const totalScore = submissions.reduce((sum, s) => sum + s.score, 0)
        const questionsAttempted = submissions.length
        const questionsCorrect = submissions.filter(s => s.isCorrect).length

        await prisma.contestParticipant.update({
            where: { id: participant.id },
            data: {
                status: "SUBMITTED",
                submittedAt: new Date(),
                totalScore,
                questionsAttempted,
                questionsCorrect,
            },
        })

        const contest = await prisma.codingContest.findUnique({
            where: { id: contestId },
        })

        revalidatePath(`/coding-contests/${contest?.slug}/leaderboard`)

        return { success: true, message: "Contest submitted successfully!" }
    } catch (error) {
        console.error("Submit contest error:", error)
        return { success: false, message: "Failed to submit contest" }
    }
}

// ==================== LEADERBOARD ====================

export async function getContestLeaderboard(contestId: string) {
    const participants = await prisma.contestParticipant.findMany({
        where: {
            contestId,
            status: { in: ["SUBMITTED", "IN_PROGRESS"] },
            isDisqualified: false,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
        },
        orderBy: [
            { totalScore: "desc" },
            { submittedAt: "asc" },
        ],
    })

    // Assign ranks
    return participants.map((p, index) => ({
        ...p,
        rank: index + 1,
    }))
}

// ==================== ADMIN HELPERS ====================

export async function getContestParticipants(contestId: string) {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "Unauthorized", participants: [] }
    }

    const contest = await prisma.codingContest.findUnique({
        where: { id: contestId },
    })

    if (!contest) {
        return { success: false, message: "Contest not found", participants: [] }
    }

    const isAdmin = await isOrgAdmin(session.user.id, contest.organizationId)
    if (!isAdmin) {
        return { success: false, message: "Unauthorized", participants: [] }
    }

    const participants = await prisma.contestParticipant.findMany({
        where: { contestId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            violations: true,
            _count: {
                select: { submissions: true },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    return { success: true, participants }
}

export async function disqualifyParticipant(
    participantId: string, 
    reason: string
): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "Unauthorized" }
    }

    const participant = await prisma.contestParticipant.findUnique({
        where: { id: participantId },
        include: { contest: true },
    })

    if (!participant) {
        return { success: false, message: "Participant not found" }
    }

    const isAdmin = await isOrgAdmin(session.user.id, participant.contest.organizationId)
    if (!isAdmin) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await prisma.contestParticipant.update({
            where: { id: participantId },
            data: {
                isDisqualified: true,
                disqualifyReason: reason,
                status: "DISQUALIFIED",
            },
        })

        revalidatePath(`/coding-contests/${participant.contest.slug}/manage/participants`)

        return { success: true, message: "Participant disqualified" }
    } catch (error) {
        console.error("Disqualify error:", error)
        return { success: false, message: "Failed to disqualify participant" }
    }
}

// Helper function to get user's contests (for dashboard)
export async function getUserCodingContests() {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { registered: [], organizing: [] }
    }

    const [registrations, organizerOrgs] = await Promise.all([
        // Contests user is registered for
        prisma.contestParticipant.findMany({
            where: { userId: session.user.id },
            include: {
                contest: {
                    include: {
                        organization: {
                            select: { name: true, slug: true },
                        },
                        _count: {
                            select: { participants: true, questions: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
        // Organizations user is admin of
        prisma.organizationMember.findMany({
            where: {
                userId: session.user.id,
                role: { in: ["OWNER", "ADMIN"] },
            },
            select: { organizationId: true },
        }),
    ])

    // Contests user is organizing
    const organizingContests = await prisma.codingContest.findMany({
        where: {
            organizationId: { in: organizerOrgs.map(o => o.organizationId) },
        },
        include: {
            organization: {
                select: { name: true, slug: true },
            },
            _count: {
                select: { participants: true, questions: true },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    return {
        registered: registrations.map(r => ({
            ...r.contest,
            participantStatus: r.status,
            startedAt: r.startedAt,
            submittedAt: r.submittedAt,
            score: r.totalScore,
        })),
        organizing: organizingContests,
    }
}
