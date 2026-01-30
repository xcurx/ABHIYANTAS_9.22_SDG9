import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCodingContestBySlug, getContestLeaderboard } from "@/lib/actions/coding-contest"
import prisma from "@/lib/prisma"

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
        <div className="min-h-screen pattern-bg">
            {/* Premium Header */}
            <header className="relative overflow-hidden border-b border-slate-200/60">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-violet-50/30" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-100/40 via-purple-100/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                
                <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                    <Link href={`/coding-contests/${contest.slug}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-3">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Contest
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold gradient-text">Your Results</h1>
                            <p className="text-slate-500">{contest.title}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Result Card */}
                <div className="glass-card rounded-3xl p-8 mb-8 overflow-hidden">
                    <div className="text-center">
                        {rank <= 3 && (
                            <div className="text-6xl mb-4">
                                {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                            </div>
                        )}
                        <div className="text-5xl font-bold gradient-text mb-2">
                            #{rank}
                        </div>
                        <p className="text-slate-500 mb-8">out of {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}</p>

                        <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 mb-3">
                                    <span className="text-2xl font-bold text-white">{Math.round(earnedScore)}</span>
                                </div>
                                <p className="text-sm text-slate-500">Score</p>
                                <p className="text-xs text-slate-400">out of {maxScore}</p>
                            </div>
                            
                            <div className="w-px h-16 bg-slate-200 hidden md:block" />
                            
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-3">
                                    <span className="text-2xl font-bold text-white">{scorePercentage}%</span>
                                </div>
                                <p className="text-sm text-slate-500">Accuracy</p>
                            </div>
                            
                            <div className="w-px h-16 bg-slate-200 hidden md:block" />
                            
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3">
                                    <span className="text-2xl font-bold text-white">{questionsAttempted}</span>
                                </div>
                                <p className="text-sm text-slate-500">Attempted</p>
                                <p className="text-xs text-slate-400">of {contest.questions.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {mcqQuestions.length > 0 && (
                        <div className="glass-card rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                    <span className="text-white">📝</span>
                                </div>
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">MCQ</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{mcqCorrect}/{mcqQuestions.length}</p>
                            <p className="text-sm text-slate-500">Correct</p>
                        </div>
                    )}
                    
                    {codingQuestions.length > 0 && (
                        <div className="glass-card rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                                    <span className="text-white">💻</span>
                                </div>
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Coding</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{codingPassed}/{codingQuestions.length}</p>
                            <p className="text-sm text-slate-500">Fully Passed</p>
                        </div>
                    )}
                    
                    {codingQuestions.length > 0 && totalTestCases > 0 && (
                        <div className="glass-card rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Test Cases</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{totalTestCasesPassed}/{totalTestCases}</p>
                            <p className="text-sm text-slate-500">Passed</p>
                        </div>
                    )}
                    
                    <div className="glass-card rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Violations</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{participant.violations.length}</p>
                        <p className="text-sm text-slate-500">{participant.tabSwitchCount} tab switches</p>
                    </div>
                </div>

                {/* Question-wise Breakdown */}
                <div className="glass-card rounded-2xl overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/50">
                        <h2 className="text-lg font-bold text-slate-800">Question-wise Breakdown</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {contest.questions
                            .sort((a, b) => a.order - b.order)
                            .map((question, index) => {
                                const bestSubmission = bestSubmissionByQuestion.get(question.id)
                                const isPassed = bestSubmission && bestSubmission.score >= question.points
                                const isPartial = bestSubmission && bestSubmission.score > 0 && bestSubmission.score < question.points
                                const isAttempted = !!bestSubmission

                                return (
                                    <div key={question.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                                isPassed
                                                    ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                                                    : isPartial
                                                    ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20"
                                                    : isAttempted
                                                    ? "bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-lg shadow-red-500/20"
                                                    : "bg-slate-100 text-slate-400"
                                            }`}>
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-slate-800">{question.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100">
                                                        {question.type === "MCQ" ? "📝 MCQ" : "💻 Coding"}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full ${
                                                        question.difficulty === "EASY"
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : question.difficulty === "MEDIUM"
                                                            ? "bg-amber-50 text-amber-600"
                                                            : "bg-red-50 text-red-600"
                                                    }`}>
                                                        {question.difficulty}
                                                    </span>
                                                    {question.type === "CODING" && bestSubmission && (
                                                        <span className="text-slate-400">
                                                            {bestSubmission.testCasesPassed}/{bestSubmission.testCasesTotal} tests
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-bold ${
                                                isPassed ? "text-emerald-600" : isPartial ? "text-amber-600" : isAttempted ? "text-red-500" : "text-slate-400"
                                            }`}>
                                                {bestSubmission ? Math.round(bestSubmission.score) : 0}/{question.points}
                                            </p>
                                            <p className="text-xs text-slate-500">
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
                    <div className="glass-card rounded-2xl overflow-hidden mb-8 border border-red-100">
                        <div className="px-6 py-4 border-b border-red-100 bg-gradient-to-r from-red-50 to-rose-50">
                            <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Recorded Violations
                            </h2>
                        </div>
                        <div className="divide-y divide-red-50">
                            {participant.violations.map((violation) => (
                                <div key={violation.id} className="flex items-center justify-between px-6 py-3 hover:bg-red-50/50 transition-colors">
                                    <div>
                                        <p className="font-medium text-slate-800">{violation.type.replace(/_/g, " ")}</p>
                                        {violation.details && (
                                            <p className="text-sm text-slate-500">{violation.details}</p>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400">
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
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        View Full Leaderboard
                    </Link>
                    <Link
                        href="/coding-contests"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-card text-slate-700 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                        Browse More Contests
                    </Link>
                </div>
            </main>
        </div>
    )
}
