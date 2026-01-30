import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCodingContestById, publishCodingContest } from "@/lib/actions/coding-contest"

type ContestStatus = "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "LIVE" | "ENDED" | "CANCELLED"

const statusColors: Record<ContestStatus, string> = {
    DRAFT: "bg-gray-500",
    PUBLISHED: "bg-blue-500",
    REGISTRATION_OPEN: "bg-green-500",
    LIVE: "bg-red-500",
    ENDED: "bg-gray-600",
    CANCELLED: "bg-red-700",
}

async function handlePublish(contestId: string) {
    "use server"
    const result = await publishCodingContest(contestId)
    if (!result.success) {
        throw new Error(result.message)
    }
}

export default async function ContestManagePage({
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

    // Check if user is admin of the organization
    // This would be handled by getCodingContestById in a real implementation

    const stats = {
        questions: contest._count.participants,
        participants: contest._count.participants,
        mcqQuestions: contest.questions.filter(q => q.type === "MCQ").length,
        codingQuestions: contest.questions.filter(q => q.type === "CODING").length,
        totalPoints: contest.questions.reduce((sum, q) => sum + q.points, 0),
        totalTestCases: contest.questions.reduce((sum, q) => sum + (q.testCases?.length || 0), 0),
    }

    const canPublish = contest.status === "DRAFT" && contest.questions.length > 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <Link href={`/coding-contests/${contest.slug}`} className="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Contest
                            </Link>
                            <div className="flex items-center gap-4">
                                <h1 className="text-3xl font-bold text-white">{contest.title}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[contest.status as ContestStatus]}`}>
                                    {contest.status.replace("_", " ")}
                                </span>
                            </div>
                            <p className="text-gray-400 mt-1">Manage your coding contest</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {canPublish && (
                                <form action={handlePublish.bind(null, contest.id)}>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-500 hover:to-emerald-500 transition-all"
                                    >
                                        Publish Contest 🚀
                                    </button>
                                </form>
                            )}
                            <Link
                                href={`/coding-contests/${contest.slug}/manage/settings`}
                                className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
                            >
                                ⚙️ Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    {[
                        { label: "Questions", value: contest.questions.length, icon: "📝", color: "purple" },
                        { label: "MCQ", value: stats.mcqQuestions, icon: "✓", color: "blue" },
                        { label: "Coding", value: stats.codingQuestions, icon: "💻", color: "green" },
                        { label: "Test Cases", value: stats.totalTestCases, icon: "🧪", color: "yellow" },
                        { label: "Points", value: stats.totalPoints, icon: "⭐", color: "orange" },
                        { label: "Registered", value: contest._count.participants, icon: "👥", color: "pink" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-2xl">{stat.icon}</span>
                                <span className="text-2xl font-bold text-white">{stat.value}</span>
                            </div>
                            <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Questions Card */}
                    <Link
                        href={`/coding-contests/${contest.slug}/manage/questions`}
                        className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all hover:transform hover:scale-[1.02]"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-600/30 flex items-center justify-center">
                                <span className="text-2xl">📝</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                                    Manage Questions
                                </h3>
                                <p className="text-gray-400 text-sm">Add, edit, or remove questions</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{contest.questions.length} questions</span>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>

                    {/* Participants Card */}
                    <Link
                        href={`/coding-contests/${contest.slug}/manage/participants`}
                        className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:transform hover:scale-[1.02]"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-600/30 flex items-center justify-center">
                                <span className="text-2xl">👥</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    Participants
                                </h3>
                                <p className="text-gray-400 text-sm">View registered participants</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{contest._count.participants} registered</span>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>

                    {/* Leaderboard Card */}
                    <Link
                        href={`/coding-contests/${contest.slug}/leaderboard`}
                        className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-green-500/50 transition-all hover:transform hover:scale-[1.02]"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-green-600/30 flex items-center justify-center">
                                <span className="text-2xl">🏆</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
                                    Leaderboard
                                </h3>
                                <p className="text-gray-400 text-sm">View rankings and scores</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Real-time rankings</span>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-green-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                </div>

                {/* Questions List Preview */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Questions Overview</h2>
                        <Link
                            href={`/coding-contests/${contest.slug}/manage/questions/new`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Question
                        </Link>
                    </div>

                    {contest.questions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-900/50 mb-4">
                                <span className="text-3xl">📝</span>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No questions yet</h3>
                            <p className="text-gray-400 mb-6">
                                Add your first question to get started
                            </p>
                            <Link
                                href={`/coding-contests/${contest.slug}/manage/questions/new`}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors"
                            >
                                Add Your First Question
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {contest.questions.slice(0, 5).map((q, i) => (
                                <Link
                                    key={q.id}
                                    href={`/coding-contests/${contest.slug}/manage/questions/${q.id}`}
                                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-sm font-medium text-purple-300">
                                            {i + 1}
                                        </span>
                                        <div>
                                            <h3 className="font-medium text-white">{q.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                <span>{q.type === "MCQ" ? "📝 MCQ" : "💻 Coding"}</span>
                                                <span>•</span>
                                                <span>{q.difficulty}</span>
                                                <span>•</span>
                                                <span>{q.points} pts</span>
                                                {q.testCases && q.testCases.length > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{q.testCases.length} test cases</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))}
                            {contest.questions.length > 5 && (
                                <Link
                                    href={`/coding-contests/${contest.slug}/manage/questions`}
                                    className="block text-center py-3 text-purple-400 hover:text-purple-300 text-sm"
                                >
                                    View all {contest.questions.length} questions →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
