import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST() {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Mark all read error:", error)
        return NextResponse.json({ error: "Failed to mark all as read" }, { status: 500 })
    }
}
