import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ hackathonId: string; announcementId: string }> }
) {
    const { announcementId } = await params

    const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
    })

    if (!announcement) {
        return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    return NextResponse.json({ announcement })
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ hackathonId: string; announcementId: string }> }
) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { hackathonId, announcementId } = await params

    // Check if user is organizer
    const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)
    if (!isOrganizer) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const body = await request.json()

        const announcement = await prisma.announcement.update({
            where: { id: announcementId },
            data: {
                title: body.title,
                content: body.content,
                type: body.type,
                priority: body.priority,
                targetAudience: body.targetAudience,
                publishAt: body.publishAt ? new Date(body.publishAt) : undefined,
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
                isPinned: body.isPinned,
                isPublished: body.isPublished,
            },
        })

        return NextResponse.json({ announcement })
    } catch (error) {
        console.error("Update announcement error:", error)
        return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ hackathonId: string; announcementId: string }> }
) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { hackathonId, announcementId } = await params

    // Check if user is organizer
    const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)
    if (!isOrganizer) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        await prisma.announcement.delete({
            where: { id: announcementId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete announcement error:", error)
        return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 })
    }
}
