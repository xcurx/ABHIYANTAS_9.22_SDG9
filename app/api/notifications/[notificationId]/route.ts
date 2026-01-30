import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ notificationId: string }> }
) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notificationId } = await params

    try {
        const notification = await prisma.notification.update({
            where: {
                id: notificationId,
                userId: session.user.id,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        })

        return NextResponse.json({ notification })
    } catch {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ notificationId: string }> }
) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notificationId } = await params

    try {
        await prisma.notification.delete({
            where: {
                id: notificationId,
                userId: session.user.id,
            },
        })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }
}
