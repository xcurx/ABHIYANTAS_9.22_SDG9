"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import {
    submitMCQAnswerSchema,
    submitCodeSchema,
    type SubmitMCQAnswerInput,
    type SubmitCodeInput,
} from "@/lib/validations/coding-contest"

export type ActionResult<T = unknown> = {
    success: boolean
    message: string
    data?: T
    errors?: Record<string, string[]>
}

type MCQOption = {
    id: string
    text: string
    isCorrect: boolean
}

// ==================== MCQ SUBMISSION ====================

export async function submitMCQAnswer(
    input: SubmitMCQAnswerInput
): Promise<ActionResult<{ isCorrect: boolean; score: number }>> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const validated = submitMCQAnswerSchema.safeParse(input)
    
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    // Verify participant
    const participant = await prisma.contestParticipant.findUnique({
        where: { id: input.participantId },
        include: { contest: true },
    })

    if (!participant) {
        return { success: false, message: "Participant not found" }
    }

    if (participant.userId !== session.user.id) {
        return { success: false, message: "Unauthorized" }
    }

    if (participant.status === "DISQUALIFIED") {
        return { success: false, message: "You have been disqualified" }
    }

    if (participant.submittedAt) {
        return { success: false, message: "Contest already submitted" }
    }

    // Get question
    const question = await prisma.codingQuestion.findUnique({
        where: { id: input.questionId },
    })

    if (!question || question.type !== "MCQ") {
        return { success: false, message: "Question not found or not MCQ type" }
    }

    if (question.contestId !== participant.contestId) {
        return { success: false, message: "Question not in this contest" }
    }

    // Check time limits
    const now = new Date()
    const contest = participant.contest
    
    if (now < new Date(contest.startTime)) {
        return { success: false, message: "Contest has not started" }
    }

    if (now > new Date(contest.endTime)) {
        return { success: false, message: "Contest has ended" }
    }

    // Calculate score
    const options = question.options as MCQOption[]
    const correctOptionIds = options
        .filter((opt: MCQOption) => opt.isCorrect)
        .map((opt: MCQOption) => opt.id)

    const selectedOptions = input.selectedOptions
    
    // Check if answer is correct
    let isCorrect = false
    let score = 0

    if (question.allowMultiple) {
        // For multiple select, all correct answers must be selected
        const selectedSet = new Set(selectedOptions)
        const correctSet = new Set(correctOptionIds)
        isCorrect = selectedSet.size === correctSet.size && 
                    [...selectedSet].every(id => correctSet.has(id))
    } else {
        // For single select, must match the correct option
        isCorrect = selectedOptions.length === 1 && 
                    correctOptionIds.includes(selectedOptions[0])
    }

    if (isCorrect) {
        score = question.points
    } else if (contest.negativeMarking) {
        score = -(question.points * (contest.negativePercent / 100))
    }

    try {
        // Get existing submission count for this question
        const existingCount = await prisma.questionSubmission.count({
            where: {
                participantId: input.participantId,
                questionId: input.questionId,
            },
        })

        // Create or update submission
        const existingSubmission = await prisma.questionSubmission.findFirst({
            where: {
                participantId: input.participantId,
                questionId: input.questionId,
            },
            orderBy: { submittedAt: "desc" },
        })

        let submission
        if (existingSubmission) {
            submission = await prisma.questionSubmission.update({
                where: { id: existingSubmission.id },
                data: {
                    selectedOptions,
                    isCorrect,
                    score,
                    attemptNumber: existingCount + 1,
                    submittedAt: new Date(),
                },
            })
        } else {
            submission = await prisma.questionSubmission.create({
                data: {
                    participantId: input.participantId,
                    questionId: input.questionId,
                    selectedOptions,
                    isCorrect,
                    score,
                    attemptNumber: 1,
                },
            })
        }

        // Update participant's total score
        await updateParticipantScore(input.participantId)

        return {
            success: true,
            message: isCorrect ? "Correct answer!" : "Answer submitted",
            data: { isCorrect, score },
        }
    } catch (error) {
        console.error("Submit MCQ error:", error)
        return { success: false, message: "Failed to submit answer" }
    }
}

// ==================== CODE SUBMISSION ====================

export async function submitCode(
    input: SubmitCodeInput
): Promise<ActionResult<{
    isCorrect: boolean
    score: number
    testCasesPassed: number
    testCasesTotal: number
    results: Array<{
        passed: boolean
        executionTime?: number
        error?: string
    }>
}>> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const validated = submitCodeSchema.safeParse(input)
    
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    // Verify participant
    const participant = await prisma.contestParticipant.findUnique({
        where: { id: input.participantId },
        include: { contest: true },
    })

    if (!participant) {
        return { success: false, message: "Participant not found" }
    }

    if (participant.userId !== session.user.id) {
        return { success: false, message: "Unauthorized" }
    }

    if (participant.status === "DISQUALIFIED") {
        return { success: false, message: "You have been disqualified" }
    }

    if (participant.submittedAt) {
        return { success: false, message: "Contest already submitted" }
    }

    // Get question with test cases
    const question = await prisma.codingQuestion.findUnique({
        where: { id: input.questionId },
        include: {
            testCases: {
                orderBy: { order: "asc" },
            },
        },
    })

    if (!question || question.type !== "CODING") {
        return { success: false, message: "Question not found or not coding type" }
    }

    if (question.contestId !== participant.contestId) {
        return { success: false, message: "Question not in this contest" }
    }

    // Check time limits
    const now = new Date()
    const contest = participant.contest
    
    if (now < new Date(contest.startTime)) {
        return { success: false, message: "Contest has not started" }
    }

    if (now > new Date(contest.endTime)) {
        return { success: false, message: "Contest has ended" }
    }

    try {
        // Execute code against test cases
        const testResults = await executeCodeAgainstTestCases(
            input.code,
            input.language,
            question.testCases,
            question.timeLimit,
            question.memoryLimit
        )

        const testCasesPassed = testResults.filter(r => r.passed).length
        const testCasesTotal = question.testCases.length
        const isCorrect = testCasesPassed === testCasesTotal

        // Calculate score
        let score = 0
        if (isCorrect) {
            score = question.points
        } else if (contest.partialScoring) {
            // Partial scoring: proportional to test cases passed
            // Also consider per-test-case points if defined
            const hasIndividualPoints = question.testCases.some(tc => tc.points > 0)
            
            if (hasIndividualPoints) {
                score = testResults.reduce((sum, r, i) => {
                    if (r.passed) {
                        return sum + (question.testCases[i].points || 0)
                    }
                    return sum
                }, 0)
            } else {
                score = (testCasesPassed / testCasesTotal) * question.points
            }
        }

        // Get existing submission count
        const existingCount = await prisma.questionSubmission.count({
            where: {
                participantId: input.participantId,
                questionId: input.questionId,
            },
        })

        // Create submission
        const submission = await prisma.questionSubmission.create({
            data: {
                participantId: input.participantId,
                questionId: input.questionId,
                code: input.code,
                language: input.language,
                isCorrect,
                score,
                testCasesPassed,
                testCasesTotal,
                executionTime: testResults.reduce((sum, r) => sum + (r.executionTime || 0), 0) / testResults.length,
                attemptNumber: existingCount + 1,
                testResults: {
                    createMany: {
                        data: testResults.map((r, i) => ({
                            testCaseIndex: i,
                            passed: r.passed,
                            actualOutput: r.actualOutput,
                            expectedOutput: r.expectedOutput,
                            executionTime: r.executionTime,
                            memoryUsed: r.memoryUsed,
                            status: r.status,
                            error: r.error,
                        })),
                    },
                },
            },
        })

        // Update participant's total score
        await updateParticipantScore(input.participantId)

        // Return results (hide outputs for hidden test cases)
        const visibleResults = testResults.map((r, i) => ({
            passed: r.passed,
            executionTime: r.executionTime,
            error: r.error,
            isHidden: question.testCases[i].isHidden,
        }))

        return {
            success: true,
            message: isCorrect ? "All test cases passed!" : `${testCasesPassed}/${testCasesTotal} test cases passed`,
            data: {
                isCorrect,
                score,
                testCasesPassed,
                testCasesTotal,
                results: visibleResults,
            },
        }
    } catch (error) {
        console.error("Submit code error:", error)
        return { success: false, message: "Failed to submit code" }
    }
}

// ==================== RUN CODE (WITHOUT SUBMISSION) ====================

export async function runCode(
    code: string,
    language: string,
    input: string
): Promise<ActionResult<{
    output: string
    executionTime: number
    memoryUsed: number
    error?: string
}>> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    try {
        const result = await executeCode(code, language, input)

        return {
            success: true,
            message: "Code executed",
            data: {
                output: result.output,
                executionTime: result.executionTime,
                memoryUsed: result.memoryUsed,
                error: result.error,
            },
        }
    } catch (error) {
        console.error("Run code error:", error)
        return { success: false, message: "Failed to execute code" }
    }
}

// ==================== CODE EXECUTION HELPERS ====================

// This is a mock implementation. In production, use Judge0 API or similar
type TestCaseData = {
    id: string
    input: string
    output: string
    isHidden: boolean
    points: number
}

type TestCaseResult = {
    passed: boolean
    actualOutput?: string
    expectedOutput?: string
    executionTime?: number
    memoryUsed?: number
    status: "PASSED" | "FAILED" | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED" | "RUNTIME_ERROR" | "COMPILATION_ERROR"
    error?: string
}

async function executeCodeAgainstTestCases(
    code: string,
    language: string,
    testCases: TestCaseData[],
    timeLimit?: number | null,
    memoryLimit?: number | null
): Promise<TestCaseResult[]> {
    // In a real implementation, you would:
    // 1. Send code to a sandboxed execution environment (Judge0, HackerRank API, etc.)
    // 2. Run against each test case
    // 3. Collect results

    // For now, return a mock implementation
    // TODO: Integrate with Judge0 API or self-hosted code runner
    
    const results: TestCaseResult[] = []
    
    for (const testCase of testCases) {
        try {
            const result = await executeCode(code, language, testCase.input, timeLimit, memoryLimit)
            
            const passed = result.output.trim() === testCase.output.trim()
            
            results.push({
                passed,
                actualOutput: result.output,
                expectedOutput: testCase.output,
                executionTime: result.executionTime,
                memoryUsed: result.memoryUsed,
                status: passed ? "PASSED" : "FAILED",
                error: result.error,
            })
        } catch (error) {
            results.push({
                passed: false,
                expectedOutput: testCase.output,
                status: "RUNTIME_ERROR",
                error: error instanceof Error ? error.message : "Unknown error",
            })
        }
    }
    
    return results
}

async function executeCode(
    code: string,
    language: string,
    input?: string,
    timeLimit?: number | null,
    memoryLimit?: number | null
): Promise<{
    output: string
    executionTime: number
    memoryUsed: number
    error?: string
}> {
    // Mock implementation - in production, use Judge0 API
    // Judge0 API endpoint: https://judge0-ce.p.rapidapi.com/submissions
    
    // Language ID mapping for Judge0:
    const languageIds: Record<string, number> = {
        python: 71,      // Python 3
        javascript: 63,  // JavaScript (Node.js)
        typescript: 74,  // TypeScript
        cpp: 54,         // C++ (GCC)
        c: 50,           // C (GCC)
        java: 62,        // Java
        go: 60,          // Go
        rust: 73,        // Rust
    }

    // Check if Judge0 API is configured
    const judge0ApiKey = process.env.JUDGE0_API_KEY
    const judge0Host = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com"

    if (judge0ApiKey) {
        // Use Judge0 API
        try {
            const languageId = languageIds[language]
            if (!languageId) {
                return {
                    output: "",
                    executionTime: 0,
                    memoryUsed: 0,
                    error: `Unsupported language: ${language}`,
                }
            }

            // Create submission
            const createResponse = await fetch(`https://${judge0Host}/submissions?base64_encoded=true&wait=true`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-RapidAPI-Key": judge0ApiKey,
                    "X-RapidAPI-Host": judge0Host,
                },
                body: JSON.stringify({
                    language_id: languageId,
                    source_code: Buffer.from(code).toString("base64"),
                    stdin: input ? Buffer.from(input).toString("base64") : "",
                    cpu_time_limit: timeLimit || 5,
                    memory_limit: (memoryLimit || 128) * 1024, // Convert MB to KB
                }),
            })

            const result = await createResponse.json()

            // Decode outputs
            const stdout = result.stdout ? Buffer.from(result.stdout, "base64").toString() : ""
            const stderr = result.stderr ? Buffer.from(result.stderr, "base64").toString() : ""
            const compileOutput = result.compile_output ? Buffer.from(result.compile_output, "base64").toString() : ""

            return {
                output: stdout,
                executionTime: parseFloat(result.time) * 1000 || 0, // Convert to ms
                memoryUsed: (result.memory || 0) / 1024, // Convert to MB
                error: stderr || compileOutput || undefined,
            }
        } catch (error) {
            console.error("Judge0 API error:", error)
            return {
                output: "",
                executionTime: 0,
                memoryUsed: 0,
                error: "Code execution service temporarily unavailable",
            }
        }
    }

    // Fallback: Mock response for development
    console.warn("Judge0 API not configured, using mock response")
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return {
        output: "Mock output - Configure JUDGE0_API_KEY for real execution",
        executionTime: 50,
        memoryUsed: 10,
    }
}

// ==================== HELPER FUNCTIONS ====================

async function updateParticipantScore(participantId: string) {
    // Get all submissions for this participant
    const submissions = await prisma.questionSubmission.findMany({
        where: { participantId },
    })

    // Group by question and take the best score
    const questionScores = new Map<string, number>()
    
    for (const sub of submissions) {
        const currentBest = questionScores.get(sub.questionId) || 0
        if (sub.score > currentBest) {
            questionScores.set(sub.questionId, sub.score)
        }
    }

    const totalScore = Array.from(questionScores.values()).reduce((sum, s) => sum + s, 0)
    const questionsAttempted = questionScores.size
    const questionsCorrect = Array.from(questionScores.entries())
        .filter(([, score]) => {
            // A question is "correct" if it has the max possible score
            return score > 0
        }).length

    await prisma.contestParticipant.update({
        where: { id: participantId },
        data: {
            totalScore,
            questionsAttempted,
            questionsCorrect,
            lastActiveAt: new Date(),
        },
    })
}

// ==================== GET SUBMISSIONS ====================

export async function getParticipantSubmissions(participantId: string, questionId?: string) {
    const session = await auth()
    
    if (!session?.user?.id) {
        return []
    }

    const participant = await prisma.contestParticipant.findUnique({
        where: { id: participantId },
    })

    if (!participant) return []

    // Check if user is the participant or an admin
    if (participant.userId !== session.user.id) {
        // Check if admin
        const contest = await prisma.codingContest.findUnique({
            where: { id: participant.contestId },
        })
        
        if (contest) {
            const membership = await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId: session.user.id,
                        organizationId: contest.organizationId,
                    },
                },
            })
            
            if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
                return []
            }
        }
    }

    const where: Record<string, unknown> = { participantId }
    if (questionId) {
        where.questionId = questionId
    }

    return prisma.questionSubmission.findMany({
        where,
        include: {
            question: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    points: true,
                },
            },
            testResults: true,
        },
        orderBy: { submittedAt: "desc" },
    })
}

export async function getQuestionSubmissionStatus(participantId: string) {
    // Get the best submission for each question
    const submissions = await prisma.questionSubmission.findMany({
        where: { participantId },
        orderBy: [
            { questionId: "asc" },
            { score: "desc" },
        ],
    })

    // Get best submission per question
    const bestSubmissions = new Map<string, typeof submissions[0]>()
    
    for (const sub of submissions) {
        if (!bestSubmissions.has(sub.questionId)) {
            bestSubmissions.set(sub.questionId, sub)
        }
    }

    return Object.fromEntries(bestSubmissions)
}
