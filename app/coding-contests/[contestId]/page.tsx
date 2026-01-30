import { auth } from "@/auth"
import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { registerForContest } from "@/lib/actions/coding-contest"
import ContestActionCard from "./contest-action-card"
import { Calendar, Clock, Users, FileText, Trophy, Shield, ArrowLeft } from "lucide-react"

export default async function ContestDetailPage({
    params,
}: {
    params: Promise<{ contestId: string }>
}) {
    const { contestId } = await params
    const session = await auth()

    const contest = await prisma.codingContest.findFirst({
        where: {
            OR: [{ id: contestId }, { slug: contestId }],
        },
        include: {
            organization: true,
            questions: {
                orderBy: { order: "asc" },
                select: {
                    id: true,
                    title: true,
                    type: true,
                    difficulty: true,
                    points: true,
                },
            },
            _count: {
                select: { participants: true },
            },
        },
    })

    if (!contest) {
        notFound()
    }

    // Check registration status
    const isRegistered = session?.user?.id
        ? !!(await prisma.contestParticipant.findUnique({
              where: {
                  contestId_userId: {
                      contestId: contest.id,
                      userId: session.user.id,
                  },
              },
          }))
        : false

    // Check if user is admin
    const isAdmin = session?.user?.id
        ? !!(await prisma.organizationMember.findFirst({
              where: {
                  organizationId: contest.organizationId,
                  userId: session.user.id,
                  role: { in: ["OWNER", "ADMIN"] },
              },
          }))
        : false

    const totalPoints = contest.questions.reduce((sum: number, q: { points: number }) => sum + q.points, 0)
    const difficultyBreakdown = contest.questions.reduce(
        (acc: Record<string, number>, q: { difficulty: string }) => {
            acc[q.difficulty] = (acc[q.difficulty] || 0) + 1
            return acc
        },
        {} as Record<string, number>
    )

    const difficultyConfig = {
        EASY: { label: "Easy", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
        MEDIUM: { label: "Medium", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
        HARD: { label: "Hard", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
        EXPERT: { label: "Expert", bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
    }

    const statusConfig: Record<string, { label: string; className: string }> = {
        DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-700" },
        PUBLISHED: { label: "Published", className: "bg-blue-100 text-blue-700" },
        REGISTRATION_OPEN: { label: "Registration Open", className: "bg-green-100 text-green-700" },
        LIVE: { label: "Live Now", className: "bg-red-100 text-red-700 animate-pulse" },
        ENDED: { label: "Completed", className: "bg-gray-100 text-gray-600" },
        CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-blue-600 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/3 translate-y-1/3"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm mb-6">
                        <Link href="/dashboard" className="text-blue-200 hover:text-white transition-colors">
                            Dashboard
                        </Link>
                        <span className="text-blue-300">/</span>
                        <Link href="/coding-contests" className="text-blue-200 hover:text-white transition-colors">
                            Contests
                        </Link>
                        <span className="text-blue-300">/</span>
                        <span className="text-white">{contest.title}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[contest.status]?.className || 'bg-gray-100 text-gray-700'}`}>
                            {contest.status === 'LIVE' && (
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                            {statusConfig[contest.status]?.label || contest.status.replace('_', ' ')}
                        </span>
                        <span className="text-blue-200 text-sm">
                            by {contest.organization.name}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight max-w-3xl">
                        {contest.title}
                    </h1>

                    {/* Description */}
                    {contest.shortDescription && (
                        <p className="text-lg text-blue-100 mb-6 max-w-2xl leading-relaxed">
                            {contest.shortDescription}
                        </p>
                    )}

                    {/* Quick Stats Row */}
                    <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-200" />
                            <span className="text-white font-medium">{contest.questions.length}</span>
                            <span className="text-blue-200">Questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-blue-200" />
                            <span className="text-white font-medium">{totalPoints}</span>
                            <span className="text-blue-200">Points</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-200" />
                            <span className="text-white font-medium">{contest.duration}</span>
                            <span className="text-blue-200">Minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-200" />
                            <span className="text-white font-medium">{contest._count.participants}</span>
                            <span className="text-blue-200">Participants</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Top Row - Action Card Full Width on Mobile, Sidebar on Desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* About Section */}
                        {contest.description && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    About This Contest
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    {contest.description}
                                </p>
                            </div>
                        )}

                        {/* Questions Preview */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-green-600" />
                                    Questions ({contest.questions.length})
                                </h2>
                                {/* Difficulty Breakdown - Inline */}
                                <div className="flex gap-2">
                                    {Object.entries(difficultyBreakdown).map(([diff, count]) => {
                                        const config = difficultyConfig[diff as keyof typeof difficultyConfig]
                                        return (
                                            <span
                                                key={diff}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                                {String(count)} {config.label}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Questions List - Compact */}
                            <div className="space-y-2">
                                {contest.questions.map((q: { id: string; title: string; type: string; difficulty: string; points: number }, i: number) => {
                                    const config = difficultyConfig[q.difficulty as keyof typeof difficultyConfig]
                                    return (
                                        <div
                                            key={q.id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-gray-900 font-medium">{q.title}</span>
                                                <span className="text-gray-400 mx-2">·</span>
                                                <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
                                                <span className="text-gray-400 mx-2">·</span>
                                                <span className="text-xs text-gray-500">{q.type === "MCQ" ? "MCQ" : "Coding"}</span>
                                            </div>
                                            <div className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-blue-600">
                                                {q.points} pts
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Bottom Row - Schedule, Scoring, Proctoring side by side */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Schedule Card */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    Schedule
                                </h3>
                                <div className="space-y-2">
                                    <div className="p-2.5 rounded-lg bg-green-50">
                                        <div className="text-xs text-gray-500 mb-0.5">Start</div>
                                        <div className="text-sm font-semibold text-green-700">
                                            {new Intl.DateTimeFormat("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                            }).format(new Date(contest.startTime))}
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-red-50">
                                        <div className="text-xs text-gray-500 mb-0.5">End</div>
                                        <div className="text-sm font-semibold text-red-700">
                                            {new Intl.DateTimeFormat("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                            }).format(new Date(contest.endTime))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scoring Card */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-500" />
                                    Scoring
                                </h3>
                                <div className="space-y-2">
                                    <div className="p-2.5 rounded-lg bg-gray-50">
                                        <div className="text-xs text-gray-500 mb-0.5">Max Score</div>
                                        <div className="text-lg font-bold text-gray-900">{totalPoints} pts</div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-gray-50">
                                        <div className="text-xs text-gray-500 mb-0.5">Passing</div>
                                        <div className="text-lg font-bold text-green-600">{Math.floor(totalPoints * 0.4)} pts</div>
                                    </div>
                                </div>
                            </div>

                            {/* Proctoring Card */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    Proctoring
                                </h3>
                                <div className="space-y-1.5">
                                    {[
                                        { enabled: contest.proctorEnabled, label: "Proctoring" },
                                        { enabled: contest.tabSwitchLimit > 0, label: "Tab Detection" },
                                        { enabled: contest.copyPasteDisabled, label: "No Copy/Paste" },
                                        { enabled: contest.fullScreenRequired, label: "Fullscreen" },
                                    ].map((rule) => (
                                        <div key={rule.label} className="flex items-center gap-2">
                                            {rule.enabled ? (
                                                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 rounded-full bg-gray-200" />
                                            )}
                                            <span className={`text-xs ${rule.enabled ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
                                                {rule.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Action Card Only */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-6">
                            <ContestActionCard
                                contest={{
                                    ...contest,
                                    isRegistered,
                                    isAdmin,
                                }}
                                isLoggedIn={!!session}
                                onRegister={async () => {
                                    "use server"
                                    await registerForContest(contest.id)
                                }}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
