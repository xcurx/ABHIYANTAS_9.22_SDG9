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

// GET /api/hackathons/[hackathonId]/stages/[stageId]/submissions
export async function GET(
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

    const stage = await prisma.hackathonStage.findUnique({
        where: { id: stageId, hackathonId },
    })

    if (!stage) {
        return NextResponse.json(
            { error: "Stage not found" },
            { status: 404 }
        )
    }

    const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)

    if (isOrganizer) {
        // Organizers can see all submissions with user info
        const submissions = await prisma.stageSubmission.findMany({
            where: { stageId },
            orderBy: { submittedAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        })
        return NextResponse.json(submissions)
    }

    // Regular users can only see their own submission
    const submission = await prisma.stageSubmission.findUnique({
        where: {
            stageId_userId: {
                stageId,
                userId: session.user.id,
            },
        },
    })

    return NextResponse.json(submission ? [submission] : [])
}

// POST /api/hackathons/[hackathonId]/stages/[stageId]/submissions
export async function POST(
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

    const stage = await prisma.hackathonStage.findUnique({
        where: { id: stageId, hackathonId },
    })

    if (!stage) {
        return NextResponse.json(
            { error: "Stage not found" },
            { status: 404 }
        )
    }

    // Check if user is approved participant
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
            { error: "You must be an approved participant" },
            { status: 403 }
        )
    }

    // Check if stage accepts submissions
    if (!stage.requiresSubmission) {
        return NextResponse.json(
            { error: "This stage does not accept submissions" },
            { status: 400 }
        )
    }

    // Check if stage is active
    if (!stage.isActive) {
        return NextResponse.json(
            { error: "This stage is not active" },
            { status: 400 }
        )
    }

    // Check deadline
    const now = new Date()
    const deadline = stage.submissionDeadline || stage.endDate
    const isLate = now > deadline

    if (isLate && !stage.allowLateSubmission) {
        return NextResponse.json(
            { error: "Submission deadline has passed" },
            { status: 400 }
        )
    }

    // Check for existing submission
    const existingSubmission = await prisma.stageSubmission.findUnique({
        where: {
            stageId_userId: {
                stageId,
                userId: session.user.id,
            },
        },
    })

    if (existingSubmission) {
        return NextResponse.json(
            { error: "You already have a submission for this stage" },
            { status: 400 }
        )
    }

    const body = await request.json()

    try {
        const submission = await prisma.stageSubmission.create({
            data: {
                stageId,
                hackathonId,
                userId: session.user.id,
                title: body.title,
                description: body.description,
                content: body.content,
                links: body.links,
                attachments: body.attachments,
                status: "SUBMITTED",
                isLate,
            },
        })

        return NextResponse.json(submission, { status: 201 })
    } catch (error) {
        console.error("Create submission error:", error)
        return NextResponse.json(
            { error: "Failed to create submission" },
            { status: 500 }
        )
    }
}
