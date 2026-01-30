import { auth } from "@/auth"
import Link from "next/link"
import { getCodingContests } from "@/lib/actions/coding-contest"

type ContestStatus = "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "LIVE" | "ENDED" | "CANCELLED"

const statusColors: Record<ContestStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    PUBLISHED: "bg-blue-100 text-blue-800",
    REGISTRATION_OPEN: "bg-green-100 text-green-800",
    LIVE: "bg-red-100 text-red-800 animate-pulse",
    ENDED: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-600",
}

const difficultyColors: Record<string, string> = {
    EASY: "text-green-600",
    MEDIUM: "text-yellow-600",
    HARD: "text-orange-600",
    EXPERT: "text-red-600",
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date))
}

function getContestTimeStatus(startTime: Date, endTime: Date): string {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (now < start) {
        const diff = start.getTime() - now.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        
        if (days > 0) return `Starts in ${days}d ${hours}h`
        if (hours > 0) return `Starts in ${hours}h`
        return "Starting soon"
    }

    if (now >= start && now <= end) {
        return "Live now"
    }

    return "Ended"
}

export default async function CodingContestsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; search?: string }>
}) {
    const session = await auth()
    const params = await searchParams
    
    const { contests, total } = await getCodingContests({
        status: params.status,
        search: params.search,
        visibility: "PUBLIC",
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Dashboard
                            </Link>
                            <h1 className="text-4xl font-bold text-white tracking-tight">
                                Coding <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Contests</span>
                            </h1>
                            <p className="mt-2 text-gray-400">
                                Compete in programming challenges, solve problems, and climb the leaderboard
                            </p>
                        </div>
                        {session && (
                            <Link
                                href="/coding-contests/new"
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all hover:scale-105"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Contest
                            </Link>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="mt-6 flex flex-wrap gap-4">
                        <form className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={params.search}
                                    placeholder="Search contests..."
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 pl-10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </form>
                        <div className="flex gap-2">
                            {["all", "LIVE", "REGISTRATION_OPEN", "PUBLISHED", "ENDED"].map((status) => (
                                <Link
                                    key={status}
                                    href={`/coding-contests${status === "all" ? "" : `?status=${status}`}`}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        (params.status === status || (!params.status && status === "all"))
                                            ? "bg-purple-600 text-white"
                                            : "bg-white/10 text-gray-300 hover:bg-white/20"
                                    }`}
                                >
                                    {status === "all" ? "All" : status === "REGISTRATION_OPEN" ? "Open" : status.charAt(0) + status.slice(1).toLowerCase()}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Contest Grid */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {contests.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-900/50 mb-6">
                            <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No contests found</h3>
                        <p className="text-gray-400 mb-6">
                            {params.search 
                                ? "Try adjusting your search criteria" 
                                : "Be the first to create a coding contest!"}
                        </p>
                        {session && (
                            <Link
                                href="/coding-contests/new"
                                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-500"
                            >
                                Create Your First Contest
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {contests.map((contest) => (
                                <Link
                                    key={contest.id}
                                    href={`/coding-contests/${contest.slug}`}
                                    className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all hover:transform hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10"
                                >
                                    {/* Banner */}
                                    <div className="h-32 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 relative overflow-hidden">
                                        {contest.bannerImage && (
                                            <img 
                                                src={contest.bannerImage} 
                                                alt={contest.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        
                                        {/* Status Badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[contest.status as ContestStatus]}`}>
                                                {contest.status === "LIVE" && (
                                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-ping" />
                                                )}
                                                {contest.status.replace("_", " ")}
                                            </span>
                                        </div>

                                        {/* Organization Logo */}
                                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                                {contest.organization.logo ? (
                                                    <img src={contest.organization.logo} alt="" className="w-8 h-8 rounded-full" />
                                                ) : (
                                                    <span className="text-sm font-bold text-white">
                                                        {contest.organization.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm text-white/90 font-medium">
                                                {contest.organization.name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                                            {contest.title}
                                        </h3>
                                        
                                        {contest.shortDescription && (
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                                {contest.shortDescription}
                                            </p>
                                        )}

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <span>{contest._count.questions} questions</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{contest._count.participants} participants</span>
                                            </div>
                                        </div>

                                        {/* Time Info */}
                                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                            <div className="text-sm">
                                                <span className="text-gray-500">Duration:</span>
                                                <span className="ml-1 text-white">{contest.duration} min</span>
                                            </div>
                                            <div className="text-sm font-medium text-purple-400">
                                                {getContestTimeStatus(contest.startTime, contest.endTime)}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination info */}
                        <div className="mt-8 text-center text-gray-400">
                            Showing {contests.length} of {total} contests
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
