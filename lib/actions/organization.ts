"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createOrganizationSchema, updateOrganizationSchema, inviteMemberSchema } from "@/lib/validations/organization"

export type ActionResult = {
    success: boolean
    message: string
    data?: unknown
    errors?: Record<string, string[]>
}

// Helper to generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
}

// Create a new organization
export async function createOrganization(formData: FormData): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const rawData = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string || generateSlug(formData.get("name") as string),
        type: formData.get("type") as string,
        description: formData.get("description") as string || undefined,
        website: formData.get("website") as string || undefined,
        industry: formData.get("industry") as string || undefined,
        size: formData.get("size") as string || undefined,
        location: formData.get("location") as string || undefined,
    }

    const validated = createOrganizationSchema.safeParse(rawData)
    
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors,
        }
    }

    // Check if slug already exists
    const existingOrg = await prisma.organization.findUnique({
        where: { slug: validated.data.slug },
    })

    if (existingOrg) {
        return {
            success: false,
            message: "An organization with this slug already exists",
            errors: { slug: ["This slug is already taken"] },
        }
    }

    try {
        const organization = await prisma.organization.create({
            data: {
                ...validated.data,
                members: {
                    create: {
                        userId: session.user.id,
                        role: "OWNER",
                    },
                },
            },
        })

        revalidatePath("/dashboard")
        revalidatePath("/organizations")

        return {
            success: true,
            message: "Organization created successfully!",
            data: { slug: organization.slug },
        }
    } catch (error) {
        console.error("Create organization error:", error)
        return { success: false, message: "Failed to create organization" }
    }
}

// Update organization data type
type UpdateOrgData = {
    name?: string
    type?: string
    description?: string
    website?: string
    logo?: string
    industry?: string
    size?: string
    location?: string
}

// Update organization
export async function updateOrganization(
    organizationId: string,
    dataOrFormData: UpdateOrgData | FormData
): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Check if user is admin/owner of the organization
    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId,
            },
        },
    })

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
        return { success: false, message: "You don't have permission to update this organization" }
    }

    let rawData: UpdateOrgData
    
    if (dataOrFormData instanceof FormData) {
        rawData = {
            name: dataOrFormData.get("name") as string || undefined,
            type: dataOrFormData.get("type") as string || undefined,
            description: dataOrFormData.get("description") as string || undefined,
            website: dataOrFormData.get("website") as string || undefined,
            logo: dataOrFormData.get("logo") as string || undefined,
            industry: dataOrFormData.get("industry") as string || undefined,
            size: dataOrFormData.get("size") as string || undefined,
            location: dataOrFormData.get("location") as string || undefined,
        }
    } else {
        rawData = dataOrFormData
    }

    // Remove undefined values
    const cleanData = Object.fromEntries(
        Object.entries(rawData).filter(([, v]) => v !== undefined)
    )

    const validated = updateOrganizationSchema.safeParse(cleanData)
    
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors,
        }
    }

    try {
        await prisma.organization.update({
            where: { id: organizationId },
            data: validated.data,
        })

        revalidatePath(`/organizations/${organizationId}`)
        revalidatePath("/dashboard")

        return { success: true, message: "Organization updated successfully!" }
    } catch (error) {
        console.error("Update organization error:", error)
        return { success: false, message: "Failed to update organization" }
    }
}

// Get user's organizations
export async function getUserOrganizations(): Promise<{ success: boolean; organizations?: Array<{ id: string; name: string; slug: string; logo: string | null; type: string; role: string; _count?: { members: number } }>; message?: string }> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "Not authenticated" }
    }

    const memberships = await prisma.organizationMember.findMany({
        where: { userId: session.user.id },
        include: {
            organization: {
                include: {
                    _count: {
                        select: { members: true },
                    },
                },
            },
        },
        orderBy: { joinedAt: "desc" },
    })

    const organizations = memberships.map((m: { organization: { id: string; name: string; slug: string; logo: string | null; type: string; _count: { members: number } }; role: string }) => ({
        ...m.organization,
        role: m.role,
    }))

    return { success: true, organizations }
}

// Get organization by slug
export async function getOrganizationBySlug(slug: string) {
    const session = await auth()

    const organization = await prisma.organization.findUnique({
        where: { slug },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
            },
            _count: {
                select: { members: true },
            },
        },
    })

    if (!organization) {
        return null
    }

    // Check if current user is a member
    const userMembership = session?.user?.id
        ? organization.members.find((m: { user: { id: string } }) => m.user.id === session.user.id)
        : null

    return {
        ...organization,
        isOwner: userMembership?.role === "OWNER",
        isAdmin: userMembership?.role === "ADMIN" || userMembership?.role === "OWNER",
        isMember: !!userMembership,
        userRole: userMembership?.role || null,
    }
}

// Get organization members
export async function getOrganizationMembers(organizationId: string): Promise<{ success: boolean; members?: unknown[]; message?: string }> {
    try {
        const members = await prisma.organizationMember.findMany({
            where: { organizationId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
            orderBy: [
                { role: "asc" }, // OWNER first, then ADMIN, then MEMBER
                { joinedAt: "asc" },
            ],
        })

        return { success: true, members }
    } catch (error) {
        console.error("Failed to get members:", error)
        return { success: false, message: "Failed to load members" }
    }
}

// Add member to organization
export async function addOrganizationMember(
    organizationId: string,
    emailOrFormData: string | FormData,
    role?: "ADMIN" | "MEMBER"
): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Check if user is admin/owner
    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId,
            },
        },
    })

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
        return { success: false, message: "You don't have permission to add members" }
    }

    let rawData: { email: string; role: string }
    
    if (typeof emailOrFormData === "string") {
        rawData = {
            email: emailOrFormData,
            role: role || "MEMBER",
        }
    } else {
        rawData = {
            email: emailOrFormData.get("email") as string,
            role: emailOrFormData.get("role") as string,
        }
    }

    const validated = inviteMemberSchema.safeParse(rawData)
    
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors,
        }
    }

    // Find user by email
    const userToAdd = await prisma.user.findUnique({
        where: { email: validated.data.email },
    })

    if (!userToAdd) {
        return {
            success: false,
            message: "No user found with this email",
            errors: { email: ["No user found with this email"] },
        }
    }

    // Check if already a member
    const existingMembership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: userToAdd.id,
                organizationId,
            },
        },
    })

    if (existingMembership) {
        return {
            success: false,
            message: "This user is already a member",
            errors: { email: ["This user is already a member of this organization"] },
        }
    }

    try {
        await prisma.organizationMember.create({
            data: {
                userId: userToAdd.id,
                organizationId,
                role: validated.data.role,
            },
        })

        revalidatePath(`/organizations`)

        return { success: true, message: `${userToAdd.name || userToAdd.email} added to organization!` }
    } catch (error) {
        console.error("Add member error:", error)
        return { success: false, message: "Failed to add member" }
    }
}

// Remove member from organization
export async function removeOrganizationMember(
    organizationId: string,
    memberUserId: string
): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Check if current user is admin/owner
    const currentMembership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId,
            },
        },
    })

    if (!currentMembership || !["OWNER", "ADMIN"].includes(currentMembership.role)) {
        return { success: false, message: "You don't have permission to remove members" }
    }

    // Get the member to remove
    const memberToRemove = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: memberUserId,
                organizationId,
            },
        },
    })

    if (!memberToRemove) {
        return { success: false, message: "Member not found" }
    }

    // Cannot remove owner
    if (memberToRemove.role === "OWNER") {
        return { success: false, message: "Cannot remove the organization owner" }
    }

    // Admin cannot remove other admins (only owner can)
    if (memberToRemove.role === "ADMIN" && currentMembership.role !== "OWNER") {
        return { success: false, message: "Only the owner can remove admins" }
    }

    try {
        await prisma.organizationMember.delete({
            where: {
                userId_organizationId: {
                    userId: memberUserId,
                    organizationId,
                },
            },
        })

        revalidatePath(`/organizations`)

        return { success: true, message: "Member removed successfully" }
    } catch (error) {
        console.error("Remove member error:", error)
        return { success: false, message: "Failed to remove member" }
    }
}

// Leave organization
export async function leaveOrganization(organizationId: string): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId,
            },
        },
    })

    if (!membership) {
        return { success: false, message: "You are not a member of this organization" }
    }

    // Owner cannot leave (must transfer ownership first)
    if (membership.role === "OWNER") {
        return { success: false, message: "Owner cannot leave. Transfer ownership first." }
    }

    try {
        await prisma.organizationMember.delete({
            where: {
                userId_organizationId: {
                    userId: session.user.id,
                    organizationId,
                },
            },
        })

        revalidatePath("/dashboard")
        revalidatePath("/organizations")

        return { success: true, message: "You have left the organization" }
    } catch (error) {
        console.error("Leave organization error:", error)
        return { success: false, message: "Failed to leave organization" }
    }
}

// Update member role
export async function updateMemberRole(
    organizationId: string,
    memberUserId: string,
    newRole: "ADMIN" | "MEMBER"
): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    // Only owner can change roles
    const currentMembership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId,
            },
        },
    })

    if (!currentMembership || currentMembership.role !== "OWNER") {
        return { success: false, message: "Only the owner can change member roles" }
    }

    const memberToUpdate = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: memberUserId,
                organizationId,
            },
        },
    })

    if (!memberToUpdate) {
        return { success: false, message: "Member not found" }
    }

    if (memberToUpdate.role === "OWNER") {
        return { success: false, message: "Cannot change owner role" }
    }

    try {
        await prisma.organizationMember.update({
            where: {
                userId_organizationId: {
                    userId: memberUserId,
                    organizationId,
                },
            },
            data: { role: newRole },
        })

        revalidatePath(`/organizations`)

        return { success: true, message: "Member role updated" }
    } catch (error) {
        console.error("Update role error:", error)
        return { success: false, message: "Failed to update role" }
    }
}
