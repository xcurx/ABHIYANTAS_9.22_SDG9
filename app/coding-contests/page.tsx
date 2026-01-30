import { auth } from "@/auth"
import Link from "next/link"
import { getCodingContests } from "@/lib/actions/coding-contest"

type ContestStatus = "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "LIVE" | "ENDED" | "CANCELLED"

const statusConfig: Record<ContestStatus, { 
    gradient: string
    text: string
    glow?: string
    icon?: string
}> = {
    DRAFT: { 
        gradient: "from-slate-100 to-slate-200", 
        text: "text-slate-600" 
    },
    PUBLISHED: { 
        gradient: "from-blue-50 to-indigo-100", 
        text: "text-indigo-600",
        icon: "📅"
    },
    REGISTRATION_OPEN: { 
        gradient: "from-emerald-50 to-teal-100", 
        text: "text-emerald-600",
        glow: "shadow-emerald-100",
        icon: "✨"
    },
    LIVE: { 
        gradient: "from-rose-50 to-red-100", 
        text: "text-red-600",
        glow: "shadow-red-100",
        icon: "🔴"
    },
    ENDED: { 
        gradient: "from-gray-50 to-slate-100", 
        text: "text-slate-500",
        icon: "✓"
    },
    CANCELLED: { 
        gradient: "from-red-50 to-rose-100", 
        text: "text-red-500" 
    },
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date))
}

function getContestTimeInfo(startTime: Date, endTime: Date) {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (now < start) {
        const diff = start.getTime() - now.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        
        if (days > 0) return { text: `${days}d ${hours}h`, badge: "Upcoming", color: "text-indigo-600" }
        if (hours > 0) return { text: `${hours}h ${mins}m`, badge: "Soon", color: "text-amber-600" }
        return { text: `${mins}m`, badge: "Starting", color: "text-orange-600" }
    }

    if (now >= start && now <= end) {
        return { text: "Live", badge: "Live Now", color: "text-red-500" }
    }

    return { text: "Ended", badge: "Completed", color: "text-slate-500" }
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
        <div className="min-h-screen pattern-bg">
            {/* Premium Hero Header */}
            <header className="relative overflow-hidden border-b border-slate-200/60">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-100/40 via-violet-100/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-100/40 via-amber-100/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                
                <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-start gap-5">
                            {/* Animated Icon */}
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 float">
                                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-lg">
                                    {total}
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <Link href="/dashboard" className="text-slate-400 hover:text-indigo-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </Link>
                                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                                        Contest Arena
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold gradient-text tracking-tight">
                                    Coding Contests
                                </h1>
                                <p className="text-slate-500 mt-1">
                                    Challenge yourself, compete with the best, and prove your skills
                                </p>
                            </div>
                        </div>
                        
                        {session && (
                            <Link
                                href="/coding-contests/new"
                                className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <span className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </span>
                                Create Contest
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        {/* Search */}
                        <form className="flex-1 max-w-xl">
                            <div className="relative group">
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={params.search}
                                    placeholder="Search contests by name..."
                                    className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-5 py-3 pl-12 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </form>

                        {/* Status Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                            {[
                                { value: "all", label: "All Contests", icon: "🎯" },
                                { value: "LIVE", label: "Live", icon: "🔴" },
                                { value: "REGISTRATION_OPEN", label: "Open", icon: "✨" },
                                { value: "PUBLISHED", label: "Upcoming", icon: "📅" },
                                { value: "ENDED", label: "Past", icon: "✓" },
                            ].map((filter) => {
                                const isActive = params.status === filter.value || (!params.status && filter.value === "all")
                                return (
                                    <Link
                                        key={filter.value}
                                        href={`/coding-contests${filter.value === "all" ? "" : `?status=${filter.value}`}`}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                            isActive
                                                ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/20"
                                                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800"
                                        }`}
                                    >
                                        <span className={isActive ? "opacity-100" : "opacity-70"}>{filter.icon}</span>
                                        {filter.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contest Grid */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {contests.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-3xl">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No contests found</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                            {params.search 
                                ? "Try adjusting your search or filter criteria" 
                                : "Be the first to create an exciting coding contest!"}
                        </p>
                        {session && (
                            <Link
                                href="/coding-contests/new"
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Your First Contest
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-5">
                        {contests.map((contest, index) => {
                            const timeInfo = getContestTimeInfo(contest.startTime, contest.endTime)
                            const status = contest.status as ContestStatus
                            const config = statusConfig[status]
                            const isLive = status === "LIVE"
                            
                            return (
                                <Link
                                    key={contest.id}
                                    href={`/coding-contests/${contest.slug}`}
                                    className={`group relative block glass-card rounded-2xl overflow-hidden card-hover ${isLive ? 'ring-2 ring-red-200 glow-accent' : ''}`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Gradient accent bar */}
                                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                                        isLive ? 'from-red-400 via-rose-500 to-pink-500' :
                                        status === 'REGISTRATION_OPEN' ? 'from-emerald-400 via-teal-500 to-cyan-500' :
                                        status === 'PUBLISHED' ? 'from-indigo-400 via-violet-500 to-purple-500' :
                                        'from-slate-300 to-slate-400'
                                    }`} />
                                    
                                    <div className="p-6">
                                        <div className="flex items-start gap-5">
                                            {/* Left: Contest Icon */}
                                            <div className={`relative shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center overflow-hidden ${isLive ? 'animate-pulse' : ''}`}>
                                                {contest.organization.logo ? (
                                                    <img src={contest.organization.logo} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-bold text-slate-600/50">
                                                        {contest.organization.name.charAt(0)}
                                                    </span>
                                                )}
                                                {isLive && (
                                                    <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                                                )}
                                            </div>
                                            
                                            {/* Center: Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Header row */}
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-sm text-slate-500 font-medium">
                                                        {contest.organization.name}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${config.gradient} ${config.text}`}>
                                                        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                                                        {status.replace("_", " ")}
                                                    </span>
                                                </div>
                                                
                                                {/* Title */}
                                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">
                                                    {contest.title}
                                                </h3>
                                                
                                                {/* Description */}
                                                {contest.shortDescription && (
                                                    <p className="text-slate-500 text-sm line-clamp-1 mb-4">
                                                        {contest.shortDescription}
                                                    </p>
                                                )}
                                                
                                                {/* Stats */}
                                                <div className="flex flex-wrap items-center gap-5">
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                            </svg>
                                                        </div>
                                                        <span className="font-medium">{contest._count.questions}</span>
                                                        <span className="text-slate-400">questions</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <span className="font-medium">{contest.duration}</span>
                                                        <span className="text-slate-400">minutes</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </div>
                                                        <span className="font-medium">{contest._count.participants}</span>
                                                        <span className="text-slate-400">participants</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Right: Time & Arrow */}
                                            <div className="shrink-0 text-right">
                                                <div className={`text-sm font-bold ${timeInfo.color} mb-1`}>
                                                    {timeInfo.badge}
                                                </div>
                                                <div className="text-xs text-slate-400 mb-3">
                                                    {formatDate(contest.startTime)}
                                                </div>
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-500 flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-indigo-500/30">
                                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}

                {/* Pagination */}
                {contests.length > 0 && (
                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center gap-3 px-5 py-3 glass-card rounded-2xl">
                            <span className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-700">{contests.length}</span> of <span className="font-semibold text-slate-700">{total}</span> contests
                            </span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
