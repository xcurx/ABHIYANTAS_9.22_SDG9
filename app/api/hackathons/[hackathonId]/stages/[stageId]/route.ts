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

// GET /api/hackathons/[hackathonId]/stages/[stageId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ hackathonId: string; stageId: string }> }
) {
    const { hackathonId, stageId } = await params
    const session = await auth()

    // Get hackathon to check visibility
    const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
        select: { isPublic: true },
    })

    if (!hackathon) {
        return NextResponse.json(
            { error: "Hackathon not found" },
            { status: 404 }
        )
    }

    const stage = await prisma.hackathonStage.findUnique({
        where: { id: stageId, hackathonId },
        include: {
            _count: {
                select: { submissions: true },
            },
        },
    })

    if (!stage) {
        return NextResponse.json(
            { error: "Stage not found" },
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

    return NextResponse.json(stage)
}

// PATCH /api/hackathons/[hackathonId]/stages/[stageId]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ hackathonId: string; stageId: string }> }
) {
    const { hackathonId, stageId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)
    if (!isOrganizer) {
        return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
        )
    }

    const stage = await prisma.hackathonStage.findUnique({
        where: { id: stageId, hackathonId },
    })

    if (!stage) {
        return NextResponse.json(
            { error: "Stage not found" },
            { status: 404 }
        )
    }

    const body = await request.json()

    try {
        const updatedStage = await prisma.hackathonStage.update({
            where: { id: stageId },
            data: body,
        })

        return NextResponse.json(updatedStage)
    } catch (error) {
        console.error("Update stage error:", error)
        return NextResponse.json(
            { error: "Failed to update stage" },
            { status: 500 }
        )
    }
}

// DELETE /api/hackathons/[hackathonId]/stages/[stageId]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ hackathonId: string; stageId: string }> }
) {
    const { hackathonId, stageId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)
    if (!isOrganizer) {
        return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
        )
    }

    const stage = await prisma.hackathonStage.findUnique({
        where: { id: stageId, hackathonId },
    })

    if (!stage) {
        return NextResponse.json(
            { error: "Stage not found" },
            { status: 404 }
        )
    }

    try {
        await prisma.hackathonStage.delete({
            where: { id: stageId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete stage error:", error)
        return NextResponse.json(
            { error: "Failed to delete stage" },
            { status: 500 }
        )
    }
}
