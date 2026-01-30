import { z } from "zod"

export const hackathonBasicInfoSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").max(100, "Slug must be less than 100 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    shortDescription: z.string().max(200, "Short description must be less than 200 characters").optional(),
    description: z.string().min(50, "Description must be at least 50 characters"),
    type: z.enum(["OPEN", "INVITE_ONLY", "ORGANIZATION_ONLY"]),
    mode: z.enum(["VIRTUAL", "IN_PERSON", "HYBRID"]),
    themes: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
})

export const hackathonScheduleSchema = z.object({
    registrationStart: z.string().or(z.date()),
    registrationEnd: z.string().or(z.date()),
    hackathonStart: z.string().or(z.date()),
    hackathonEnd: z.string().or(z.date()),
    resultsDate: z.string().or(z.date()).optional(),
})

export const hackathonConfigSchema = z.object({
    minTeamSize: z.number().min(1).max(10).default(1),
    maxTeamSize: z.number().min(1).max(20).default(4),
    maxParticipants: z.number().min(1).optional().nullable(),
    registrationFee: z.number().min(0).default(0),
    currency: z.string().default("USD"),
    allowSoloParticipants: z.boolean().default(true),
    requireApproval: z.boolean().default(false),
    isPublic: z.boolean().default(true),
})

export const hackathonRulesSchema = z.object({
    rules: z.string().optional(),
    eligibility: z.string().optional(),
})

export const trackSchema = z.object({
    name: z.string().min(2, "Track name must be at least 2 characters"),
    description: z.string().optional(),
    prizeAmount: z.number().min(0).optional().nullable(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
})

export const prizeSchema = z.object({
    title: z.string().min(2, "Prize title must be at least 2 characters"),
    description: z.string().optional(),
    amount: z.number().min(0).optional().nullable(),
    position: z.number().min(1),
    trackId: z.string().optional().nullable(),
})

export const stageSchema = z.object({
    name: z.string().min(2, "Stage name must be at least 2 characters"),
    description: z.string().optional(),
    type: z.enum([
        "REGISTRATION",
        "TEAM_FORMATION",
        "IDEATION",
        "MENTORING_SESSION",
        "CHECKPOINT",
        "DEVELOPMENT",
        "EVALUATION",
        "PRESENTATION",
        "RESULTS",
        "CUSTOM",
    ]),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    isElimination: z.boolean().default(false),
    eliminationType: z.enum(["TOP_N", "PERCENTAGE", "SCORE_THRESHOLD"]).optional().nullable(),
    eliminationValue: z.number().min(0).optional().nullable(),
    requiresSubmission: z.boolean().default(false),
    submissionInstructions: z.string().optional(),
})

export const createHackathonSchema = z.object({
    ...hackathonBasicInfoSchema.shape,
    ...hackathonScheduleSchema.shape,
    ...hackathonConfigSchema.shape,
    ...hackathonRulesSchema.shape,
    organizationId: z.string(),
    tracks: z.array(trackSchema).optional(),
    prizes: z.array(prizeSchema).optional(),
    stages: z.array(stageSchema).optional(),
})

export const updateHackathonSchema = createHackathonSchema.partial().omit({ organizationId: true })

export type HackathonBasicInfo = z.infer<typeof hackathonBasicInfoSchema>
export type HackathonSchedule = z.infer<typeof hackathonScheduleSchema>
export type HackathonConfig = z.infer<typeof hackathonConfigSchema>
export type HackathonRules = z.infer<typeof hackathonRulesSchema>
export type TrackInput = z.infer<typeof trackSchema>
export type PrizeInput = z.infer<typeof prizeSchema>
export type StageInput = z.infer<typeof stageSchema>
export type CreateHackathonInput = z.infer<typeof createHackathonSchema>
export type UpdateHackathonInput = z.infer<typeof updateHackathonSchema>
