import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import type { StageType } from "@/generated/prisma/enums"

// GET /api/stage-templates - Get public templates + organization templates
export async function GET(request: NextRequest) {
    const session = await auth()

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get("organizationId")
    const type = searchParams.get("type")

    // Build query conditions
    const where: {
        isPublic?: boolean
        organizationId?: string
        type?: StageType
    } = {}

    if (organizationId) {
        // If organization specified, show org templates + public templates
        if (session?.user?.id) {
            // Check if user is member of this org
            const membership = await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId: session.user.id,
                        organizationId,
                    },
                },
            })

            if (membership) {
                // Show org private + public templates
                where.organizationId = organizationId
            } else {
                where.isPublic = true
            }
        } else {
            where.isPublic = true
        }
    } else {
        // No org specified, show only public templates
        where.isPublic = true
    }

    if (type) {
        where.type = type as StageType
    }

    const templates = await prisma.stageTemplate.findMany({
        where,
        orderBy: [
            { usageCount: "desc" },
            { createdAt: "desc" },
        ],
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

    return NextResponse.json(templates)
}

// POST /api/stage-templates - Create a new template
export async function POST(request: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const body = await request.json()
    const { organizationId, ...templateData } = body

    // Validate required fields
    if (!templateData.name || !templateData.type) {
        return NextResponse.json(
            { error: "Name and type are required" },
            { status: 400 }
        )
    }

    // If organization specified, check membership
    if (organizationId) {
        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: session.user.id,
                    organizationId,
                },
            },
        })

        if (membership?.role !== "OWNER" && membership?.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Only organization admins can create templates" },
                { status: 403 }
            )
        }
    }

    try {
        const template = await prisma.stageTemplate.create({
            data: {
                ...templateData,
                organizationId: organizationId || null,
                createdById: session.user.id,
            },
        })

        return NextResponse.json(template, { status: 201 })
    } catch (error) {
        console.error("Create template error:", error)
        return NextResponse.json(
            { error: "Failed to create template" },
            { status: 500 }
        )
    }
}
