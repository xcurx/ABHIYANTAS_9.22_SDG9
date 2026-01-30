"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import {
    createMCQQuestionSchema,
    createCodingQuestionSchema,
    createTestCaseSchema,
    updateTestCaseSchema,
    type CreateMCQQuestionInput,
    type CreateCodingQuestionInput,
    type CreateTestCaseInput,
    type UpdateTestCaseInput,
} from "@/lib/validations/coding-contest"

export type ActionResult<T = unknown> = {
    success: boolean
    message: string
    data?: T
    errors?: Record<string, string[]>
}

// Helper to check if user can manage contest
async function canManageContest(userId: string, contestId: string): Promise<boolean> {
    const contest = await prisma.codingContest.findUnique({
        where: { id: contestId },
        select: { organizationId: true },
    })

    if (!contest) return false

    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId,
                organizationId: contest.organizationId,
            },
        },
    })

    return membership?.role === "OWNER" || membership?.role === "ADMIN"
}

// ==================== MCQ QUESTIONS ====================

export async function createMCQQuestion(
    input: CreateMCQQuestionInput
): Promise<ActionResult<{ questionId: string }>> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const canManage = await canManageContest(session.user.id, input.contestId)
    if (!canManage) {
        return { success: false, message: "You don't have permission to add questions to this contest" }
    }

    const validated = createMCQQuestionSchema.safeParse(input)
    
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    try {
        // Get the next order number
        const lastQuestion = await prisma.codingQuestion.findFirst({
            where: { contestId: input.contestId },
            orderBy: { order: "desc" },
        })
        const nextOrder = (lastQuestion?.order ?? -1) + 1

        const question = await prisma.codingQuestion.create({
            data: {
                contestId: validated.data.contestId,
                type: "MCQ",
                title: validated.data.title,
                description: validated.data.description,
                difficulty: validated.data.difficulty,
                points: validated.data.points,
                order: validated.data.order || nextOrder,
                timeLimit: validated.data.timeLimit,
                options: validated.data.options,
                allowMultiple: validated.data.allowMultiple,
                tags: validated.data.tags,
                explanation: validated.data.explanation,
            },
        })

        const contest = await prisma.codingContest.findUnique({
            where: { id: input.contestId },
        })

        revalidatePath(`/coding-contests/${contest?.slug}/manage/questions`)

        return {
            success: true,
            message: "MCQ question created successfully!",
            data: { questionId: question.id },
        }
    } catch (error) {
        console.error("Create MCQ question error:", error)
        return { success: false, message: "Failed to create question" }
    }
}

// ==================== CODING QUESTIONS ====================

export async function createCodingQuestion(
    input: CreateCodingQuestionInput
): Promise<ActionResult<{ questionId: string }>> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const canManage = await canManageContest(session.user.id, input.contestId)
    if (!canManage) {
        return { success: false, message: "You don't have permission to add questions to this contest" }
    }

    const validated = createCodingQuestionSchema.safeParse(input)
    
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    try {
        // Get the next order number
        const lastQuestion = await prisma.codingQuestion.findFirst({
            where: { contestId: input.contestId },
            orderBy: { order: "desc" },
        })
        const nextOrder = (lastQuestion?.order ?? -1) + 1

        const question = await prisma.codingQuestion.create({
            data: {
                contestId: validated.data.contestId,
                type: "CODING",
                title: validated.data.title,
                description: validated.data.description,
                difficulty: validated.data.difficulty,
                points: validated.data.points,
                order: validated.data.order || nextOrder,
                timeLimit: validated.data.timeLimit,
                memoryLimit: validated.data.memoryLimit,
                starterCode: validated.data.starterCode,
                solutionCode: validated.data.solutionCode,
                constraints: validated.data.constraints,
                inputFormat: validated.data.inputFormat,
                outputFormat: validated.data.outputFormat,
                sampleInput: validated.data.sampleInput,
                sampleOutput: validated.data.sampleOutput,
                explanation: validated.data.explanation,
                hints: validated.data.hints,
                tags: validated.data.tags,
            },
        })

        const contest = await prisma.codingContest.findUnique({
            where: { id: input.contestId },
        })

        revalidatePath(`/coding-contests/${contest?.slug}/manage/questions`)

        return {
            success: true,
            message: "Coding question created successfully!",
            data: { questionId: question.id },
        }
    } catch (error) {
        console.error("Create coding question error:", error)
        return { success: false, message: "Failed to create question" }
    }
}

// ==================== UPDATE QUESTION ====================

export async function updateQuestion(
    questionId: string,
    input: Partial<CreateMCQQuestionInput | CreateCodingQuestionInput>
): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const question = await prisma.codingQuestion.findUnique({
        where: { id: questionId },
        include: { contest: true },
    })

    if (!question) {
        return { success: false, message: "Question not found" }
    }

    const canManage = await canManageContest(session.user.id, question.contestId)
    if (!canManage) {
        return { success: false, message: "You don't have permission to update this question" }
    }

    // Don't allow updates to questions in live contests
    if (question.contest.status === "LIVE") {
        return { success: false, message: "Cannot modify questions during a live contest" }
    }

    try {
        await prisma.codingQuestion.update({
            where: { id: questionId },
            data: {
                ...input,
                // Don't allow changing type or contestId
                type: undefined,
                contestId: undefined,
            } as Record<string, unknown>,
        })

        revalidatePath(`/coding-contests/${question.contest.slug}/manage/questions`)
        revalidatePath(`/coding-contests/${question.contest.slug}/manage/questions/${questionId}`)

        return { success: true, message: "Question updated successfully!" }
    } catch (error) {
        console.error("Update question error:", error)
        return { success: false, message: "Failed to update question" }
    }
}

// ==================== DELETE QUESTION ====================

export async function deleteQuestion(questionId: string): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const question = await prisma.codingQuestion.findUnique({
        where: { id: questionId },
        include: { contest: true },
    })

    if (!question) {
        return { success: false, message: "Question not found" }
    }

    const canManage = await canManageContest(session.user.id, question.contestId)
    if (!canManage) {
        return { success: false, message: "You don't have permission to delete this question" }
    }

    // Don't allow deletion in live/ended contests
    if (question.contest.status === "LIVE" || question.contest.status === "ENDED") {
        return { success: false, message: "Cannot delete questions from live or ended contests" }
    }

    try {
        await prisma.codingQuestion.delete({
            where: { id: questionId },
        })

        revalidatePath(`/coding-contests/${question.contest.slug}/manage/questions`)

        return { success: true, message: "Question deleted successfully!" }
    } catch (error) {
        console.error("Delete question error:", error)
        return { success: false, message: "Failed to delete question" }
    }
}

// ==================== REORDER QUESTIONS ====================

export async function reorderQuestions(
    contestId: string,
    questionIds: string[]
): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const canManage = await canManageContest(session.user.id, contestId)
    if (!canManage) {
        return { success: false, message: "You don't have permission to reorder questions" }
    }

    try {
        // Update order for each question
        await Promise.all(
            questionIds.map((id, index) =>
                prisma.codingQuestion.update({
                    where: { id },
                    data: { order: index },
                })
            )
        )

        const contest = await prisma.codingContest.findUnique({
            where: { id: contestId },
        })

        revalidatePath(`/coding-contests/${contest?.slug}/manage/questions`)

        return { success: true, message: "Questions reordered successfully!" }
    } catch (error) {
        console.error("Reorder questions error:", error)
        return { success: false, message: "Failed to reorder questions" }
    }
}

// ==================== TEST CASES ====================

export async function createTestCase(
    input: CreateTestCaseInput
): Promise<ActionResult<{ testCaseId: string }>> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const question = await prisma.codingQuestion.findUnique({
        where: { id: input.questionId },
        include: { contest: true },
    })

    if (!question) {
        return { success: false, message: "Question not found" }
    }

    const canManage = await canManageContest(session.user.id, question.contestId)
    if (!canManage) {
        return { success: false, message: "You don't have permission to add test cases" }
    }

    const validated = createTestCaseSchema.safeParse(input)
    
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    try {
        // Get the next order number
        const lastTestCase = await prisma.codingTestCase.findFirst({
            where: { questionId: input.questionId },
            orderBy: { order: "desc" },
        })
        const nextOrder = (lastTestCase?.order ?? -1) + 1

        const testCase = await prisma.codingTestCase.create({
            data: {
                ...validated.data,
                order: validated.data.order || nextOrder,
            },
        })

        revalidatePath(`/coding-contests/${question.contest.slug}/manage/questions/${question.id}`)

        return {
            success: true,
            message: "Test case created successfully!",
            data: { testCaseId: testCase.id },
        }
    } catch (error) {
        console.error("Create test case error:", error)
        return { success: false, message: "Failed to create test case" }
    }
}

export async function updateTestCase(
    testCaseId: string,
    input: UpdateTestCaseInput
): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const testCase = await prisma.codingTestCase.findUnique({
        where: { id: testCaseId },
        include: {
            question: {
                include: { contest: true },
            },
        },
    })

    if (!testCase) {
        return { success: false, message: "Test case not found" }
    }

    const canManage = await canManageContest(session.user.id, testCase.question.contestId)
    if (!canManage) {
        return { success: false, message: "You don't have permission to update this test case" }
    }

    const validated = updateTestCaseSchema.safeParse(input)
    
    if (!validated.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    try {
        await prisma.codingTestCase.update({
            where: { id: testCaseId },
            data: validated.data,
        })

        revalidatePath(`/coding-contests/${testCase.question.contest.slug}/manage/questions/${testCase.questionId}`)

        return { success: true, message: "Test case updated successfully!" }
    } catch (error) {
        console.error("Update test case error:", error)
        return { success: false, message: "Failed to update test case" }
    }
}

export async function deleteTestCase(testCaseId: string): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const testCase = await prisma.codingTestCase.findUnique({
        where: { id: testCaseId },
        include: {
            question: {
                include: { contest: true },
            },
        },
    })

    if (!testCase) {
        return { success: false, message: "Test case not found" }
    }

    const canManage = await canManageContest(session.user.id, testCase.question.contestId)
    if (!canManage) {
        return { success: false, message: "You don't have permission to delete this test case" }
    }

    try {
        await prisma.codingTestCase.delete({
            where: { id: testCaseId },
        })

        revalidatePath(`/coding-contests/${testCase.question.contest.slug}/manage/questions/${testCase.questionId}`)

        return { success: true, message: "Test case deleted successfully!" }
    } catch (error) {
        console.error("Delete test case error:", error)
        return { success: false, message: "Failed to delete test case" }
    }
}

// ==================== BULK IMPORT ====================

export async function bulkImportTestCases(
    questionId: string,
    testCases: Array<{ input: string; output: string; isHidden?: boolean; points?: number }>
): Promise<ActionResult<{ count: number }>> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const question = await prisma.codingQuestion.findUnique({
        where: { id: questionId },
        include: { contest: true },
    })

    if (!question) {
        return { success: false, message: "Question not found" }
    }

    const canManage = await canManageContest(session.user.id, question.contestId)
    if (!canManage) {
        return { success: false, message: "You don't have permission to import test cases" }
    }

    try {
        // Get current max order
        const lastTestCase = await prisma.codingTestCase.findFirst({
            where: { questionId },
            orderBy: { order: "desc" },
        })
        let nextOrder = (lastTestCase?.order ?? -1) + 1

        // Create all test cases
        await prisma.codingTestCase.createMany({
            data: testCases.map((tc, index) => ({
                questionId,
                input: tc.input,
                output: tc.output,
                isHidden: tc.isHidden ?? true,
                points: tc.points ?? 0,
                order: nextOrder + index,
            })),
        })

        revalidatePath(`/coding-contests/${question.contest.slug}/manage/questions/${questionId}`)

        return {
            success: true,
            message: `${testCases.length} test cases imported successfully!`,
            data: { count: testCases.length },
        }
    } catch (error) {
        console.error("Bulk import error:", error)
        return { success: false, message: "Failed to import test cases" }
    }
}

// ==================== QUERY HELPERS ====================

export async function getQuestionById(questionId: string) {
    const session = await auth()
    
    const question = await prisma.codingQuestion.findUnique({
        where: { id: questionId },
        include: {
            contest: {
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    status: true,
                    organizationId: true,
                },
            },
            testCases: {
                orderBy: { order: "asc" },
            },
            _count: {
                select: { submissions: true },
            },
        },
    })

    if (!question) return null

    // Check if user can see full question details (including test cases)
    let canManage = false
    if (session?.user?.id) {
        canManage = await canManageContest(session.user.id, question.contestId)
    }

    // If not admin, hide hidden test cases and solution
    if (!canManage) {
        return {
            ...question,
            testCases: question.testCases.filter(tc => !tc.isHidden),
            solutionCode: null,
        }
    }

    return question
}

export async function getContestQuestions(contestId: string, includeHidden = false) {
    const session = await auth()
    
    const questions = await prisma.codingQuestion.findMany({
        where: { contestId, isActive: true },
        orderBy: { order: "asc" },
        include: {
            testCases: {
                where: includeHidden ? {} : { isHidden: false },
                orderBy: { order: "asc" },
            },
            _count: {
                select: { submissions: true },
            },
        },
    })

    // For non-admins, don't include solution code
    const contest = await prisma.codingContest.findUnique({
        where: { id: contestId },
    })

    let canManage = false
    if (session?.user?.id && contest) {
        canManage = await canManageContest(session.user.id, contestId)
    }

    if (!canManage) {
        return questions.map(q => ({
            ...q,
            solutionCode: null,
        }))
    }

    return questions
}
