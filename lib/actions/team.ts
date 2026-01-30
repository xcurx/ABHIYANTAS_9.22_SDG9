"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type ActionResult<T = unknown> = {
    success: boolean
    message: string
    data?: T
    errors?: Record<string, string[]>
}

// ==================== TEAM MANAGEMENT ====================

/**
 * Create a new team for a hackathon
 */
export async function createTeam(
    hackathonId: string,
    name: string,
    description?: string,
    projectIdea?: string
): Promise<ActionResult<{ teamId: string }>> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Check if user is registered for this hackathon
    const registration = await prisma.hackathonRegistration.findUnique({
        where: {
            hackathonId_userId: {
                hackathonId,
                userId: session.user.id,
            },
        },
    })

    if (!registration || registration.status !== "APPROVED") {
        return { success: false, message: "You must be registered and approved for this hackathon" }
    }

    // Check if user is already in a team for this hackathon
    const existingMembership = await prisma.teamMember.findFirst({
        where: {
            userId: session.user.id,
            team: {
                hackathonId,
            },
        },
    })

    if (existingMembership) {
        return { success: false, message: "You are already in a team for this hackathon" }
    }

    // Get hackathon details for team size validation
    const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
        select: { 
            slug: true, 
            minTeamSize: true, 
            maxTeamSize: true,
            allowSoloParticipants: true,
        },
    })

    if (!hackathon) {
        return { success: false, message: "Hackathon not found" }
    }

    try {
        // Create team and add leader as member in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const team = await tx.team.create({
                data: {
                    name,
                    description,
                    projectIdea,
                    hackathonId,
                    leaderId: session.user.id,
                    isComplete: hackathon.minTeamSize <= 1, // Complete if solo is allowed
                },
            })

            await tx.teamMember.create({
                data: {
                    teamId: team.id,
                    userId: session.user.id,
                    role: "LEADER",
                },
            })

            return team
        })

        revalidatePath(`/hackathons/${hackathon.slug}`)
        revalidatePath(`/hackathons/${hackathon.slug}/team`)

        return {
            success: true,
            message: "Team created successfully!",
            data: { teamId: result.id },
        }
    } catch (error: unknown) {
        console.error("Create team error:", error)
        if (error instanceof Error && error.message.includes("Unique constraint")) {
            return { success: false, message: "A team with this name already exists" }
        }
        return { success: false, message: "Failed to create team" }
    }
}

/**
 * Update team details (leader only)
 */
export async function updateTeam(
    teamId: string,
    data: {
        name?: string
        description?: string
        projectIdea?: string
        avatar?: string
    }
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            hackathon: { select: { slug: true } },
        },
    })

    if (!team) {
        return { success: false, message: "Team not found" }
    }

    if (team.leaderId !== session.user.id) {
        return { success: false, message: "Only the team leader can update team details" }
    }

    try {
        await prisma.team.update({
            where: { id: teamId },
            data,
        })

        revalidatePath(`/hackathons/${team.hackathon.slug}`)
        revalidatePath(`/hackathons/${team.hackathon.slug}/team`)

        return { success: true, message: "Team updated successfully" }
    } catch (error) {
        console.error("Update team error:", error)
        return { success: false, message: "Failed to update team" }
    }
}

/**
 * Lock team (no more members can join)
 */
export async function lockTeam(teamId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            hackathon: { select: { slug: true, minTeamSize: true } },
            _count: { select: { members: true } },
        },
    })

    if (!team) {
        return { success: false, message: "Team not found" }
    }

    if (team.leaderId !== session.user.id) {
        return { success: false, message: "Only the team leader can lock the team" }
    }

    if (team._count.members < team.hackathon.minTeamSize) {
        return { 
            success: false, 
            message: `Team needs at least ${team.hackathon.minTeamSize} members to be locked` 
        }
    }

    try {
        await prisma.team.update({
            where: { id: teamId },
            data: { isLocked: true, isComplete: true },
        })

        revalidatePath(`/hackathons/${team.hackathon.slug}`)
        return { success: true, message: "Team locked successfully" }
    } catch (error) {
        console.error("Lock team error:", error)
        return { success: false, message: "Failed to lock team" }
    }
}

/**
 * Leave a team (non-leaders only)
 */
export async function leaveTeam(teamId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const membership = await prisma.teamMember.findUnique({
        where: {
            teamId_userId: {
                teamId,
                userId: session.user.id,
            },
        },
        include: {
            team: {
                include: {
                    hackathon: { select: { slug: true, minTeamSize: true } },
                    _count: { select: { members: true } },
                },
            },
        },
    })

    if (!membership) {
        return { success: false, message: "You are not a member of this team" }
    }

    if (membership.role === "LEADER") {
        return { success: false, message: "Team leader cannot leave. Transfer leadership or delete the team." }
    }

    if (membership.team.isLocked) {
        return { success: false, message: "Cannot leave a locked team" }
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.teamMember.delete({
                where: { id: membership.id },
            })

            // Update team completion status
            const remainingMembers = membership.team._count.members - 1
            if (remainingMembers < membership.team.hackathon.minTeamSize) {
                await tx.team.update({
                    where: { id: teamId },
                    data: { isComplete: false },
                })
            }
        })

        revalidatePath(`/hackathons/${membership.team.hackathon.slug}`)
        return { success: true, message: "You have left the team" }
    } catch (error) {
        console.error("Leave team error:", error)
        return { success: false, message: "Failed to leave team" }
    }
}

/**
 * Transfer team leadership
 */
export async function transferLeadership(
    teamId: string,
    newLeaderId: string
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            hackathon: { select: { slug: true } },
            members: true,
        },
    })

    if (!team) {
        return { success: false, message: "Team not found" }
    }

    if (team.leaderId !== session.user.id) {
        return { success: false, message: "Only the current team leader can transfer leadership" }
    }

    const newLeaderMembership = team.members.find(m => m.userId === newLeaderId)
    if (!newLeaderMembership) {
        return { success: false, message: "The new leader must be a team member" }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Update team leader
            await tx.team.update({
                where: { id: teamId },
                data: { leaderId: newLeaderId },
            })

            // Update member roles
            await tx.teamMember.update({
                where: { id: newLeaderMembership.id },
                data: { role: "LEADER" },
            })

            const oldLeaderMembership = team.members.find(m => m.userId === session.user.id)
            if (oldLeaderMembership) {
                await tx.teamMember.update({
                    where: { id: oldLeaderMembership.id },
                    data: { role: "MEMBER" },
                })
            }
        })

        revalidatePath(`/hackathons/${team.hackathon.slug}`)
        return { success: true, message: "Leadership transferred successfully" }
    } catch (error) {
        console.error("Transfer leadership error:", error)
        return { success: false, message: "Failed to transfer leadership" }
    }
}

/**
 * Delete team (leader only, team must not be locked)
 */
export async function deleteTeam(teamId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            hackathon: { select: { slug: true, status: true } },
        },
    })

    if (!team) {
        return { success: false, message: "Team not found" }
    }

    if (team.leaderId !== session.user.id) {
        return { success: false, message: "Only the team leader can delete the team" }
    }

    if (team.isLocked) {
        return { success: false, message: "Cannot delete a locked team" }
    }

    // Don't allow deletion if hackathon is in progress
    if (["IN_PROGRESS", "JUDGING"].includes(team.hackathon.status)) {
        return { success: false, message: "Cannot delete team after hackathon has started" }
    }

    try {
        await prisma.team.delete({
            where: { id: teamId },
        })

        revalidatePath(`/hackathons/${team.hackathon.slug}`)
        return { success: true, message: "Team deleted successfully" }
    } catch (error) {
        console.error("Delete team error:", error)
        return { success: false, message: "Failed to delete team" }
    }
}

// ==================== TEAM INVITATIONS ====================

/**
 * Send team invitation
 */
export async function sendTeamInvitation(
    teamId: string,
    inviteeEmail: string,
    message?: string
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            hackathon: { select: { slug: true, maxTeamSize: true } },
            _count: { select: { members: true } },
        },
    })

    if (!team) {
        return { success: false, message: "Team not found" }
    }

    if (team.leaderId !== session.user.id) {
        return { success: false, message: "Only the team leader can send invitations" }
    }

    if (team.isLocked) {
        return { success: false, message: "Cannot invite members to a locked team" }
    }

    if (team._count.members >= team.hackathon.maxTeamSize) {
        return { success: false, message: "Team is already at maximum capacity" }
    }

    // Check if invitee exists and is registered
    const invitee = await prisma.user.findUnique({
        where: { email: inviteeEmail },
        include: {
            hackathonRegistrations: {
                where: { hackathonId: team.hackathonId },
            },
        },
    })

    if (!invitee) {
        return { success: false, message: "User not found. They must be registered on the platform." }
    }

    // Check if invitee is registered for this hackathon
    if (invitee.hackathonRegistrations.length === 0 || 
        invitee.hackathonRegistrations[0].status !== "APPROVED") {
        return { success: false, message: "User must be registered and approved for this hackathon" }
    }

    // Check if invitee is already in a team
    const existingMembership = await prisma.teamMember.findFirst({
        where: {
            userId: invitee.id,
            team: { hackathonId: team.hackathonId },
        },
    })

    if (existingMembership) {
        return { success: false, message: "User is already in a team for this hackathon" }
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.teamInvitation.findFirst({
        where: {
            teamId,
            inviteeId: invitee.id,
            status: "PENDING",
        },
    })

    if (existingInvitation) {
        return { success: false, message: "An invitation is already pending for this user" }
    }

    try {
        await prisma.teamInvitation.create({
            data: {
                teamId,
                inviterId: session.user.id,
                inviteeId: invitee.id,
                email: inviteeEmail,
                message,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        })

        // Create notification for invitee
        await prisma.notification.create({
            data: {
                userId: invitee.id,
                type: "TEAM",
                title: "Team Invitation",
                message: `You've been invited to join team "${team.name}"`,
                link: `/hackathons/${team.hackathon.slug}/team/invitations`,
            },
        })

        revalidatePath(`/hackathons/${team.hackathon.slug}`)
        return { success: true, message: "Invitation sent successfully" }
    } catch (error) {
        console.error("Send invitation error:", error)
        return { success: false, message: "Failed to send invitation" }
    }
}

/**
 * Respond to team invitation
 */
export async function respondToTeamInvitation(
    invitationId: string,
    accept: boolean
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const invitation = await prisma.teamInvitation.findUnique({
        where: { id: invitationId },
        include: {
            team: {
                include: {
                    hackathon: { select: { slug: true, maxTeamSize: true, minTeamSize: true } },
                    _count: { select: { members: true } },
                },
            },
        },
    })

    if (!invitation) {
        return { success: false, message: "Invitation not found" }
    }

    if (invitation.inviteeId !== session.user.id) {
        return { success: false, message: "This invitation is not for you" }
    }

    if (invitation.status !== "PENDING") {
        return { success: false, message: "This invitation has already been responded to" }
    }

    if (new Date() > invitation.expiresAt) {
        await prisma.teamInvitation.update({
            where: { id: invitationId },
            data: { status: "EXPIRED" },
        })
        return { success: false, message: "This invitation has expired" }
    }

    if (!accept) {
        await prisma.teamInvitation.update({
            where: { id: invitationId },
            data: { status: "DECLINED", respondedAt: new Date() },
        })
        revalidatePath(`/hackathons/${invitation.team.hackathon.slug}`)
        return { success: true, message: "Invitation declined" }
    }

    // Check if team is still accepting members
    if (invitation.team.isLocked) {
        return { success: false, message: "This team is no longer accepting members" }
    }

    if (invitation.team._count.members >= invitation.team.hackathon.maxTeamSize) {
        return { success: false, message: "This team is already at maximum capacity" }
    }

    // Check if user is already in a team
    const existingMembership = await prisma.teamMember.findFirst({
        where: {
            userId: session.user.id,
            team: { hackathonId: invitation.team.hackathonId },
        },
    })

    if (existingMembership) {
        return { success: false, message: "You are already in a team for this hackathon" }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Add user to team
            await tx.teamMember.create({
                data: {
                    teamId: invitation.teamId,
                    userId: session.user.id,
                    role: "MEMBER",
                },
            })

            // Update invitation status
            await tx.teamInvitation.update({
                where: { id: invitationId },
                data: { status: "ACCEPTED", respondedAt: new Date() },
            })

            // Update team completion status
            const newMemberCount = invitation.team._count.members + 1
            if (newMemberCount >= invitation.team.hackathon.minTeamSize) {
                await tx.team.update({
                    where: { id: invitation.teamId },
                    data: { isComplete: true },
                })
            }
        })

        // Notify team leader
        await prisma.notification.create({
            data: {
                userId: invitation.team.leaderId,
                type: "TEAM",
                title: "Invitation Accepted",
                message: `${session.user.name || "A user"} has joined your team "${invitation.team.name}"`,
                link: `/hackathons/${invitation.team.hackathon.slug}/team`,
            },
        })

        revalidatePath(`/hackathons/${invitation.team.hackathon.slug}`)
        return { success: true, message: "You have joined the team!" }
    } catch (error) {
        console.error("Accept invitation error:", error)
        return { success: false, message: "Failed to join team" }
    }
}

/**
 * Cancel a sent invitation (leader only)
 */
export async function cancelTeamInvitation(invitationId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const invitation = await prisma.teamInvitation.findUnique({
        where: { id: invitationId },
        include: {
            team: {
                include: { hackathon: { select: { slug: true } } },
            },
        },
    })

    if (!invitation) {
        return { success: false, message: "Invitation not found" }
    }

    if (invitation.inviterId !== session.user.id) {
        return { success: false, message: "Only the person who sent the invitation can cancel it" }
    }

    if (invitation.status !== "PENDING") {
        return { success: false, message: "Can only cancel pending invitations" }
    }

    try {
        await prisma.teamInvitation.update({
            where: { id: invitationId },
            data: { status: "CANCELLED" },
        })

        revalidatePath(`/hackathons/${invitation.team.hackathon.slug}`)
        return { success: true, message: "Invitation cancelled" }
    } catch (error) {
        console.error("Cancel invitation error:", error)
        return { success: false, message: "Failed to cancel invitation" }
    }
}

/**
 * Remove a team member (leader only)
 */
export async function removeTeamMember(
    teamId: string,
    memberId: string
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            hackathon: { select: { slug: true, status: true, minTeamSize: true } },
            _count: { select: { members: true } },
        },
    })

    if (!team) {
        return { success: false, message: "Team not found" }
    }

    if (team.leaderId !== session.user.id) {
        return { success: false, message: "Only the team leader can remove members" }
    }

    if (memberId === session.user.id) {
        return { success: false, message: "You cannot remove yourself. Transfer leadership first." }
    }

    if (team.isLocked) {
        return { success: false, message: "Cannot remove members from a locked team" }
    }

    if (["IN_PROGRESS", "JUDGING"].includes(team.hackathon.status)) {
        return { success: false, message: "Cannot remove members after hackathon has started" }
    }

    const membership = await prisma.teamMember.findFirst({
        where: {
            teamId,
            userId: memberId,
        },
    })

    if (!membership) {
        return { success: false, message: "Member not found in team" }
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.teamMember.delete({
                where: { id: membership.id },
            })

            // Update team completion status
            const remainingMembers = team._count.members - 1
            if (remainingMembers < team.hackathon.minTeamSize) {
                await tx.team.update({
                    where: { id: teamId },
                    data: { isComplete: false },
                })
            }
        })

        // Notify removed member
        await prisma.notification.create({
            data: {
                userId: memberId,
                type: "TEAM",
                title: "Removed from Team",
                message: `You have been removed from team "${team.name}"`,
                link: `/hackathons/${team.hackathon.slug}`,
            },
        })

        revalidatePath(`/hackathons/${team.hackathon.slug}`)
        return { success: true, message: "Member removed from team" }
    } catch (error) {
        console.error("Remove member error:", error)
        return { success: false, message: "Failed to remove member" }
    }
}

// ==================== TEAM QUERIES ====================

/**
 * Get team for a hackathon for the current user
 */
export async function getMyTeam(hackathonId: string): Promise<ActionResult<{
    team: {
        id: string
        name: string
        description: string | null
        projectIdea: string | null
        avatar: string | null
        isComplete: boolean
        isLocked: boolean
        leaderId: string
        members: {
            id: string
            role: string
            user: {
                id: string
                name: string | null
                email: string
                avatar: string | null
            }
        }[]
        invitations: {
            id: string
            status: string
            invitee: { name: string | null; email: string } | null
            createdAt: Date
        }[]
    } | null
    hackathon: {
        minTeamSize: number
        maxTeamSize: number
    }
}>> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
        select: { minTeamSize: true, maxTeamSize: true },
    })

    if (!hackathon) {
        return { success: false, message: "Hackathon not found" }
    }

    const membership = await prisma.teamMember.findFirst({
        where: {
            userId: session.user.id,
            team: { hackathonId },
        },
        include: {
            team: {
                include: {
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, avatar: true },
                            },
                        },
                    },
                    invitations: {
                        where: { status: "PENDING" },
                        include: {
                            invitee: { select: { name: true, email: true } },
                        },
                        orderBy: { createdAt: "desc" },
                    },
                },
            },
        },
    })

    return {
        success: true,
        message: "Team fetched",
        data: {
            team: membership?.team ?? null,
            hackathon,
        },
    }
}

/**
 * Get pending invitations for the current user
 */
export async function getMyTeamInvitations(): Promise<ActionResult<{
    invitations: {
        id: string
        message: string | null
        createdAt: Date
        expiresAt: Date
        team: {
            id: string
            name: string
            description: string | null
            hackathon: { id: string; title: string; slug: string }
            leader: { name: string | null; email: string }
            _count: { members: number }
        }
    }[]
}>> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const invitations = await prisma.teamInvitation.findMany({
        where: {
            inviteeId: session.user.id,
            status: "PENDING",
            expiresAt: { gt: new Date() },
        },
        include: {
            team: {
                include: {
                    hackathon: { select: { id: true, title: true, slug: true } },
                    leader: { select: { name: true, email: true } },
                    _count: { select: { members: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    return {
        success: true,
        message: "Invitations fetched",
        data: { invitations },
    }
}

/**
 * Get all teams for a hackathon (for discovery)
 */
export async function getHackathonTeams(
    hackathonId: string,
    options?: { lookingForMembers?: boolean }
): Promise<ActionResult<{
    teams: {
        id: string
        name: string
        description: string | null
        projectIdea: string | null
        avatar: string | null
        isComplete: boolean
        leader: { name: string | null; avatar: string | null }
        _count: { members: number }
    }[]
}>> {
    const teams = await prisma.team.findMany({
        where: {
            hackathonId,
            isLocked: false,
            ...(options?.lookingForMembers ? { isComplete: false } : {}),
        },
        include: {
            leader: { select: { name: true, avatar: true } },
            _count: { select: { members: true } },
        },
        orderBy: { createdAt: "desc" },
    })

    return {
        success: true,
        message: "Teams fetched",
        data: { teams },
    }
}
