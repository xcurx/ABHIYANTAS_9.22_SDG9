import { z } from "zod"

// ==================== CODING CONTEST SCHEMAS ====================

// Base schema without refinement for partial use
const codingContestBaseSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(200, "Title must be less than 200 characters"),
    slug: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .max(100, "Slug must be less than 100 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    description: z.string().max(10000, "Description must be less than 10000 characters").optional().or(z.literal("")),
    shortDescription: z.string().max(500, "Short description must be less than 500 characters").optional().or(z.literal("")),
    bannerImage: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? undefined : val),
        z.string().url("Please enter a valid URL").optional()
    ),
    rules: z.string().max(20000, "Rules must be less than 20000 characters").optional().or(z.literal("")),
    organizationId: z.string().min(1, "Organization is required"),
    
    // Timing
    startTime: z.coerce.date({ message: "Start time is required" }),
    endTime: z.coerce.date({ message: "End time is required" }),
    duration: z.coerce.number().min(5, "Duration must be at least 5 minutes").max(600, "Duration must be less than 10 hours"),
    
    // Configuration
    visibility: z.enum(["PUBLIC", "PRIVATE", "INVITE_ONLY", "ORGANIZATION_ONLY"]).default("PUBLIC"),
    maxParticipants: z.coerce.number().min(1).optional().nullable(),
    allowLateJoin: z.boolean().default(false),
    shuffleQuestions: z.boolean().default(true),
    showLeaderboard: z.boolean().default(true),
    showScoresDuring: z.boolean().default(false),
    
    // Proctoring
    proctorEnabled: z.boolean().default(true),
    fullScreenRequired: z.boolean().default(true),
    tabSwitchLimit: z.coerce.number().min(0).max(100).default(3),
    copyPasteDisabled: z.boolean().default(true),
    webcamRequired: z.boolean().default(false),
    
    // Scoring
    negativeMarking: z.boolean().default(false),
    negativePercent: z.coerce.number().min(0).max(100).default(25),
    partialScoring: z.boolean().default(true),
})

export const createCodingContestSchema = codingContestBaseSchema.refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
})

export const updateCodingContestSchema = codingContestBaseSchema.partial().omit({ 
    organizationId: true 
})

// ==================== QUESTION SCHEMAS ====================

const mcqOptionSchema = z.object({
    id: z.string(),
    text: z.string().min(1, "Option text is required"),
    isCorrect: z.boolean(),
})

// Base MCQ schema without refinement for partial use
const mcqQuestionBaseSchema = z.object({
    contestId: z.string().min(1, "Contest ID is required"),
    type: z.literal("MCQ"),
    title: z.string().min(3, "Title must be at least 3 characters").max(500, "Title must be less than 500 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(10000, "Description must be less than 10000 characters"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]).default("MEDIUM"),
    points: z.coerce.number().min(1, "Points must be at least 1").max(1000, "Points must be less than 1000").default(100),
    order: z.coerce.number().min(0).default(0),
    timeLimit: z.coerce.number().min(10).max(3600).optional().nullable(),
    options: z.array(mcqOptionSchema).min(2, "At least 2 options are required").max(10, "Maximum 10 options allowed"),
    allowMultiple: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    explanation: z.string().max(5000).optional(),
})

export const createMCQQuestionSchema = mcqQuestionBaseSchema.refine((data) => {
    const correctOptions = data.options.filter(opt => opt.isCorrect)
    if (data.allowMultiple) {
        return correctOptions.length >= 1
    }
    return correctOptions.length === 1
}, {
    message: "MCQ must have exactly one correct answer (or at least one for multiple select)",
    path: ["options"],
})

export const createCodingQuestionSchema = z.object({
    contestId: z.string().min(1, "Contest ID is required"),
    type: z.literal("CODING"),
    title: z.string().min(3, "Title must be at least 3 characters").max(500, "Title must be less than 500 characters"),
    description: z.string().min(20, "Description must be at least 20 characters").max(50000, "Description must be less than 50000 characters"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]).default("MEDIUM"),
    points: z.coerce.number().min(1, "Points must be at least 1").max(1000, "Points must be less than 1000").default(100),
    order: z.coerce.number().min(0).default(0),
    timeLimit: z.coerce.number().min(1).max(60).optional().nullable(), // seconds per test case
    memoryLimit: z.coerce.number().min(16).max(512).optional().nullable(), // MB
    
    // Coding specific
    starterCode: z.record(z.string(), z.string()).optional(), // {language: code}
    solutionCode: z.record(z.string(), z.string()).optional(),
    constraints: z.string().max(5000).optional(),
    inputFormat: z.string().max(5000).optional(),
    outputFormat: z.string().max(5000).optional(),
    sampleInput: z.string().max(10000).optional(),
    sampleOutput: z.string().max(10000).optional(),
    explanation: z.string().max(10000).optional(),
    hints: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
})

export const updateQuestionSchema = z.union([
    mcqQuestionBaseSchema.partial().omit({ contestId: true, type: true }),
    createCodingQuestionSchema.partial().omit({ contestId: true, type: true }),
])

// ==================== TEST CASE SCHEMAS ====================

export const createTestCaseSchema = z.object({
    questionId: z.string().min(1, "Question ID is required"),
    input: z.string().max(100000, "Input must be less than 100KB"),
    output: z.string().max(100000, "Output must be less than 100KB"),
    isHidden: z.boolean().default(false),
    isSample: z.boolean().default(false),
    points: z.coerce.number().min(0).default(0),
    order: z.coerce.number().min(0).default(0),
    explanation: z.string().max(2000).optional(),
})

export const updateTestCaseSchema = createTestCaseSchema.partial().omit({ questionId: true })

// ==================== SUBMISSION SCHEMAS ====================

export const submitMCQAnswerSchema = z.object({
    participantId: z.string().min(1, "Participant ID is required"),
    questionId: z.string().min(1, "Question ID is required"),
    selectedOptions: z.array(z.string()).min(1, "At least one option must be selected"),
})

export const submitCodeSchema = z.object({
    participantId: z.string().min(1, "Participant ID is required"),
    questionId: z.string().min(1, "Question ID is required"),
    code: z.string().min(1, "Code is required").max(100000, "Code must be less than 100KB"),
    language: z.enum(["python", "javascript", "typescript", "cpp", "c", "java", "go", "rust"]),
})

export const runCodeSchema = z.object({
    code: z.string().min(1, "Code is required").max(100000, "Code must be less than 100KB"),
    language: z.enum(["python", "javascript", "typescript", "cpp", "c", "java", "go", "rust"]),
    input: z.string().max(100000, "Input must be less than 100KB").optional(),
})

// ==================== PARTICIPANT SCHEMAS ====================

export const registerForContestSchema = z.object({
    contestId: z.string().min(1, "Contest ID is required"),
})

export const startContestSchema = z.object({
    contestId: z.string().min(1, "Contest ID is required"),
    browserInfo: z.string().optional(),
})

// ==================== PROCTOR SCHEMAS ====================

export const reportViolationSchema = z.object({
    participantId: z.string().min(1, "Participant ID is required"),
    type: z.enum([
        "TAB_SWITCH",
        "WINDOW_BLUR",
        "COPY_ATTEMPT",
        "PASTE_ATTEMPT",
        "RIGHT_CLICK",
        "FULLSCREEN_EXIT",
        "DEVTOOLS_OPEN",
        "SCREEN_CAPTURE_ATTEMPT",
        "MULTIPLE_DISPLAYS",
        "SUSPICIOUS_BEHAVIOR",
        "IDLE_TIMEOUT"
    ]),
    details: z.string().max(1000).optional(),
})

// ==================== TYPE EXPORTS ====================

export type CreateCodingContestInput = z.infer<typeof createCodingContestSchema>
export type UpdateCodingContestInput = z.infer<typeof updateCodingContestSchema>
export type CreateMCQQuestionInput = z.infer<typeof createMCQQuestionSchema>
export type CreateCodingQuestionInput = z.infer<typeof createCodingQuestionSchema>
export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>
export type UpdateTestCaseInput = z.infer<typeof updateTestCaseSchema>
export type SubmitMCQAnswerInput = z.infer<typeof submitMCQAnswerSchema>
export type SubmitCodeInput = z.infer<typeof submitCodeSchema>
export type RunCodeInput = z.infer<typeof runCodeSchema>
export type RegisterForContestInput = z.infer<typeof registerForContestSchema>
export type ReportViolationInput = z.infer<typeof reportViolationSchema>
