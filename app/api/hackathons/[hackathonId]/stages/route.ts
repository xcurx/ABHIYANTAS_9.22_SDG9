import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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

// GET /api/hackathons/[hackathonId]/stages
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ hackathonId: string }> }
) {
    const { hackathonId } = await params
    const session = await auth()

    // Get hackathon to check visibility
    const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
        select: {
            id: true,
            isPublic: true,
            organizationId: true,
        },
    })

    if (!hackathon) {
        return NextResponse.json(
            { error: "Hackathon not found" },
            { status: 404 }
        )
    }

    // Check visibility for private hackathons
    if (!hackathon.isPublic) {
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Must be organizer or approved participant
        const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)
        if (!isOrganizer) {
            const registration = await prisma.hackathonRegistration.findUnique({
                where: {
                    hackathonId_userId: {
                        hackathonId,
                        userId: session.user.id,
                    },
                },
            })
            if (registration?.status !== "APPROVED") {
                return NextResponse.json(
                    { error: "Access denied" },
                    { status: 403 }
                )
            }
        }
    }

    const stages = await prisma.hackathonStage.findMany({
        where: { hackathonId },
        orderBy: { order: "asc" },
        select: {
            id: true,
            name: true,
            type: true,
            description: true,
            startDate: true,
            endDate: true,
            order: true,
            isActive: true,
            isCompleted: true,
            requiresSubmission: true,
            submissionDeadline: true,
            allowLateSubmission: true,
            judgingCriteria: true,
        },
    })

    return NextResponse.json(stages)
}
