import { auth } from "@/auth"
import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { registerForContest } from "@/lib/actions/coding-contest"
import ContestActionCard from "./contest-action-card"

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
        EASY: { label: "Easy", gradient: "from-emerald-400 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-600" },
        MEDIUM: { label: "Medium", gradient: "from-amber-400 to-orange-500", bg: "bg-amber-50", text: "text-amber-600" },
        HARD: { label: "Hard", gradient: "from-red-400 to-rose-500", bg: "bg-red-50", text: "text-red-600" },
        EXPERT: { label: "Expert", gradient: "from-purple-400 to-violet-500", bg: "bg-purple-50", text: "text-purple-600" },
    }

    return (
        <div className="min-h-screen pattern-bg">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500 rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-cyan-500 rounded-full blur-[100px]" />
                </div>
                
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />

                <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm mb-8">
                        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                            Dashboard
                        </Link>
                        <span className="text-slate-600">/</span>
                        <Link href="/coding-contests" className="text-slate-400 hover:text-white transition-colors">
                            Contests
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className="text-white">{contest.title}</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Left Content */}
                        <div className="flex-1">
                            {/* Status Badge */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                    <span className={`w-2 h-2 rounded-full ${
                                        contest.status === 'LIVE' ? 'bg-red-500 animate-pulse' :
                                        contest.status === 'REGISTRATION_OPEN' ? 'bg-emerald-500' :
                                        contest.status === 'PUBLISHED' ? 'bg-indigo-500' :
                                        'bg-slate-400'
                                    }`} />
                                    <span className="text-white text-sm font-medium">
                                        {contest.status.replace('_', ' ')}
                                    </span>
                                </span>
                                <span className="text-slate-400 text-sm">
                                    by {contest.organization.name}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                                {contest.title}
                            </h1>

                            {/* Description */}
                            {contest.shortDescription && (
                                <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
                                    {contest.shortDescription}
                                </p>
                            )}

                            {/* Quick Stats */}
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{contest.questions.length}</div>
                                        <div className="text-xs text-slate-400">Questions</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{totalPoints}</div>
                                        <div className="text-xs text-slate-400">Points</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{contest.duration}</div>
                                        <div className="text-xs text-slate-400">Minutes</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{contest._count.participants}</div>
                                        <div className="text-xs text-slate-400">Participants</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Action Card */}
                        <div className="w-full lg:w-96 shrink-0">
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
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Section */}
                        {contest.description && (
                            <div className="glass-card rounded-3xl p-8">
                                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    About This Contest
                                </h2>
                                <div className="prose prose-slate max-w-none">
                                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                        {contest.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Questions Preview */}
                        <div className="glass-card rounded-3xl p-8">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                Questions ({contest.questions.length})
                            </h2>

                            {/* Difficulty Breakdown */}
                            <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-slate-200/60">
                                {Object.entries(difficultyBreakdown).map(([diff, count]) => {
                                    const config = difficultyConfig[diff as keyof typeof difficultyConfig]
                                    return (
                                        <div
                                            key={diff}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl ${config.bg} border border-current/10`}
                                        >
                                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient}`} />
                                            <span className={`text-sm font-medium ${config.text}`}>
                                                {String(count)} {config.label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Questions List */}
                            <div className="space-y-3">
                                {contest.questions.map((q: { id: string; title: string; type: string; difficulty: string; points: number }, i: number) => {
                                    const config = difficultyConfig[q.difficulty as keyof typeof difficultyConfig]
                                    return (
                                        <div
                                            key={q.id}
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-100/80 transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-sm font-bold text-slate-600 group-hover:shadow-md transition-shadow">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-slate-800 font-medium truncate">
                                                    {q.title}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs font-medium ${config.text}`}>
                                                        {config.label}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-xs text-slate-500">
                                                        {q.type === "MCQ" ? "Multiple Choice" : "Coding"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white shadow-sm">
                                                <span className="text-sm font-bold text-indigo-600">{q.points}</span>
                                                <span className="text-xs text-slate-400">pts</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Additional Info */}
                    <div className="space-y-6">
                        {/* Schedule Card */}
                        <div className="glass-card rounded-3xl p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Schedule
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50">
                                    <span className="text-sm text-slate-600">Start Time</span>
                                    <span className="text-sm font-semibold text-emerald-600">
                                        {new Intl.DateTimeFormat("en-US", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        }).format(new Date(contest.startTime))}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50">
                                    <span className="text-sm text-slate-600">End Time</span>
                                    <span className="text-sm font-semibold text-red-600">
                                        {new Intl.DateTimeFormat("en-US", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        }).format(new Date(contest.endTime))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Scoring Card */}
                        <div className="glass-card rounded-3xl p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                Scoring
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                                    <span className="text-sm text-slate-600">Max Score</span>
                                    <span className="text-lg font-bold text-slate-800">{totalPoints} pts</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                                    <span className="text-sm text-slate-600">Passing Score</span>
                                    <span className="text-lg font-bold text-emerald-600">
                                        {Math.floor(totalPoints * 0.4)} pts
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Rules Card */}
                        <div className="glass-card rounded-3xl p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Proctoring
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { enabled: contest.proctorEnabled, label: "Proctoring Enabled" },
                                    { enabled: contest.tabSwitchLimit > 0, label: "Tab Switch Detection" },
                                    { enabled: contest.copyPasteDisabled, label: "Copy/Paste Disabled" },
                                    { enabled: contest.fullScreenRequired, label: "Fullscreen Required" },
                                ].map((rule) => (
                                    <div
                                        key={rule.label}
                                        className={`flex items-center gap-3 p-3 rounded-xl ${
                                            rule.enabled ? 'bg-violet-50' : 'bg-slate-50'
                                        }`}
                                    >
                                        {rule.enabled ? (
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                        <span className={`text-sm ${rule.enabled ? 'text-violet-700 font-medium' : 'text-slate-500'}`}>
                                            {rule.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
