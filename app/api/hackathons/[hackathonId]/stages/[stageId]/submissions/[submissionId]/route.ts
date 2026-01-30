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

// GET /api/hackathons/[hackathonId]/stages/[stageId]/submissions/[submissionId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ hackathonId: string; stageId: string; submissionId: string }> }
) {
    const { hackathonId, stageId, submissionId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const submission = await prisma.stageSubmission.findUnique({
        where: { id: submissionId, stageId, hackathonId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            stage: {
                select: {
                    name: true,
                    type: true,
                    judgingCriteria: true,
                },
            },
        },
    })

    if (!submission) {
        return NextResponse.json(
            { error: "Submission not found" },
            { status: 404 }
        )
    }

    // Check if user can view this submission
    const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)
    if (submission.userId !== session.user.id && !isOrganizer) {
        return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
        )
    }

    return NextResponse.json(submission)
}

// PATCH /api/hackathons/[hackathonId]/stages/[stageId]/submissions/[submissionId]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ hackathonId: string; stageId: string; submissionId: string }> }
) {
    const { hackathonId, stageId, submissionId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const submission = await prisma.stageSubmission.findUnique({
        where: { id: submissionId, stageId, hackathonId },
        include: {
            stage: true,
        },
    })

    if (!submission) {
        return NextResponse.json(
            { error: "Submission not found" },
            { status: 404 }
        )
    }

    const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)

    // Regular users can only update their own pending submissions
    if (!isOrganizer) {
        if (submission.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            )
        }

        // Check if submission is still editable
        if (submission.status === "APPROVED" || submission.status === "REJECTED") {
            return NextResponse.json(
                { error: "This submission can no longer be edited" },
                { status: 400 }
            )
        }

        // Check deadline
        const now = new Date()
        const deadline = submission.stage.submissionDeadline || submission.stage.endDate
        if (now > deadline && !submission.stage.allowLateSubmission) {
            return NextResponse.json(
                { error: "Submission deadline has passed" },
                { status: 400 }
            )
        }
    }

    const body = await request.json()

    try {
        // Organizers can update status, score, feedback
        // Regular users can update content only
        const updateData = isOrganizer
            ? body
            : {
                title: body.title,
                description: body.description,
                content: body.content,
                links: body.links,
                attachments: body.attachments,
                submittedAt: new Date(),
            }

        const updatedSubmission = await prisma.stageSubmission.update({
            where: { id: submissionId },
            data: updateData,
        })

        return NextResponse.json(updatedSubmission)
    } catch (error) {
        console.error("Update submission error:", error)
        return NextResponse.json(
            { error: "Failed to update submission" },
            { status: 500 }
        )
    }
}

// DELETE /api/hackathons/[hackathonId]/stages/[stageId]/submissions/[submissionId]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ hackathonId: string; stageId: string; submissionId: string }> }
) {
    const { hackathonId, stageId, submissionId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const submission = await prisma.stageSubmission.findUnique({
        where: { id: submissionId, stageId, hackathonId },
    })

    if (!submission) {
        return NextResponse.json(
            { error: "Submission not found" },
            { status: 404 }
        )
    }

    // Check permission
    const isOrganizer = await isHackathonOrganizer(session.user.id, hackathonId)
    if (submission.userId !== session.user.id && !isOrganizer) {
        return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
        )
    }

    try {
        await prisma.stageSubmission.delete({
            where: { id: submissionId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete submission error:", error)
        return NextResponse.json(
            { error: "Failed to delete submission" },
            { status: 500 }
        )
    }
}
