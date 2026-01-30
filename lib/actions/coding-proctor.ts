"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { reportViolationSchema, type ReportViolationInput } from "@/lib/validations/coding-contest"

export type ActionResult<T = unknown> = {
    success: boolean
    message: string
    data?: T
    errors?: Record<string, string[]>
}

// ==================== VIOLATION REPORTING ====================

export async function reportViolation(
    input: ReportViolationInput
): Promise<ActionResult<{ violationId: string; shouldDisqualify: boolean }>> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const validated = reportViolationSchema.safeParse(input)
    
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    // Verify participant belongs to current user
    const participant = await prisma.contestParticipant.findUnique({
        where: { id: input.participantId },
        include: { contest: true },
    })

    if (!participant) {
        return { success: false, message: "Participant not found" }
    }

    if (participant.userId !== session.user.id) {
        return { success: false, message: "Unauthorized" }
    }

    if (participant.isDisqualified) {
        return { success: false, message: "Already disqualified" }
    }

    try {
        // Create violation record
        const violation = await prisma.proctorViolation.create({
            data: {
                participantId: input.participantId,
                type: input.type,
                details: input.details,
            },
        })

        // Check if this is a tab switch violation
        let shouldDisqualify = false
        let newTabSwitchCount = participant.tabSwitchCount

        if (input.type === "TAB_SWITCH" || input.type === "WINDOW_BLUR") {
            newTabSwitchCount = participant.tabSwitchCount + 1
            
            // Update tab switch count
            await prisma.contestParticipant.update({
                where: { id: input.participantId },
                data: { tabSwitchCount: newTabSwitchCount },
            })

            // Check if exceeded limit
            if (newTabSwitchCount >= participant.contest.tabSwitchLimit) {
                shouldDisqualify = true
            }
        }

        // Certain violations trigger immediate disqualification
        const immediateDisqualifyTypes = [
            "DEVTOOLS_OPEN",
            "SCREEN_CAPTURE_ATTEMPT",
            "MULTIPLE_DISPLAYS",
        ]

        if (immediateDisqualifyTypes.includes(input.type)) {
            shouldDisqualify = true
        }

        // Auto-disqualify if needed
        if (shouldDisqualify) {
            await prisma.contestParticipant.update({
                where: { id: input.participantId },
                data: {
                    isDisqualified: true,
                    disqualifyReason: `Automatic disqualification due to ${input.type}`,
                    status: "DISQUALIFIED",
                },
            })
        }

        return {
            success: true,
            message: "Violation recorded",
            data: {
                violationId: violation.id,
                shouldDisqualify,
            },
        }
    } catch (error) {
        console.error("Report violation error:", error)
        return { success: false, message: "Failed to record violation" }
    }
}

// ==================== INCREMENT TAB SWITCH ====================

export async function incrementTabSwitch(
    participantId: string
): Promise<ActionResult<{ count: number; remaining: number; shouldDisqualify: boolean }>> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const participant = await prisma.contestParticipant.findUnique({
        where: { id: participantId },
        include: { contest: true },
    })

    if (!participant) {
        return { success: false, message: "Participant not found" }
    }

    if (participant.userId !== session.user.id) {
        return { success: false, message: "Unauthorized" }
    }

    if (participant.isDisqualified) {
        return { success: false, message: "Already disqualified" }
    }

    try {
        const newCount = participant.tabSwitchCount + 1
        const limit = participant.contest.tabSwitchLimit
        const remaining = Math.max(0, limit - newCount)
        const shouldDisqualify = newCount >= limit

        // Create violation record
        await prisma.proctorViolation.create({
            data: {
                participantId,
                type: "TAB_SWITCH",
                details: `Tab switch #${newCount}`,
            },
        })

        // Update participant
        await prisma.contestParticipant.update({
            where: { id: participantId },
            data: {
                tabSwitchCount: newCount,
                ...(shouldDisqualify && {
                    isDisqualified: true,
                    disqualifyReason: `Exceeded tab switch limit (${limit})`,
                    status: "DISQUALIFIED",
                }),
            },
        })

        return {
            success: true,
            message: shouldDisqualify 
                ? "You have been disqualified for exceeding the tab switch limit"
                : `Warning: ${remaining} tab switches remaining before disqualification`,
            data: {
                count: newCount,
                remaining,
                shouldDisqualify,
            },
        }
    } catch (error) {
        console.error("Increment tab switch error:", error)
        return { success: false, message: "Failed to record tab switch" }
    }
}

// ==================== GET PROCTORING STATUS ====================

export async function getProctoringStatus(participantId: string) {
    const session = await auth()
    
    if (!session?.user?.id) {
        return null
    }

    const participant = await prisma.contestParticipant.findUnique({
        where: { id: participantId },
        include: {
            contest: {
                select: {
                    proctorEnabled: true,
                    fullScreenRequired: true,
                    tabSwitchLimit: true,
                    copyPasteDisabled: true,
                    webcamRequired: true,
                },
            },
        },
    })

    if (!participant) return null

    // Only allow viewing own status or if admin
    if (participant.userId !== session.user.id) {
        const contest = await prisma.codingContest.findUnique({
            where: { id: participant.contestId },
        })
        
        if (contest) {
            const membership = await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId: session.user.id,
                        organizationId: contest.organizationId,
                    },
                },
            })
            
            if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
                return null
            }
        }
    }

    return {
        isDisqualified: participant.isDisqualified,
        disqualifyReason: participant.disqualifyReason,
        tabSwitchCount: participant.tabSwitchCount,
        tabSwitchLimit: participant.contest.tabSwitchLimit,
        tabSwitchesRemaining: Math.max(0, participant.contest.tabSwitchLimit - participant.tabSwitchCount),
        settings: {
            proctorEnabled: participant.contest.proctorEnabled,
            fullScreenRequired: participant.contest.fullScreenRequired,
            copyPasteDisabled: participant.contest.copyPasteDisabled,
            webcamRequired: participant.contest.webcamRequired,
        },
    }
}

// ==================== GET VIOLATIONS (ADMIN) ====================

export async function getParticipantViolations(participantId: string) {
    const session = await auth()
    
    if (!session?.user?.id) {
        return []
    }

    const participant = await prisma.contestParticipant.findUnique({
        where: { id: participantId },
        include: { contest: true },
    })

    if (!participant) return []

    // Check if admin
    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: participant.contest.organizationId,
            },
        },
    })

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
        return []
    }

    return prisma.proctorViolation.findMany({
        where: { participantId },
        orderBy: { timestamp: "desc" },
    })
}

// ==================== HEARTBEAT ====================

export async function sendHeartbeat(participantId: string): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "Unauthorized" }
    }

    const participant = await prisma.contestParticipant.findUnique({
        where: { id: participantId },
    })

    if (!participant || participant.userId !== session.user.id) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await prisma.contestParticipant.update({
            where: { id: participantId },
            data: { lastActiveAt: new Date() },
        })

        return { success: true, message: "Heartbeat recorded" }
    } catch (error) {
        console.error("Heartbeat error:", error)
        return { success: false, message: "Failed to record heartbeat" }
    }
}
