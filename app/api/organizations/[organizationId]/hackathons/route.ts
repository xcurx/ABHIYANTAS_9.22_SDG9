import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ organizationId: string }> }
) {
    const { organizationId } = await params
    const session = await auth()

    // Check if user is a member of the organization
    let isMember = false
    if (session?.user?.id) {
        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: session.user.id,
                    organizationId,
                },
            },
        })
        isMember = !!membership
    }

    // Build query - members can see all hackathons including drafts
    // Non-members can only see public, non-draft hackathons
    const where: Record<string, unknown> = {
        organizationId,
    }

    if (!isMember) {
        where.isPublic = true
        where.status = {
            not: "DRAFT",
        }
    }

    const hackathons = await prisma.hackathon.findMany({
        where,
        select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            status: true,
            type: true,
            mode: true,
            hackathonStart: true,
            hackathonEnd: true,
            registrationStart: true,
            registrationEnd: true,
            isPublic: true,
            prizePool: true,
            _count: {
                select: {
                    registrations: true,
                    tracks: true,
                },
            },
        },
        orderBy: [
            { status: "asc" },
            { hackathonStart: "desc" },
        ],
    })

    return NextResponse.json({ hackathons })
}
