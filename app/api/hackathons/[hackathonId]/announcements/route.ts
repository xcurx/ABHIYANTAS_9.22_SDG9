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
    { params }: { params: Promise<{ hackathonId: string }> }
) {
    const { hackathonId } = await params
    const session = await auth()
    
    const searchParams = request.nextUrl.searchParams
    const includeUnpublished = searchParams.get("includeUnpublished") === "true"
    
    const now = new Date()

    // If requesting unpublished, check if user is organizer
    if (includeUnpublished && session?.user?.id) {
        const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)
        if (isOrganizer) {
            const announcements = await prisma.announcement.findMany({
                where: { hackathonId },
                orderBy: [
                    { isPinned: "desc" },
                    { createdAt: "desc" },
                ],
            })
            return NextResponse.json({ announcements })
        }
    }

    // For regular users, only show published and non-expired
    const announcements = await prisma.announcement.findMany({
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

    return NextResponse.json({ announcements })
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ hackathonId: string }> }
) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { hackathonId } = await params

    // Check if user is organizer
    const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)
    if (!isOrganizer) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const body = await request.json()

        // Create announcement
        const announcement = await prisma.announcement.create({
            data: {
                title: body.title,
                content: body.content,
                type: body.type || "INFO",
                priority: body.priority || "NORMAL",
                hackathonId,
                targetAudience: body.targetAudience || "ALL",
                publishAt: body.publishAt ? new Date(body.publishAt) : new Date(),
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
                isPinned: body.isPinned || false,
                isPublished: body.isPublished !== false,
                authorId: session.user.id,
            },
        })

        // If published, create notifications
        if (announcement.isPublished) {
            // Get target users based on audience
            let userIds: string[] = []
            
            const registrations = await prisma.hackathonRegistration.findMany({
                where: {
                    hackathonId,
                    ...(body.targetAudience === "APPROVED" ? { status: "APPROVED" } : {}),
                },
                select: { userId: true },
            })
            userIds = registrations.map(r => r.userId)

            if (userIds.length > 0) {
                const hackathon = await prisma.hackathon.findUnique({
                    where: { id: hackathonId },
                    select: { slug: true },
                })

                await prisma.notification.createMany({
                    data: userIds.map(userId => ({
                        userId,
                        type: "ANNOUNCEMENT" as const,
                        title: announcement.title,
                        message: announcement.content.slice(0, 200) + (announcement.content.length > 200 ? "..." : ""),
                        link: hackathon ? `/hackathons/${hackathon.slug}?announcement=${announcement.id}` : undefined,
                        announcementId: announcement.id,
                        hackathonId,
                    })),
                })
            }
        }

        return NextResponse.json({ announcement }, { status: 201 })
    } catch (error) {
        console.error("Create announcement error:", error)
        return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 })
    }
}
