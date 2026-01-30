import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/stage-templates/[templateId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ templateId: string }> }
) {
    const { templateId } = await params

    const template = await prisma.stageTemplate.findUnique({
        where: { id: templateId },
        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    })

    if (!template) {
        return NextResponse.json(
            { error: "Template not found" },
            { status: 404 }
        )
    }

    // If private template, check access
    if (!template.isPublic && template.organizationId) {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: session.user.id,
                    organizationId: template.organizationId,
                },
            },
        })

        if (!membership) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            )
        }
    }

    return NextResponse.json(template)
}

// PATCH /api/stage-templates/[templateId]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ templateId: string }> }
) {
    const { templateId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const template = await prisma.stageTemplate.findUnique({
        where: { id: templateId },
    })

    if (!template) {
        return NextResponse.json(
            { error: "Template not found" },
            { status: 404 }
        )
    }

    // Check permission - org admin
    let canEdit = false

    if (template.organizationId) {
        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: session.user.id,
                    organizationId: template.organizationId,
                },
            },
        })
        canEdit = membership?.role === "OWNER" || membership?.role === "ADMIN"
    }

    if (!canEdit) {
        return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
        )
    }

    const body = await request.json()

    try {
        const updatedTemplate = await prisma.stageTemplate.update({
            where: { id: templateId },
            data: body,
        })

        return NextResponse.json(updatedTemplate)
    } catch (error) {
        console.error("Update template error:", error)
        return NextResponse.json(
            { error: "Failed to update template" },
            { status: 500 }
        )
    }
}

// DELETE /api/stage-templates/[templateId]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ templateId: string }> }
) {
    const { templateId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const template = await prisma.stageTemplate.findUnique({
        where: { id: templateId },
    })

    if (!template) {
        return NextResponse.json(
            { error: "Template not found" },
            { status: 404 }
        )
    }

    // Check permission - org admin
    let canDelete = false

    if (template.organizationId) {
        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: session.user.id,
                    organizationId: template.organizationId,
                },
            },
        })
        canDelete = membership?.role === "OWNER" || membership?.role === "ADMIN"
    }

    if (!canDelete) {
        return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
        )
    }

    try {
        await prisma.stageTemplate.delete({
            where: { id: templateId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete template error:", error)
        return NextResponse.json(
            { error: "Failed to delete template" },
            { status: 500 }
        )
    }
}
