"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export type ActionResult<T = unknown> = {
    success: boolean
    message: string
    data?: T
    errors?: Record<string, string[]>
}

// ==================== VALIDATION SCHEMAS ====================

const createAnnouncementSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    content: z.string().min(10, "Content must be at least 10 characters"),
    type: z.enum(["INFO", "UPDATE", "DEADLINE", "URGENT", "RESULT", "SCHEDULE_CHANGE"]).default("INFO"),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
    hackathonId: z.string().min(1, "Hackathon ID is required"),
    targetAudience: z.enum([
        "ALL",
        "REGISTERED",
        "APPROVED",
        "TEAM_LEADERS",
        "MENTORS",
        "JUDGES",
        "ORGANIZERS"
    ]).default("ALL"),
    publishAt: z.string().optional(),
    expiresAt: z.string().optional().nullable(),
    isPinned: z.boolean().default(false),
    isPublished: z.boolean().default(true),
})

const updateAnnouncementSchema = createAnnouncementSchema.partial().omit({ hackathonId: true })

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>

// ==================== HELPER FUNCTIONS ====================

// Check if user is hackathon organizer
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

// Get target users for an announcement
async function getTargetUsers(
    hackathonId: string,
    targetAudience: string
): Promise<string[]> {
    let userIds: string[] = []

    switch (targetAudience) {
        case "ALL":
        case "REGISTERED":
            // Get all registered users
            const registrations = await prisma.hackathonRegistration.findMany({
                where: { hackathonId },
                select: { userId: true },
            })
            userIds = registrations.map(r => r.userId)
            break

        case "APPROVED":
            // Get only approved users
            const approvedRegistrations = await prisma.hackathonRegistration.findMany({
                where: { hackathonId, status: "APPROVED" },
                select: { userId: true },
            })
            userIds = approvedRegistrations.map(r => r.userId)
            break

        case "ORGANIZERS":
            // Get organization admins/owners
            const hackathon = await prisma.hackathon.findUnique({
                where: { id: hackathonId },
                select: { organizationId: true },
            })
            if (hackathon) {
                const members = await prisma.organizationMember.findMany({
                    where: {
                        organizationId: hackathon.organizationId,
                        role: { in: ["OWNER", "ADMIN"] },
                    },
                    select: { userId: true },
                })
                userIds = members.map(m => m.userId)
            }
            break

        // TODO: Add TEAM_LEADERS, MENTORS, JUDGES when those features are implemented
        default:
            // Default to all registered
            const allRegistrations = await prisma.hackathonRegistration.findMany({
                where: { hackathonId },
                select: { userId: true },
            })
            userIds = allRegistrations.map(r => r.userId)
    }

    return userIds
}

// ==================== ANNOUNCEMENT ACTIONS ====================

export async function createAnnouncement(
    input: CreateAnnouncementInput
): Promise<ActionResult<{ id: string }>> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Validate input
    const validated = createAnnouncementSchema.safeParse(input)
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    const data = validated.data

    // Check if user is organizer
    const isOrganizer = await isHackathonOrganizer(session.user.id, data.hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "You don't have permission to create announcements" }
    }

    try {
        // Create announcement
        const announcement = await prisma.announcement.create({
            data: {
                title: data.title,
                content: data.content,
                type: data.type,
                priority: data.priority,
                hackathonId: data.hackathonId,
                targetAudience: data.targetAudience,
                publishAt: data.publishAt ? new Date(data.publishAt) : new Date(),
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                isPinned: data.isPinned,
                isPublished: data.isPublished,
                authorId: session.user.id,
            },
        })

        // If published, create notifications for target users
        if (data.isPublished) {
            const targetUserIds = await getTargetUsers(data.hackathonId, data.targetAudience)

            // Get hackathon for the link
            const hackathon = await prisma.hackathon.findUnique({
                where: { id: data.hackathonId },
                select: { slug: true },
            })

            // Create notifications in bulk
            if (targetUserIds.length > 0) {
                await prisma.notification.createMany({
                    data: targetUserIds.map(userId => ({
                        userId,
                        type: "ANNOUNCEMENT",
                        title: data.title,
                        message: data.content.slice(0, 200) + (data.content.length > 200 ? "..." : ""),
                        link: hackathon ? `/hackathons/${hackathon.slug}?announcement=${announcement.id}` : undefined,
                        announcementId: announcement.id,
                        hackathonId: data.hackathonId,
                    })),
                })
            }
        }

        revalidatePath(`/hackathons/${data.hackathonId}`)

        return {
            success: true,
            message: "Announcement created successfully",
            data: { id: announcement.id },
        }
    } catch (error) {
        console.error("Create announcement error:", error)
        return { success: false, message: "Failed to create announcement" }
    }
}

export async function updateAnnouncement(
    announcementId: string,
    input: UpdateAnnouncementInput
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Get existing announcement
    const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        select: { hackathonId: true },
    })

    if (!announcement || !announcement.hackathonId) {
        return { success: false, message: "Announcement not found" }
    }

    // Check permissions
    const isOrganizer = await isHackathonOrganizer(session.user.id, announcement.hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "You don't have permission to update this announcement" }
    }

    // Validate input
    const validated = updateAnnouncementSchema.safeParse(input)
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    try {
        await prisma.announcement.update({
            where: { id: announcementId },
            data: {
                ...validated.data,
                publishAt: validated.data.publishAt ? new Date(validated.data.publishAt) : undefined,
                expiresAt: validated.data.expiresAt ? new Date(validated.data.expiresAt) : undefined,
            },
        })

        revalidatePath(`/hackathons/${announcement.hackathonId}`)

        return { success: true, message: "Announcement updated successfully" }
    } catch (error) {
        console.error("Update announcement error:", error)
        return { success: false, message: "Failed to update announcement" }
    }
}

export async function deleteAnnouncement(announcementId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Get existing announcement
    const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        select: { hackathonId: true },
    })

    if (!announcement || !announcement.hackathonId) {
        return { success: false, message: "Announcement not found" }
    }

    // Check permissions
    const isOrganizer = await isHackathonOrganizer(session.user.id, announcement.hackathonId)
    if (!isOrganizer) {
        return { success: false, message: "You don't have permission to delete this announcement" }
    }

    try {
        // Delete announcement (notifications will be cascade deleted)
        await prisma.announcement.delete({
            where: { id: announcementId },
        })

        revalidatePath(`/hackathons/${announcement.hackathonId}`)

        return { success: true, message: "Announcement deleted successfully" }
    } catch (error) {
        console.error("Delete announcement error:", error)
        return { success: false, message: "Failed to delete announcement" }
    }
}

export async function getHackathonAnnouncements(hackathonId: string) {
    const now = new Date()

    return prisma.announcement.findMany({
        where: {
            hackathonId,
            isPublished: true,
            publishAt: { lte: now },
            OR: [
                { expiresAt: null },
                { expiresAt: { gte: now } },
            ],
        },
        orderBy: [
            { isPinned: "desc" },
            { publishAt: "desc" },
        ],
    })
}

export async function getAnnouncementById(announcementId: string) {
    return prisma.announcement.findUnique({
        where: { id: announcementId },
    })
}

// Get all announcements for organizer (including unpublished)
export async function getOrganizerAnnouncements(hackathonId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return []
    }

    const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)
    if (!isOrganizer) {
        return []
    }

    return prisma.announcement.findMany({
        where: { hackathonId },
        orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" },
        ],
    })
}

// ==================== NOTIFICATION ACTIONS ====================

export async function getUserNotifications(options?: {
    unreadOnly?: boolean
    limit?: number
    offset?: number
}) {
    const session = await auth()

    if (!session?.user?.id) {
        return { notifications: [], unreadCount: 0 }
    }

    const { unreadOnly = false, limit = 20, offset = 0 } = options || {}

    const where: { userId: string; isRead?: boolean } = {
        userId: session.user.id,
    }

    if (unreadOnly) {
        where.isRead = false
    }

    const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
            include: {
                announcement: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        priority: true,
                    },
                },
            },
        }),
        prisma.notification.count({
            where: {
                userId: session.user.id,
                isRead: false,
            },
        }),
    ])

    return { notifications, unreadCount }
}

export async function markNotificationAsRead(notificationId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    try {
        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: session.user.id, // Ensure user owns the notification
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        })

        return { success: true, message: "Notification marked as read" }
    } catch (error) {
        console.error("Mark notification read error:", error)
        return { success: false, message: "Failed to mark notification as read" }
    }
}

export async function markAllNotificationsAsRead(): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    try {
        await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        })

        return { success: true, message: "All notifications marked as read" }
    } catch (error) {
        console.error("Mark all notifications read error:", error)
        return { success: false, message: "Failed to mark notifications as read" }
    }
}

export async function deleteNotification(notificationId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    try {
        await prisma.notification.delete({
            where: {
                id: notificationId,
                userId: session.user.id, // Ensure user owns the notification
            },
        })

        return { success: true, message: "Notification deleted" }
    } catch (error) {
        console.error("Delete notification error:", error)
        return { success: false, message: "Failed to delete notification" }
    }
}

export async function deleteAllNotifications(): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    try {
        await prisma.notification.deleteMany({
            where: {
                userId: session.user.id,
            },
        })

        return { success: true, message: "All notifications deleted" }
    } catch (error) {
        console.error("Delete all notifications error:", error)
        return { success: false, message: "Failed to delete notifications" }
    }
}

// Create a system notification (used internally)
export async function createSystemNotification(
    userId: string,
    data: {
        type: "REGISTRATION" | "TEAM" | "SUBMISSION" | "JUDGING" | "DEADLINE" | "STAGE" | "SYSTEM"
        title: string
        message: string
        link?: string
        hackathonId?: string
    }
): Promise<void> {
    await prisma.notification.create({
        data: {
            userId,
            type: data.type,
            title: data.title,
            message: data.message,
            link: data.link,
            hackathonId: data.hackathonId,
        },
    })
}

// Bulk create notifications (for system use)
export async function createBulkNotifications(
    userIds: string[],
    data: {
        type: "REGISTRATION" | "TEAM" | "SUBMISSION" | "JUDGING" | "DEADLINE" | "STAGE" | "SYSTEM"
        title: string
        message: string
        link?: string
        hackathonId?: string
    }
): Promise<void> {
    if (userIds.length === 0) return

    await prisma.notification.createMany({
        data: userIds.map(userId => ({
            userId,
            type: data.type,
            title: data.title,
            message: data.message,
            link: data.link,
            hackathonId: data.hackathonId,
        })),
    })
}
