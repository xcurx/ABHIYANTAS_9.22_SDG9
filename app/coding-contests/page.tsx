import { auth } from "@/auth"
import Link from "next/link"
import { getCodingContests } from "@/lib/actions/coding-contest"
import { Calendar, Users, Clock, Code, Trophy, Sparkles, ArrowRight, FileText } from "lucide-react"

type ContestStatus = "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "LIVE" | "ENDED" | "CANCELLED"

const statusConfig: Record<ContestStatus, { 
    label: string
    className: string
    headerGradient: string
    iconBg: string
}> = {
    DRAFT: { 
        label: "Draft", 
        className: "bg-gray-100 text-gray-700",
        headerGradient: "from-slate-100 to-slate-200",
        iconBg: "bg-slate-300"
    },
    PUBLISHED: { 
        label: "Starting Soon", 
        className: "bg-amber-50 text-amber-600",
        headerGradient: "from-amber-50 via-orange-50 to-yellow-50",
        iconBg: "bg-amber-200"
    },
    REGISTRATION_OPEN: { 
        label: "Open", 
        className: "bg-emerald-50 text-emerald-600",
        headerGradient: "from-emerald-50 via-teal-50 to-cyan-50",
        iconBg: "bg-emerald-200"
    },
    LIVE: { 
        label: "Live", 
        className: "bg-rose-50 text-rose-600",
        headerGradient: "from-rose-50 via-pink-50 to-fuchsia-50",
        iconBg: "bg-rose-200"
    },
    ENDED: { 
        label: "Ended", 
        className: "bg-gray-100 text-gray-500",
        headerGradient: "from-slate-100 to-slate-200",
        iconBg: "bg-slate-300"
    },
    CANCELLED: { 
        label: "Cancelled", 
        className: "bg-gray-100 text-gray-500",
        headerGradient: "from-slate-100 to-slate-200",
        iconBg: "bg-slate-300"
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

// Default banner images for coding contests without custom banners
const defaultContestBanners = [
    "/images/contest-banners/cc1.png",
    "/images/contest-banners/cc2.png",
    "/images/contest-banners/cc3.png",
    "/images/contest-banners/cc4.png",
]

// Get a consistent banner based on contest id
function getDefaultBanner(contestId: string): string {
    let hash = 0
    for (let i = 0; i < contestId.length; i++) {
        hash = ((hash << 5) - hash) + contestId.charCodeAt(i)
        hash = hash & hash
    }
    return defaultContestBanners[Math.abs(hash) % defaultContestBanners.length]
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
        
        if (days > 0) return { text: `${days}d ${hours}h`, badge: "Upcoming", color: "text-blue-600" }
        if (hours > 0) return { text: `${hours}h ${mins}m`, badge: "Soon", color: "text-amber-600" }
        return { text: `${mins}m`, badge: "Starting", color: "text-orange-600" }
    }

    if (now >= start && now <= end) {
        return { text: "Live", badge: "Live Now", color: "text-red-500" }
    }

    return { text: "Ended", badge: "Completed", color: "text-gray-500" }
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
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-blue-600 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full -translate-x-1/3 translate-y-1/3"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards', opacity: 0 }}>
                            <Code className="h-4 w-4" />
                            Competitive Programming Arena
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0 }}>
                            Coding Contests
                        </h1>
                        <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards', opacity: 0 }}>
                            Challenge yourself, compete with the best, and prove your coding skills
                        </p>
                        
                        {session && (
                            <div className="mt-8 flex items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards', opacity: 0 }}>
                                <Link
                                    href="/coding-contests/new"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
                                >
                                    <span className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </span>
                                    Create Contest
                                </Link>
                                <Link
                                    href="/coding-contests/calendar"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all duration-200"
                                >
                                    <Calendar className="h-4 w-4" />
                                    View Calendar
                                </Link>
                            </div>
                        )}

                        {!session && (
                            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards', opacity: 0 }}>
                                <Link
                                    href="/coding-contests/calendar"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all duration-200"
                                >
                                    <Calendar className="h-4 w-4" />
                                    View Calendar
                                </Link>
                            </div>
                        )}

                        {/* Quick Stats */}
                        <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards', opacity: 0 }}>
                            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <div className="flex justify-center mb-2">
                                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Trophy className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold">{total}</p>
                                <p className="text-sm text-blue-200">Total Contests</p>
                            </div>
                            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <div className="flex justify-center mb-2">
                                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold">5K+</p>
                                <p className="text-sm text-blue-200">Participants</p>
                            </div>
                            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <div className="flex justify-center mb-2">
                                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Sparkles className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold">100+</p>
                                <p className="text-sm text-blue-200">Organizations</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        {/* Search */}
                        <form className="flex-1 max-w-xl">
                            <div className="relative">
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={params.search}
                                    placeholder="Search contests by name..."
                                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-5 py-3 pl-12 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </form>

                        {/* Status Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                            {[
                                { value: "all", label: "All" },
                                { value: "LIVE", label: "Live" },
                                { value: "REGISTRATION_OPEN", label: "Open" },
                                { value: "PUBLISHED", label: "Upcoming" },
                                { value: "ENDED", label: "Past" },
                            ].map((filter) => {
                                const isActive = params.status === filter.value || (!params.status && filter.value === "all")
                                return (
                                    <Link
                                        key={filter.value}
                                        href={`/coding-contests${filter.value === "all" ? "" : `?status=${filter.value}`}`}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                            isActive
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    >
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
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <Code className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No contests found</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {params.search 
                                ? "Try adjusting your search or filter criteria" 
                                : "Be the first to create an exciting coding contest!"}
                        </p>
                        {session && (
                            <Link
                                href="/coding-contests/new"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Your First Contest
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contests.map((contest, index) => {
                            const timeInfo = getContestTimeInfo(contest.startTime, contest.endTime)
                            const status = contest.status as ContestStatus
                            const config = statusConfig[status]
                            const isLive = status === "LIVE"
                            const bannerImage = getDefaultBanner(contest.id)
                            
                            return (
                                <Link
                                    key={contest.id}
                                    href={`/coding-contests/${contest.slug}`}
                                    className={`group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 animate-fade-in-up`}
                                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards', opacity: 0 }}
                                >
                                    {/* Modern Header with Banner Image */}
                                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                                        <img 
                                            src={bannerImage}
                                            alt={contest.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {/* Gradient overlay for readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                        
                                        {/* Status Badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${config.className} ${isLive ? 'animate-pulse' : ''}`}>
                                                {isLive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse" />}
                                                {config.label}
                                            </span>
                                        </div>
                                        
                                        {/* Bottom info */}
                                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                            <span className="text-xs font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                                                {contest._count.questions} problems · {contest.duration}min
                                            </span>
                                            <span className="text-xs font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                                                {contest._count.participants} joined
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-4">
                                        {/* Title */}
                                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                                            {contest.title}
                                        </h3>
                                        
                                        {/* Organization */}
                                        <p className="text-xs text-gray-400 mb-3">
                                            by {contest.organization?.name || 'Organization'}
                                        </p>
                                        
                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {formatDate(contest.startTime)}
                                            </span>
                                            <span className={`text-xs font-semibold ${timeInfo.color}`}>
                                                {timeInfo.text}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}

                {/* Pagination Info */}
                {contests.length > 0 && (
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-medium text-gray-700">{contests.length}</span> of{" "}
                            <span className="font-medium text-gray-700">{total}</span> contests
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
