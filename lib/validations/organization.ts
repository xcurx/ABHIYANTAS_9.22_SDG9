import { z } from "zod"

export const createOrganizationSchema = z.object({
    name: z
        .string()
        .min(2, "Organization name must be at least 2 characters")
        .max(100, "Organization name must be less than 100 characters"),
    slug: z
        .string()
        .min(2, "Slug must be at least 2 characters")
        .max(50, "Slug must be less than 50 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    type: z.enum(["COMPANY", "UNIVERSITY", "NONPROFIT", "GOVERNMENT", "OTHER"]),
    description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
    website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    industry: z.string().max(100).optional(),
    size: z.string().optional(),
    location: z.string().max(200).optional(),
})

export const updateOrganizationSchema = createOrganizationSchema.partial().extend({
    logo: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

export const inviteMemberSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    role: z.enum(["ADMIN", "MEMBER"]),
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
