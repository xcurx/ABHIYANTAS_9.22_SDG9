import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCodingContestBySlug, publishCodingContest } from "@/lib/actions/coding-contest"
import { ArrowLeft, Settings, FileText, Users, Trophy, Plus, ChevronRight, Rocket } from "lucide-react"

type ContestStatus = "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "LIVE" | "ENDED" | "CANCELLED"

const statusColors: Record<ContestStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PUBLISHED: "bg-blue-100 text-blue-700",
    REGISTRATION_OPEN: "bg-green-100 text-green-700",
    LIVE: "bg-red-100 text-red-700",
    ENDED: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
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

    const contest = await getCodingContestBySlug(contestId)

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-blue-600 text-white">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <Link href={`/coding-contests/${contest.slug}`} className="text-blue-200 hover:text-white text-sm mb-2 inline-flex items-center gap-1 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Contest
                            </Link>
                            <div className="flex items-center gap-4">
                                <h1 className="text-3xl font-bold">{contest.title}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[contest.status as ContestStatus]}`}>
                                    {contest.status.replace("_", " ")}
                                </span>
                            </div>
                            <p className="text-blue-200 mt-1">Manage your coding contest</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {canPublish && (
                                <form action={handlePublish.bind(null, contest.id)}>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
                                    >
                                        <Rocket className="w-4 h-4" />
                                        Publish Contest
                                    </button>
                                </form>
                            )}
                            <Link
                                href={`/coding-contests/${contest.slug}/manage/settings`}
                                className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    {[
                        { label: "Questions", value: contest.questions.length, icon: "📝", color: "blue" },
                        { label: "MCQ", value: stats.mcqQuestions, icon: "✓", color: "blue" },
                        { label: "Coding", value: stats.codingQuestions, icon: "💻", color: "green" },
                        { label: "Test Cases", value: stats.totalTestCases, icon: "🧪", color: "amber" },
                        { label: "Points", value: stats.totalPoints, icon: "⭐", color: "orange" },
                        { label: "Registered", value: contest._count.participants, icon: "👥", color: "blue" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white border border-gray-200 rounded-xl p-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-2xl">{stat.icon}</span>
                                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Questions Card */}
                    <Link
                        href={`/coding-contests/${contest.slug}/manage/questions`}
                        className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    Manage Questions
                                </h3>
                                <p className="text-gray-500 text-sm">Add, edit, or remove questions</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{contest.questions.length} questions</span>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>

                    {/* Participants Card */}
                    <Link
                        href={`/coding-contests/${contest.slug}/manage/participants`}
                        className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    Participants
                                </h3>
                                <p className="text-gray-500 text-sm">View registered participants</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{contest._count.participants} registered</span>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>

                    {/* Leaderboard Card */}
                    <Link
                        href={`/coding-contests/${contest.slug}/leaderboard`}
                        className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    Leaderboard
                                </h3>
                                <p className="text-gray-500 text-sm">View rankings and scores</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Real-time rankings</span>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                </div>

                {/* Questions List Preview */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Questions Overview</h2>
                        <Link
                            href={`/coding-contests/${contest.slug}/manage/questions/new`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Question
                        </Link>
                    </div>

                    {contest.questions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                            <p className="text-gray-500 mb-6">
                                Add your first question to get started
                            </p>
                            <Link
                                href={`/coding-contests/${contest.slug}/manage/questions/new`}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
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
                                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                                            {i + 1}
                                        </span>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{q.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                <span>{q.type === "MCQ" ? "📝 MCQ" : "💻 Coding"}</span>
                                                <span>•</span>
                                                <span className={
                                                    q.difficulty === "EASY" ? "text-green-600" :
                                                    q.difficulty === "MEDIUM" ? "text-amber-600" : "text-red-600"
                                                }>{q.difficulty}</span>
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
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </Link>
                            ))}
                            {contest.questions.length > 5 && (
                                <Link
                                    href={`/coding-contests/${contest.slug}/manage/questions`}
                                    className="block text-center py-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
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
