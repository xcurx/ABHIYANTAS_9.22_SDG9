import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCodingContestById, getContestLeaderboard } from "@/lib/actions/coding-contest"
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

    const contest = await getCodingContestById(contestId)

    if (!contest) {
        notFound()
    }

    // Get participant info
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

    const maxScore = contest.questions.reduce((sum, q) => sum + q.points, 0)
    const scorePercentage = maxScore > 0 ? Math.round((participant.totalScore / maxScore) * 100) : 0

    // Calculate stats
    const mcqQuestions = contest.questions.filter(q => q.type === "MCQ")
    const codingQuestions = contest.questions.filter(q => q.type === "CODING")
    
    const mcqSubmissions = participant.submissions.filter(s => 
        mcqQuestions.some(q => q.id === s.questionId)
    )
    const codingSubmissions = participant.submissions.filter(s => 
        codingQuestions.some(q => q.id === s.questionId)
    )

    const mcqCorrect = mcqSubmissions.filter(s => s.score === s.question.points).length
    const codingPassed = codingSubmissions.filter(s => s.score === s.question.points).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
                    <Link href={`/coding-contests/${contest.slug}`} className="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Contest
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Your Results</h1>
                    <p className="text-gray-400">{contest.title}</p>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Result Card */}
                <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-2xl p-8 mb-8 text-center">
                    {rank <= 3 && (
                        <div className="text-6xl mb-4">
                            {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                        </div>
                    )}
                    <div className="text-5xl font-bold text-white mb-2">
                        #{rank}
                    </div>
                    <p className="text-gray-400 mb-6">out of {totalParticipants} participants</p>

                    <div className="flex items-center justify-center gap-8">
                        <div>
                            <p className="text-4xl font-bold text-purple-400">{participant.totalScore}</p>
                            <p className="text-sm text-gray-400">Score</p>
                        </div>
                        <div className="w-px h-12 bg-white/20"></div>
                        <div>
                            <p className="text-4xl font-bold text-blue-400">{scorePercentage}%</p>
                            <p className="text-sm text-gray-400">Accuracy</p>
                        </div>
                        <div className="w-px h-12 bg-white/20"></div>
                        <div>
                            <p className="text-4xl font-bold text-green-400">{participant.submissions.length}</p>
                            <p className="text-sm text-gray-400">Questions Attempted</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-2xl font-bold text-white">{mcqCorrect}/{mcqQuestions.length}</p>
                        <p className="text-sm text-gray-400">MCQ Correct</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-2xl font-bold text-white">{codingPassed}/{codingQuestions.length}</p>
                        <p className="text-sm text-gray-400">Coding Passed</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-2xl font-bold text-white">{participant.tabSwitchCount}</p>
                        <p className="text-sm text-gray-400">Tab Switches</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-2xl font-bold text-white">{participant.violations.length}</p>
                        <p className="text-sm text-gray-400">Violations</p>
                    </div>
                </div>

                {/* Question-wise Breakdown */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white">Question-wise Breakdown</h2>
                    </div>
                    <div className="divide-y divide-white/5">
                        {contest.questions
                            .sort((a, b) => a.order - b.order)
                            .map((question, index) => {
                                const submission = participant.submissions.find(s => s.questionId === question.id)
                                const isPassed = submission && submission.score === question.points
                                const isAttempted = !!submission

                                return (
                                    <div key={question.id} className="flex items-center justify-between px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                                                isPassed
                                                    ? "bg-green-600/30 text-green-400"
                                                    : isAttempted
                                                    ? "bg-yellow-600/30 text-yellow-400"
                                                    : "bg-white/10 text-gray-400"
                                            }`}>
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium text-white">{question.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <span>{question.type === "MCQ" ? "📝 MCQ" : "💻 Coding"}</span>
                                                    <span>•</span>
                                                    <span className={
                                                        question.difficulty === "EASY"
                                                            ? "text-green-400"
                                                            : question.difficulty === "MEDIUM"
                                                            ? "text-yellow-400"
                                                            : "text-red-400"
                                                    }>
                                                        {question.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${
                                                isPassed ? "text-green-400" : isAttempted ? "text-yellow-400" : "text-gray-500"
                                            }`}>
                                                {submission?.score || 0}/{question.points}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {isPassed ? "Passed" : isAttempted ? "Partial" : "Not Attempted"}
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
                    <div className="bg-red-900/20 border border-red-500/30 rounded-xl overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-red-500/20">
                            <h2 className="text-lg font-semibold text-red-400">⚠️ Recorded Violations</h2>
                        </div>
                        <div className="divide-y divide-red-500/10">
                            {participant.violations.map((violation, index) => (
                                <div key={violation.id} className="flex items-center justify-between px-6 py-3">
                                    <div>
                                        <p className="text-white">{violation.type.replace("_", " ")}</p>
                                        {violation.details && (
                                            <p className="text-sm text-gray-400">{violation.details}</p>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {new Date(violation.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-4">
                    <Link
                        href={`/coding-contests/${contest.slug}/leaderboard`}
                        className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors"
                    >
                        View Full Leaderboard 🏆
                    </Link>
                    <Link
                        href="/coding-contests"
                        className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
                    >
                        Browse More Contests
                    </Link>
                </div>
            </main>
        </div>
    )
}
