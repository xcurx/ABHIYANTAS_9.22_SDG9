import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCodingContestBySlug, getContestLeaderboard } from "@/lib/actions/coding-contest"
import prisma from "@/lib/prisma"
import { Trophy, ArrowLeft, CheckCircle, Target, FileText, AlertTriangle } from "lucide-react"

export default async function ResultsPage({
    params,
}: {
    params: Promise<{ contestId: string }>
}) {
    const session = await auth()
    const { contestId } = await params

    if (!session) {
        redirect("/sign-in")
    }

    const contest = await getCodingContestBySlug(contestId)

    if (!contest) {
        notFound()
    }

    // Get participant info with all submissions
    const participant = await prisma.contestParticipant.findUnique({
        where: {
            contestId_userId: {
                contestId: contest.id,
                userId: session.user.id!,
            }
        },
        include: {
            submissions: {
                include: {
                    question: true,
                    testResults: true,
                }
            },
            violations: {
                orderBy: { timestamp: "desc" }
            }
        }
    })

    if (!participant) {
        redirect(`/coding-contests/${contest.slug}`)
    }

    // Get leaderboard to find rank
    const leaderboard = await getContestLeaderboard(contest.id)
    const rank = leaderboard.findIndex(p => p.userId === session.user.id) + 1
    const totalParticipants = leaderboard.length

    // Calculate max possible score from all questions
    const maxScore = contest.questions.reduce((sum, q) => sum + q.points, 0)
    
    // Get best submission for each question (for accurate stats)
    const bestSubmissionByQuestion = new Map<string, typeof participant.submissions[0]>()
    for (const submission of participant.submissions) {
        const existing = bestSubmissionByQuestion.get(submission.questionId)
        if (!existing || submission.score > existing.score) {
            bestSubmissionByQuestion.set(submission.questionId, submission)
        }
    }
    
    // Calculate actual earned score from best submissions only
    const earnedScore = Array.from(bestSubmissionByQuestion.values())
        .reduce((sum, sub) => sum + sub.score, 0)
    
    // Accuracy should never exceed 100%
    const scorePercentage = maxScore > 0 ? Math.min(Math.round((earnedScore / maxScore) * 100), 100) : 0

    // Calculate stats based on question types
    const mcqQuestions = contest.questions.filter(q => q.type === "MCQ")
    const codingQuestions = contest.questions.filter(q => q.type === "CODING")
    
    // Count correct MCQs (full score)
    let mcqCorrect = 0
    for (const q of mcqQuestions) {
        const bestSub = bestSubmissionByQuestion.get(q.id)
        if (bestSub && bestSub.score >= q.points) {
            mcqCorrect++
        }
    }
    
    // Count fully passed coding questions
    let codingPassed = 0
    for (const q of codingQuestions) {
        const bestSub = bestSubmissionByQuestion.get(q.id)
        if (bestSub && bestSub.score >= q.points) {
            codingPassed++
        }
    }

    // Calculate total test cases stats for coding
    let totalTestCasesPassed = 0
    let totalTestCases = 0
    for (const q of codingQuestions) {
        const bestSub = bestSubmissionByQuestion.get(q.id)
        if (bestSub) {
            totalTestCasesPassed += bestSub.testCasesPassed
            totalTestCases += bestSub.testCasesTotal
        }
    }

    // Questions attempted = questions with at least one submission
    const questionsAttempted = bestSubmissionByQuestion.size

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-blue-600 text-white">
                <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                    <Link href={`/coding-contests/${contest.slug}`} className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors mb-3">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Contest
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Your Results</h1>
                            <p className="text-blue-200">{contest.title}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Result Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8 overflow-hidden">
                    <div className="text-center">
                        {rank <= 3 && (
                            <div className="text-6xl mb-4">
                                {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                            </div>
                        )}
                        <div className="text-5xl font-bold text-blue-600 mb-2">
                            #{rank}
                        </div>
                        <p className="text-gray-500 mb-8">out of {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}</p>

                        <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center mb-3">
                                    <span className="text-2xl font-bold text-white">{Math.round(earnedScore)}</span>
                                </div>
                                <p className="text-sm text-gray-500">Score</p>
                                <p className="text-xs text-gray-400">out of {maxScore}</p>
                            </div>
                            
                            <div className="w-px h-16 bg-gray-200 hidden md:block" />
                            
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-green-600 flex items-center justify-center mb-3">
                                    <span className="text-2xl font-bold text-white">{scorePercentage}%</span>
                                </div>
                                <p className="text-sm text-gray-500">Accuracy</p>
                            </div>
                            
                            <div className="w-px h-16 bg-gray-200 hidden md:block" />
                            
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500 flex items-center justify-center mb-3">
                                    <span className="text-2xl font-bold text-white">{questionsAttempted}</span>
                                </div>
                                <p className="text-sm text-gray-500">Attempted</p>
                                <p className="text-xs text-gray-400">of {contest.questions.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {mcqQuestions.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-amber-600" />
                                </div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">MCQ</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{mcqCorrect}/{mcqQuestions.length}</p>
                            <p className="text-sm text-gray-500">Correct</p>
                        </div>
                    )}
                    
                    {codingQuestions.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600">💻</span>
                                </div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Coding</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{codingPassed}/{codingQuestions.length}</p>
                            <p className="text-sm text-gray-500">Fully Passed</p>
                        </div>
                    )}
                    
                    {codingQuestions.length > 0 && totalTestCases > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Test Cases</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{totalTestCasesPassed}/{totalTestCases}</p>
                            <p className="text-sm text-gray-500">Passed</p>
                        </div>
                    )}
                    
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Violations</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{participant.violations.length}</p>
                        <p className="text-sm text-gray-500">{participant.tabSwitchCount} tab switches</p>
                    </div>
                </div>

                {/* Question-wise Breakdown */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-900">Question-wise Breakdown</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {contest.questions
                            .sort((a, b) => a.order - b.order)
                            .map((question, index) => {
                                const bestSubmission = bestSubmissionByQuestion.get(question.id)
                                const isPassed = bestSubmission && bestSubmission.score >= question.points
                                const isPartial = bestSubmission && bestSubmission.score > 0 && bestSubmission.score < question.points
                                const isAttempted = !!bestSubmission

                                return (
                                    <div key={question.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                                isPassed
                                                    ? "bg-green-100 text-green-600"
                                                    : isPartial
                                                    ? "bg-amber-100 text-amber-600"
                                                    : isAttempted
                                                    ? "bg-red-100 text-red-600"
                                                    : "bg-gray-100 text-gray-400"
                                            }`}>
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-gray-900">{question.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100">
                                                        {question.type === "MCQ" ? "📝 MCQ" : "💻 Coding"}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full ${
                                                        question.difficulty === "EASY"
                                                            ? "bg-green-100 text-green-700"
                                                            : question.difficulty === "MEDIUM"
                                                            ? "bg-amber-100 text-amber-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}>
                                                        {question.difficulty}
                                                    </span>
                                                    {question.type === "CODING" && bestSubmission && (
                                                        <span className="text-gray-400">
                                                            {bestSubmission.testCasesPassed}/{bestSubmission.testCasesTotal} tests
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-bold ${
                                                isPassed ? "text-green-600" : isPartial ? "text-amber-600" : isAttempted ? "text-red-500" : "text-gray-400"
                                            }`}>
                                                {bestSubmission ? Math.round(bestSubmission.score) : 0}/{question.points}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {isPassed ? "✓ Full Score" : isPartial ? "Partial" : isAttempted ? "✗ Failed" : "Not Attempted"}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>

                {/* Violations (if any) */}
                {participant.violations.length > 0 && (
                    <div className="bg-white border border-red-200 rounded-2xl overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-red-100 bg-red-50">
                            <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Recorded Violations
                            </h2>
                        </div>
                        <div className="divide-y divide-red-50">
                            {participant.violations.map((violation) => (
                                <div key={violation.id} className="flex items-center justify-between px-6 py-3 hover:bg-red-50/50 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900">{violation.type.replace(/_/g, " ")}</p>
                                        {violation.details && (
                                            <p className="text-sm text-gray-500">{violation.details}</p>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {new Date(violation.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Link
                        href={`/coding-contests/${contest.slug}/leaderboard`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <Trophy className="w-5 h-5" />
                        View Full Leaderboard
                    </Link>
                    <Link
                        href="/coding-contests"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Browse More Contests
                    </Link>
                </div>
            </main>
        </div>
    )
}
