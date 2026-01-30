"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createHackathonSchema, updateHackathonSchema, type CreateHackathonInput, type UpdateHackathonInput } from "@/lib/validations/hackathon"
import { slugify } from "@/lib/utils"

export type ActionResult = {
    success: boolean
    message: string
    data?: unknown
    errors?: Record<string, string[]>
}

// Create a new hackathon
export async function createHackathon(input: CreateHackathonInput): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Validate input
    const validated = createHackathonSchema.safeParse(input)

    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    const data = validated.data

    // Check if user is admin/owner of the organization
    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: data.organizationId,
            },
        },
    })

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
        return { success: false, message: "You don't have permission to create hackathons for this organization" }
    }

    // Generate slug if not provided or sanitize provided slug
    const slug = data.slug || slugify(data.title)

    // Check if slug already exists
    const existingHackathon = await prisma.hackathon.findUnique({
        where: { slug },
    })

    if (existingHackathon) {
        return {
            success: false,
            message: "A hackathon with this slug already exists",
            errors: { slug: ["This slug is already taken"] },
        }
    }

    try {
        const { tracks, prizes, stages, ...hackathonData } = data

        const hackathon = await prisma.hackathon.create({
            data: {
                ...hackathonData,
                slug,
                registrationStart: new Date(hackathonData.registrationStart),
                registrationEnd: new Date(hackathonData.registrationEnd),
                hackathonStart: new Date(hackathonData.hackathonStart),
                hackathonEnd: new Date(hackathonData.hackathonEnd),
                resultsDate: hackathonData.resultsDate ? new Date(hackathonData.resultsDate) : null,
                tracks: tracks && tracks.length > 0 ? {
                    create: tracks,
                } : undefined,
                prizes: prizes && prizes.length > 0 ? {
                    create: prizes,
                } : undefined,
                stages: stages && stages.length > 0 ? {
                    create: stages.map((stage, index) => ({
                        ...stage,
                        order: index + 1,
                        startDate: new Date(stage.startDate),
                        endDate: new Date(stage.endDate),
                    })),
                } : undefined,
            },
        })

        revalidatePath("/hackathons")
        revalidatePath(`/organizations/${data.organizationId}`)

        return {
            success: true,
            message: "Hackathon created successfully!",
            data: { slug: hackathon.slug, id: hackathon.id },
        }
    } catch (error) {
        console.error("Create hackathon error:", error)
        return { success: false, message: "Failed to create hackathon" }
    }
}

// Update hackathon
export async function updateHackathon(
    hackathonId: string,
    input: UpdateHackathonInput
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Get the hackathon to check permissions
    const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
        include: { organization: true },
    })

    if (!hackathon) {
        return { success: false, message: "Hackathon not found" }
    }

    // Check if user is admin/owner of the organization
    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: hackathon.organizationId,
            },
        },
    })

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
        return { success: false, message: "You don't have permission to update this hackathon" }
    }

    const validated = updateHackathonSchema.safeParse(input)

    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    const data = validated.data
    const { tracks, prizes, stages, ...hackathonData } = data

    try {
        // Prepare update data
        const updateData: Record<string, unknown> = {}
        
        for (const [key, value] of Object.entries(hackathonData)) {
            if (value !== undefined) {
                if (['registrationStart', 'registrationEnd', 'hackathonStart', 'hackathonEnd', 'resultsDate'].includes(key)) {
                    updateData[key] = value ? new Date(value as string) : null
                } else {
                    updateData[key] = value
                }
            }
        }

        await prisma.hackathon.update({
            where: { id: hackathonId },
            data: updateData,
        })

        revalidatePath("/hackathons")
        revalidatePath(`/hackathons/${hackathon.slug}`)

        return { success: true, message: "Hackathon updated successfully!" }
    } catch (error) {
        console.error("Update hackathon error:", error)
        return { success: false, message: "Failed to update hackathon" }
    }
}

// Update hackathon status
export async function updateHackathonStatus(
    hackathonId: string,
    status: "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "IN_PROGRESS" | "JUDGING" | "COMPLETED" | "CANCELLED"
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
    })

    if (!hackathon) {
        return { success: false, message: "Hackathon not found" }
    }

    // Check permissions
    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: hackathon.organizationId,
            },
        },
    })

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
        return { success: false, message: "You don't have permission to update this hackathon" }
    }

    try {
        await prisma.hackathon.update({
            where: { id: hackathonId },
            data: { status },
        })

        revalidatePath("/hackathons")
        revalidatePath(`/hackathons/${hackathon.slug}`)

        return { success: true, message: `Hackathon status updated to ${status}` }
    } catch (error) {
        console.error("Update status error:", error)
        return { success: false, message: "Failed to update status" }
    }
}

// Delete hackathon
export async function deleteHackathon(hackathonId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
    })

    if (!hackathon) {
        return { success: false, message: "Hackathon not found" }
    }

    // Check permissions - only owner can delete
    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: hackathon.organizationId,
            },
        },
    })

    if (!membership || membership.role !== "OWNER") {
        return { success: false, message: "Only the organization owner can delete hackathons" }
    }

    try {
        await prisma.hackathon.delete({
            where: { id: hackathonId },
        })

        revalidatePath("/hackathons")

        return { success: true, message: "Hackathon deleted successfully" }
    } catch (error) {
        console.error("Delete hackathon error:", error)
        return { success: false, message: "Failed to delete hackathon" }
    }
}

// Get hackathons (public listing)
export async function getHackathons(options?: {
    status?: string
    type?: string
    mode?: string
    search?: string
    organizationId?: string
    page?: number
    limit?: number
}) {
    const {
        status,
        type,
        mode,
        search,
        organizationId,
        page = 1,
        limit = 12,
    } = options || {}

    const where: Record<string, unknown> = {
        isPublic: true,
    }

    // Filter by status - for public, only show certain statuses
    if (status) {
        where.status = status
    } else {
        // By default, show published and active hackathons
        where.status = {
            in: ["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "IN_PROGRESS", "JUDGING", "COMPLETED"],
        }
    }

    if (type) where.type = type
    if (mode) where.mode = mode
    if (organizationId) where.organizationId = organizationId

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { tags: { has: search } },
        ]
    }

    const [hackathons, total] = await Promise.all([
        prisma.hackathon.findMany({
            where,
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        slug: true,
                    },
                },
                _count: {
                    select: {
                        registrations: true,
                        tracks: true,
                    },
                },
            },
            orderBy: [
                { isFeatured: "desc" },
                { hackathonStart: "asc" },
            ],
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.hackathon.count({ where }),
    ])

    return {
        hackathons,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
}

// Get hackathon by slug (public detail)
export async function getHackathonBySlug(slug: string) {
    const session = await auth()

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    slug: true,
                    type: true,
                },
            },
            tracks: true,
            prizes: {
                orderBy: { position: "asc" },
            },
            stages: {
                orderBy: { order: "asc" },
            },
            _count: {
                select: {
                    registrations: true,
                },
            },
        },
    })

    if (!hackathon) {
        return null
    }

    // Check if not public and user is not an organizer
    if (!hackathon.isPublic) {
        if (!session?.user?.id) {
            return null
        }

        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: session.user.id,
                    organizationId: hackathon.organizationId,
                },
            },
        })

        if (!membership) {
            return null
        }
    }

    // Check if user is registered
    let isRegistered = false
    let registrationStatus = null
    let isOrganizer = false

    if (session?.user?.id) {
        const registration = await prisma.hackathonRegistration.findUnique({
            where: {
                hackathonId_userId: {
                    hackathonId: hackathon.id,
                    userId: session.user.id,
                },
            },
        })

        if (registration) {
            isRegistered = true
            registrationStatus = registration.status
        }

        // Check if organizer
        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: session.user.id,
                    organizationId: hackathon.organizationId,
                },
            },
        })

        isOrganizer = !!membership && ["OWNER", "ADMIN"].includes(membership.role)
    }

    return {
        ...hackathon,
        isRegistered,
        registrationStatus,
        isOrganizer,
    }
}

// Get user's registered hackathons
export async function getUserHackathons() {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "Not authenticated", hackathons: [] }
    }

    const registrations = await prisma.hackathonRegistration.findMany({
        where: { userId: session.user.id },
        include: {
            hackathon: {
                include: {
                    organization: {
                        select: {
                            name: true,
                            logo: true,
                        },
                    },
                },
            },
        },
        orderBy: { registeredAt: "desc" },
    })

    const hackathons = registrations.map((r) => ({
        ...r.hackathon,
        registrationStatus: r.status,
        registeredAt: r.registeredAt,
    }))

    return { success: true, hackathons }
}

// Get hackathons managed by user's organizations
export async function getManagedHackathons() {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "Not authenticated", hackathons: [] }
    }

    // Get user's organizations where they are admin/owner
    const memberships = await prisma.organizationMember.findMany({
        where: {
            userId: session.user.id,
            role: { in: ["OWNER", "ADMIN"] },
        },
        select: { organizationId: true },
    })

    const organizationIds = memberships.map((m) => m.organizationId)

    const hackathons = await prisma.hackathon.findMany({
        where: {
            organizationId: { in: organizationIds },
        },
        include: {
            organization: {
                select: {
                    name: true,
                    logo: true,
                    slug: true,
                },
            },
            _count: {
                select: {
                    registrations: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    return { success: true, hackathons }
}

// Register for hackathon
export async function registerForHackathon(hackathonId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in to register" }
    }

    const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
    })

    if (!hackathon) {
        return { success: false, message: "Hackathon not found" }
    }

    // Check if registration is open
    const now = new Date()
    if (hackathon.status !== "REGISTRATION_OPEN" && hackathon.status !== "PUBLISHED") {
        return { success: false, message: "Registration is not open for this hackathon" }
    }

    if (now < hackathon.registrationStart) {
        return { success: false, message: "Registration has not started yet" }
    }

    if (now > hackathon.registrationEnd) {
        return { success: false, message: "Registration has ended" }
    }

    // Check if already registered
    const existingRegistration = await prisma.hackathonRegistration.findUnique({
        where: {
            hackathonId_userId: {
                hackathonId,
                userId: session.user.id,
            },
        },
    })

    if (existingRegistration) {
        return { success: false, message: "You are already registered for this hackathon" }
    }

    // Check max participants
    if (hackathon.maxParticipants) {
        const currentCount = await prisma.hackathonRegistration.count({
            where: {
                hackathonId,
                status: { in: ["PENDING", "APPROVED"] },
            },
        })

        if (currentCount >= hackathon.maxParticipants) {
            return { success: false, message: "This hackathon has reached maximum capacity" }
        }
    }

    try {
        const status = hackathon.requireApproval ? "PENDING" : "APPROVED"

        await prisma.hackathonRegistration.create({
            data: {
                hackathonId,
                userId: session.user.id,
                status,
                approvedAt: status === "APPROVED" ? new Date() : null,
            },
        })

        revalidatePath(`/hackathons/${hackathon.slug}`)
        revalidatePath("/dashboard")

        return {
            success: true,
            message: hackathon.requireApproval
                ? "Registration submitted! Awaiting approval."
                : "Successfully registered for the hackathon!",
        }
    } catch (error) {
        console.error("Registration error:", error)
        return { success: false, message: "Failed to register" }
    }
}

// Cancel registration
export async function cancelRegistration(hackathonId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const registration = await prisma.hackathonRegistration.findUnique({
        where: {
            hackathonId_userId: {
                hackathonId,
                userId: session.user.id,
            },
        },
        include: { hackathon: true },
    })

    if (!registration) {
        return { success: false, message: "Registration not found" }
    }

    // Can only cancel if hackathon hasn't started
    if (registration.hackathon.status === "IN_PROGRESS") {
        return { success: false, message: "Cannot cancel registration after hackathon has started" }
    }

    try {
        await prisma.hackathonRegistration.update({
            where: {
                hackathonId_userId: {
                    hackathonId,
                    userId: session.user.id,
                },
            },
            data: { status: "CANCELLED" },
        })

        revalidatePath(`/hackathons/${registration.hackathon.slug}`)
        revalidatePath("/dashboard")

        return { success: true, message: "Registration cancelled" }
    } catch (error) {
        console.error("Cancel registration error:", error)
        return { success: false, message: "Failed to cancel registration" }
    }
}

// Update registration status (for organizers)
export async function updateRegistrationStatus(
    registrationId: string,
    newStatus: "APPROVED" | "REJECTED"
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const registration = await prisma.hackathonRegistration.findUnique({
        where: { id: registrationId },
        include: {
            hackathon: {
                select: {
                    id: true,
                    slug: true,
                    organizationId: true,
                },
            },
        },
    })

    if (!registration) {
        return { success: false, message: "Registration not found" }
    }

    // Check if user is admin/owner of the organization
    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: registration.hackathon.organizationId,
            },
        },
    })

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
        return { success: false, message: "You don't have permission to manage registrations" }
    }

    try {
        await prisma.hackathonRegistration.update({
            where: { id: registrationId },
            data: {
                status: newStatus,
                approvedAt: newStatus === "APPROVED" ? new Date() : null,
            },
        })

        revalidatePath(`/hackathons/${registration.hackathon.slug}/manage/participants`)

        return {
            success: true,
            message: `Registration ${newStatus.toLowerCase()}`,
        }
    } catch (error) {
        console.error("Update registration status error:", error)
        return { success: false, message: "Failed to update registration status" }
    }
}
