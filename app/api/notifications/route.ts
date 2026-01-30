import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    const where: { userId: string; isRead?: boolean } = {
        userId: session.user.id,
    }

    if (unreadOnly) {
        where.isRead = false
    }

    const [notifications, unreadCount, total] = await Promise.all([
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
        prisma.notification.count({ where }),
    ])

    return NextResponse.json({
        notifications,
        unreadCount,
        total,
        hasMore: offset + notifications.length < total,
    })
}
