import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCodingContestBySlug, registerForContest } from "@/lib/actions/coding-contest"

type ContestStatus = "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "LIVE" | "ENDED" | "CANCELLED"
type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT"

const statusColors: Record<ContestStatus, { bg: string; text: string; border: string }> = {
    DRAFT: { bg: "bg-gray-500/20", text: "text-gray-300", border: "border-gray-500/30" },
    PUBLISHED: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30" },
    REGISTRATION_OPEN: { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30" },
    LIVE: { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/30" },
    ENDED: { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" },
    CANCELLED: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
}

const difficultyColors: Record<Difficulty, string> = {
    EASY: "bg-green-500/20 text-green-400 border-green-500/30",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    HARD: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    EXPERT: "bg-red-500/20 text-red-400 border-red-500/30",
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date))
}

function getTimeUntil(date: Date): string {
    const now = new Date()
    const target = new Date(date)
    const diff = target.getTime() - now.getTime()

    if (diff <= 0) return "Started"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
}

async function handleRegister(contestId: string) {
    "use server"
    const result = await registerForContest(contestId)
    if (!result.success) {
        throw new Error(result.message)
    }
}

export default async function ContestDetailPage({ 
    params 
}: { 
    params: Promise<{ contestId: string }> 
}) {
    const session = await auth()
    const { contestId } = await params
    
    const contest = await getCodingContestBySlug(contestId)

    if (!contest) {
        notFound()
    }

    const now = new Date()
    const isBeforeStart = now < new Date(contest.startTime)
    const isLive = now >= new Date(contest.startTime) && now <= new Date(contest.endTime)
    const isEnded = now > new Date(contest.endTime)

    const canRegister = 
        session && 
        !contest.isRegistered && 
        !isEnded && 
        (contest.status === "PUBLISHED" || contest.status === "REGISTRATION_OPEN" || contest.status === "LIVE")

    const canStart = 
        session && 
        contest.isRegistered && 
        (isLive || (isBeforeStart && contest.allowLateJoin))

    const totalPoints = contest.questions.reduce((sum: number, q: { points: number }) => sum + q.points, 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Hero Section */}
            <div className="relative">
                {/* Banner Background */}
                <div className="absolute inset-0 h-80 overflow-hidden">
                    {contest.bannerImage ? (
                        <img 
                            src={contest.bannerImage} 
                            alt={contest.title}
                            className="w-full h-full object-cover opacity-30"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-orange-600/30" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/80 to-slate-900" />
                </div>

                {/* Header */}
                <header className="relative border-b border-white/10">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <Link href="/coding-contests" className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Contests
                        </Link>
                    </div>
                </header>

                {/* Contest Info */}
                <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Info */}
                        <div className="flex-1">
                            {/* Status Badge */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[contest.status as ContestStatus].bg} ${statusColors[contest.status as ContestStatus].text} ${statusColors[contest.status as ContestStatus].border}`}>
                                    {contest.status === "LIVE" && (
                                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                                    )}
                                    {contest.status.replace("_", " ")}
                                </span>
                                {contest.proctorEnabled && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                        🔒 Proctored
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                {contest.title}
                            </h1>

                            {/* Organization */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    {contest.organization.logo ? (
                                        <img src={contest.organization.logo} alt="" className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <span className="text-lg font-bold text-white">
                                            {contest.organization.name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-medium">{contest.organization.name}</p>
                                    <p className="text-gray-400 text-sm">Organizer</p>
                                </div>
                            </div>

                            {/* Description */}
                            {contest.shortDescription && (
                                <p className="text-xl text-gray-300 mb-6">
                                    {contest.shortDescription}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="flex flex-wrap gap-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{contest.duration} minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span>{contest._count.questions} questions</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{contest._count.participants} registered</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    <span>{totalPoints} total points</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Card */}
                        <div className="lg:w-96">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                                {/* Timer / Status */}
                                <div className="text-center mb-6">
                                    {isLive ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-center gap-2 text-red-400">
                                                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                                <span className="font-semibold">LIVE NOW</span>
                                            </div>
                                            <p className="text-gray-400 text-sm">
                                                Ends in {getTimeUntil(contest.endTime)}
                                            </p>
                                        </div>
                                    ) : isBeforeStart ? (
                                        <div className="space-y-2">
                                            <p className="text-gray-400 text-sm">Starts in</p>
                                            <p className="text-3xl font-bold text-white font-mono">
                                                {getTimeUntil(contest.startTime)}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-gray-400">
                                            Contest has ended
                                        </div>
                                    )}
                                </div>

                                {/* Timing Details */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Start</span>
                                        <span className="text-white">{formatDate(contest.startTime)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">End</span>
                                        <span className="text-white">{formatDate(contest.endTime)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Duration</span>
                                        <span className="text-white">{contest.duration} minutes</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {!session ? (
                                        <Link
                                            href="/sign-in"
                                            className="block w-full text-center py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors"
                                        >
                                            Sign in to Register
                                        </Link>
                                    ) : canRegister ? (
                                        <form action={handleRegister.bind(null, contest.id)}>
                                            <button
                                                type="submit"
                                                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all"
                                            >
                                                Register Now
                                            </button>
                                        </form>
                                    ) : contest.isRegistered ? (
                                        <div className="space-y-3">
                                            <div className="py-3 rounded-lg bg-green-500/20 border border-green-500/30 text-center">
                                                <span className="text-green-400 font-medium">✓ Registered</span>
                                            </div>
                                            {canStart && (
                                                <Link
                                                    href={`/coding-contests/${contest.slug}/participate`}
                                                    className="block w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-center hover:from-green-500 hover:to-emerald-500 transition-all"
                                                >
                                                    Start Contest →
                                                </Link>
                                            )}
                                            {isBeforeStart && !contest.allowLateJoin && (
                                                <p className="text-center text-gray-400 text-sm">
                                                    You can start when the contest begins
                                                </p>
                                            )}
                                        </div>
                                    ) : isEnded ? (
                                        <Link
                                            href={`/coding-contests/${contest.slug}/results`}
                                            className="block w-full py-3 rounded-lg bg-white/10 text-white font-semibold text-center hover:bg-white/20 transition-colors"
                                        >
                                            View Results
                                        </Link>
                                    ) : null}

                                    {/* Admin Link */}
                                    {contest.isAdmin && (
                                        <Link
                                            href={`/coding-contests/${contest.slug}/manage`}
                                            className="block w-full py-3 rounded-lg border border-white/20 text-white font-medium text-center hover:bg-white/5 transition-colors"
                                        >
                                            ⚙️ Manage Contest
                                        </Link>
                                    )}

                                    {/* Leaderboard Link */}
                                    {contest.showLeaderboard && !isBeforeStart && (
                                        <Link
                                            href={`/coding-contests/${contest.slug}/leaderboard`}
                                            className="block w-full py-3 rounded-lg border border-white/20 text-white font-medium text-center hover:bg-white/5 transition-colors"
                                        >
                                            📊 View Leaderboard
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Description & Questions */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        {contest.description && (
                            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">About this Contest</h2>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-gray-300 whitespace-pre-wrap">{contest.description}</p>
                                </div>
                            </section>
                        )}

                        {/* Questions Preview */}
                        <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">
                                Questions ({contest.questions.length})
                            </h2>
                            <div className="space-y-3">
                                {contest.questions.map((q, i) => (
                                    <div
                                        key={q.id}
                                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-sm font-medium text-purple-300">
                                                {i + 1}
                                            </span>
                                            <div>
                                                <h3 className="font-medium text-white">{q.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${difficultyColors[q.difficulty as Difficulty]}`}>
                                                        {q.difficulty}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {q.type === "MCQ" ? "📝 MCQ" : "💻 Coding"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-semibold text-white">{q.points}</span>
                                            <span className="text-gray-400 text-sm ml-1">pts</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Rules */}
                        {contest.rules && (
                            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Rules & Guidelines</h2>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-gray-300 whitespace-pre-wrap">{contest.rules}</p>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column - Info Cards */}
                    <div className="space-y-6">
                        {/* Proctoring Info */}
                        {contest.proctorEnabled && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                                    <span>🔒</span> Proctoring Enabled
                                </h3>
                                <ul className="space-y-2 text-sm text-yellow-200/80">
                                    {contest.fullScreenRequired && (
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Full screen mode required
                                        </li>
                                    )}
                                    {contest.copyPasteDisabled && (
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Copy/paste disabled
                                        </li>
                                    )}
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Tab switch limit: {contest.tabSwitchLimit}
                                    </li>
                                    {contest.webcamRequired && (
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Webcam required
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Scoring Info */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Scoring</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-center justify-between">
                                    <span>Total Points</span>
                                    <span className="font-semibold text-white">{totalPoints}</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span>Questions</span>
                                    <span className="font-semibold text-white">{contest._count.questions}</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span>Negative Marking</span>
                                    <span className="font-semibold text-white">
                                        {contest.negativeMarking ? `${contest.negativePercent}%` : "No"}
                                    </span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span>Partial Scoring</span>
                                    <span className="font-semibold text-white">
                                        {contest.partialScoring ? "Yes" : "No"}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Tags */}
                        {contest.questions.some((q: { tags: string[] }) => q.tags.length > 0) && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Topics Covered</h3>
                                <div className="flex flex-wrap gap-2">
                                    {[...new Set(contest.questions.flatMap((q: { tags: string[] }) => q.tags))].map((tag) => (
                                        <span
                                            key={tag as string}
                                            className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm"
                                        >
                                            {tag as string}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
