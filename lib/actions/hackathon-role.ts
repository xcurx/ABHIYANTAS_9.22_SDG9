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

type HackathonRoleType = "MENTOR" | "JUDGE" | "ORGANIZER" | "VOLUNTEER" | "SPONSOR_REP"

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

// ==================== INVITE MENTOR/JUDGE ====================

/**
 * Invite a user to be a mentor or judge for a hackathon
 */
export async function inviteHackathonRole(
    hackathonId: string,
    inviteeEmail: string,
    role: HackathonRoleType,
    options?: {
        expertise?: string[]
        bio?: string
        canJudgeAllTracks?: boolean
        assignedTrackIds?: string[]
    }
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Check if current user is an organizer
    const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "Only organizers can invite mentors and judges" }
    }

    // Find the invitee by email
    const invitee = await prisma.user.findUnique({
        where: { email: inviteeEmail },
    })

    if (!invitee) {
        return { success: false, message: "User not found. They must be registered on the platform." }
    }

    // Check if already has this role
    const existingRole = await prisma.hackathonRole.findUnique({
        where: {
            hackathonId_userId_role: {
                hackathonId,
                userId: invitee.id,
                role,
            },
        },
    })

    if (existingRole) {
        if (existingRole.status === "PENDING") {
            return { success: false, message: "An invitation is already pending for this user" }
        }
        if (existingRole.status === "ACCEPTED") {
            return { success: false, message: "User already has this role" }
        }
    }

    const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
        select: { slug: true, title: true },
    })

    if (!hackathon) {
        return { success: false, message: "Hackathon not found" }
    }

    try {
        await prisma.hackathonRole.upsert({
            where: {
                hackathonId_userId_role: {
                    hackathonId,
                    userId: invitee.id,
                    role,
                },
            },
            update: {
                status: "PENDING",
                invitedBy: session.user.id,
                invitedAt: new Date(),
                expertise: options?.expertise || [],
                bio: options?.bio,
                canJudgeAllTracks: options?.canJudgeAllTracks ?? true,
                assignedTrackIds: options?.assignedTrackIds || [],
            },
            create: {
                hackathonId,
                userId: invitee.id,
                role,
                invitedBy: session.user.id,
                expertise: options?.expertise || [],
                bio: options?.bio,
                canJudgeAllTracks: options?.canJudgeAllTracks ?? true,
                assignedTrackIds: options?.assignedTrackIds || [],
            },
        })

        // Create notification for invitee
        await prisma.notification.create({
            data: {
                userId: invitee.id,
                type: "ROLE",
                title: `${role.charAt(0) + role.slice(1).toLowerCase()} Invitation`,
                message: `You've been invited to be a ${role.toLowerCase()} for "${hackathon.title}"`,
                link: `/hackathons/${hackathon.slug}/roles`,
            },
        })

        revalidatePath(`/hackathons/${hackathon.slug}`)
        revalidatePath(`/hackathons/${hackathon.slug}/manage`)

        return { success: true, message: `${role.toLowerCase()} invitation sent successfully` }
    } catch (error) {
        console.error("Invite hackathon role error:", error)
        return { success: false, message: "Failed to send invitation" }
    }
}

/**
 * Respond to a hackathon role invitation
 */
export async function respondToRoleInvitation(
    roleId: string,
    accept: boolean,
    bio?: string
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const roleInvitation = await prisma.hackathonRole.findUnique({
        where: { id: roleId },
        include: {
            hackathon: { select: { slug: true, title: true } },
        },
    })

    if (!roleInvitation) {
        return { success: false, message: "Invitation not found" }
    }

    if (roleInvitation.userId !== session.user.id) {
        return { success: false, message: "This invitation is not for you" }
    }

    if (roleInvitation.status !== "PENDING") {
        return { success: false, message: "This invitation has already been responded to" }
    }

    try {
        await prisma.hackathonRole.update({
            where: { id: roleId },
            data: {
                status: accept ? "ACCEPTED" : "DECLINED",
                acceptedAt: accept ? new Date() : null,
                bio: accept ? bio : undefined,
            },
        })

        // Notify the inviter
        if (roleInvitation.invitedBy) {
            await prisma.notification.create({
                data: {
                    userId: roleInvitation.invitedBy,
                    type: "ROLE",
                    title: `${roleInvitation.role} Invitation ${accept ? "Accepted" : "Declined"}`,
                    message: `${session.user.name || "A user"} has ${accept ? "accepted" : "declined"} the ${roleInvitation.role.toLowerCase()} invitation for "${roleInvitation.hackathon.title}"`,
                    link: `/hackathons/${roleInvitation.hackathon.slug}/manage/roles`,
                },
            })
        }

        revalidatePath(`/hackathons/${roleInvitation.hackathon.slug}`)

        return { 
            success: true, 
            message: accept 
                ? `You are now a ${roleInvitation.role.toLowerCase()} for this hackathon!` 
                : "Invitation declined" 
        }
    } catch (error) {
        console.error("Respond to role invitation error:", error)
        return { success: false, message: "Failed to respond to invitation" }
    }
}

/**
 * Revoke a hackathon role (organizers only)
 */
export async function revokeHackathonRole(roleId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const role = await prisma.hackathonRole.findUnique({
        where: { id: roleId },
        include: {
            hackathon: { select: { slug: true, title: true } },
            user: { select: { name: true } },
        },
    })

    if (!role) {
        return { success: false, message: "Role not found" }
    }

    const isOrganizer = await isHackathonOrganizer(session.user.id, role.hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "Only organizers can revoke roles" }
    }

    try {
        await prisma.hackathonRole.update({
            where: { id: roleId },
            data: { status: "REVOKED" },
        })

        // Notify the user
        await prisma.notification.create({
            data: {
                userId: role.userId,
                type: "ROLE",
                title: "Role Revoked",
                message: `Your ${role.role.toLowerCase()} role for "${role.hackathon.title}" has been revoked`,
                link: `/hackathons/${role.hackathon.slug}`,
            },
        })

        revalidatePath(`/hackathons/${role.hackathon.slug}/manage`)

        return { success: true, message: "Role revoked successfully" }
    } catch (error) {
        console.error("Revoke hackathon role error:", error)
        return { success: false, message: "Failed to revoke role" }
    }
}

/**
 * Update role details
 */
export async function updateHackathonRole(
    roleId: string,
    data: {
        bio?: string
        expertise?: string[]
        canJudgeAllTracks?: boolean
        assignedTrackIds?: string[]
    }
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const role = await prisma.hackathonRole.findUnique({
        where: { id: roleId },
        include: {
            hackathon: { select: { slug: true } },
        },
    })

    if (!role) {
        return { success: false, message: "Role not found" }
    }

    // Either the user themselves or an organizer can update
    const isOrganizer = await isHackathonOrganizer(session.user.id, role.hackathonId)
    if (role.userId !== session.user.id && !isOrganizer) {
        return { success: false, message: "You don't have permission to update this role" }
    }

    try {
        await prisma.hackathonRole.update({
            where: { id: roleId },
            data,
        })

        revalidatePath(`/hackathons/${role.hackathon.slug}`)

        return { success: true, message: "Role updated successfully" }
    } catch (error) {
        console.error("Update hackathon role error:", error)
        return { success: false, message: "Failed to update role" }
    }
}

// ==================== QUERY FUNCTIONS ====================

/**
 * Get mentors and judges for a hackathon
 */
export async function getHackathonRoles(hackathonId: string): Promise<ActionResult<{
    mentors: {
        id: string
        user: { id: string; name: string | null; email: string; avatar: string | null }
        bio: string | null
        expertise: string[]
        status: string
    }[]
    judges: {
        id: string
        user: { id: string; name: string | null; email: string; avatar: string | null }
        bio: string | null
        expertise: string[]
        canJudgeAllTracks: boolean
        status: string
    }[]
}>> {
    const roles = await prisma.hackathonRole.findMany({
        where: {
            hackathonId,
            status: { in: ["PENDING", "ACCEPTED"] },
            role: { in: ["MENTOR", "JUDGE"] },
        },
        include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
        },
    })

    const mentors = roles
        .filter(r => r.role === "MENTOR")
        .map(r => ({
            id: r.id,
            user: r.user,
            bio: r.bio,
            expertise: r.expertise,
            status: r.status,
        }))

    const judges = roles
        .filter(r => r.role === "JUDGE")
        .map(r => ({
            id: r.id,
            user: r.user,
            bio: r.bio,
            expertise: r.expertise,
            canJudgeAllTracks: r.canJudgeAllTracks,
            status: r.status,
        }))

    return {
        success: true,
        message: "Roles fetched",
        data: { mentors, judges },
    }
}

/**
 * Get pending role invitations for the current user
 */
export async function getMyRoleInvitations(): Promise<ActionResult<{
    invitations: {
        id: string
        role: string
        invitedAt: Date
        hackathon: { id: string; title: string; slug: string }
        inviter: { name: string | null } | null
    }[]
}>> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const invitations = await prisma.hackathonRole.findMany({
        where: {
            userId: session.user.id,
            status: "PENDING",
        },
        include: {
            hackathon: { select: { id: true, title: true, slug: true } },
            inviter: { select: { name: true } },
        },
        orderBy: { invitedAt: "desc" },
    })

    return {
        success: true,
        message: "Invitations fetched",
        data: {
            invitations: invitations.map(i => ({
                id: i.id,
                role: i.role,
                invitedAt: i.invitedAt,
                hackathon: i.hackathon,
                inviter: i.inviter,
            })),
        },
    }
}

/**
 * Get my roles for a specific hackathon
 */
export async function getMyHackathonRoles(hackathonId: string): Promise<ActionResult<{
    roles: {
        id: string
        role: string
        status: string
        bio: string | null
        expertise: string[]
    }[]
}>> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const roles = await prisma.hackathonRole.findMany({
        where: {
            hackathonId,
            userId: session.user.id,
            status: "ACCEPTED",
        },
    })

    return {
        success: true,
        message: "Roles fetched",
        data: {
            roles: roles.map(r => ({
                id: r.id,
                role: r.role,
                status: r.status,
                bio: r.bio,
                expertise: r.expertise,
            })),
        },
    }
}
