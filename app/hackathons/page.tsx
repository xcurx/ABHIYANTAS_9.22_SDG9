import { Suspense } from "react"
import Link from "next/link"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { getHackathons } from "@/lib/actions/hackathon"
import HackathonFilters from "./hackathon-filters"
import HackathonCard from "./hackathon-card"

interface PageProps {
    searchParams: Promise<{
        status?: string
        type?: string
        mode?: string
        search?: string
        page?: string
    }>
}

export default async function HackathonsPage({ searchParams }: PageProps) {
    const params = await searchParams
    const page = parseInt(params.page || "1", 10)

    const { hackathons, pagination } = await getHackathons({
        status: params.status,
        type: params.type,
        mode: params.mode,
        search: params.search,
        page,
        limit: 12,
    })

    // Check if user can create hackathons (is admin/owner of any organization)
    const session = await auth()
    let canCreateHackathon = false
    if (session?.user?.id) {
        const adminMembership = await prisma.organizationMember.findFirst({
            where: {
                userId: session.user.id,
                role: { in: ["OWNER", "ADMIN"] },
            },
        })
        canCreateHackathon = !!adminMembership
    }

    return (
        <div className="min-h-screen pattern-bg">
            {/* Premium Hero Header */}
            <header className="relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-400/30 via-violet-400/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-400/30 via-pink-400/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnptMCAyYy00LjQxOCAwLTgtMy41ODItOC04czMuNTgyLTggOC04IDggMy41ODIgOCA4LTMuNTgyIDgtOCA4eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-30" />
                
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            {pagination.total} Active Hackathons
                        </div>
                        
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Discover{" "}
                            <span className="relative">
                                <span className="relative z-10">Hackathons</span>
                                <span className="absolute bottom-2 left-0 w-full h-3 bg-gradient-to-r from-yellow-400/50 to-orange-400/50 -rotate-1" />
                            </span>
                        </h1>
                        <p className="mt-6 text-xl text-indigo-100 max-w-2xl mx-auto">
                            Find your next challenge, collaborate with brilliant minds, and build something amazing
                        </p>
                        
                        {canCreateHackathon && (
                            <div className="mt-8">
                                <Link
                                    href="/hackathons/new"
                                    className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-7 py-4 text-base font-semibold text-indigo-600 shadow-lg shadow-indigo-900/20 hover:bg-indigo-50 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </span>
                                    Create Hackathon
                                </Link>
                            </div>
                        )}

                        {/* Quick Stats */}
                        <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
                            <div className="glass-card bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
                                <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-indigo-400/50 to-violet-400/50 flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-white">{pagination.total}</p>
                                <p className="text-sm text-indigo-200 mt-1">Active Events</p>
                            </div>
                            <div className="glass-card bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
                                <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-emerald-400/50 to-teal-400/50 flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-white">5K+</p>
                                <p className="text-sm text-indigo-200 mt-1">Participants</p>
                            </div>
                            <div className="glass-card bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
                                <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-amber-400/50 to-orange-400/50 flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-white">$100K+</p>
                                <p className="text-sm text-indigo-200 mt-1">In Prizes</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Wave Decoration */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 120L60 105C120 90 240 60 360 55C480 50 600 70 720 75C840 80 960 70 1080 65C1200 60 1320 60 1380 60L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" className="fill-slate-50"/>
                    </svg>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 -mt-6">
                {/* Back to Dashboard */}
                <Link 
                    href="/dashboard" 
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Link>

                {/* Filters */}
                <Suspense fallback={
                    <div className="glass-card rounded-2xl h-16 animate-pulse" />
                }>
                    <HackathonFilters />
                </Suspense>

                {/* Results */}
                {hackathons.length === 0 ? (
                    <div className="mt-8 glass-card rounded-3xl p-12 text-center">
                        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No hackathons found</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                            Try adjusting your filters or check back later for new hackathons.
                        </p>
                        <Link
                            href="/hackathons"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Clear filters
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Hackathon Grid */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hackathons.map((hackathon) => (
                                <HackathonCard key={hackathon.id} hackathon={hackathon} />
                            ))}
                        </div>

                        {/* Premium Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-2">
                                {page > 1 && (
                                    <Link
                                        href={`/hackathons?${new URLSearchParams({
                                            ...params,
                                            page: String(page - 1),
                                        }).toString()}`}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 glass-card rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Previous
                                    </Link>
                                )}
                                
                                <div className="flex items-center gap-1 px-4 py-2 glass-card rounded-xl">
                                    <span className="text-sm font-medium text-slate-600">Page</span>
                                    <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold mx-1">{page}</span>
                                    <span className="text-sm font-medium text-slate-600">of {pagination.totalPages}</span>
                                </div>
                                
                                {page < pagination.totalPages && (
                                    <Link
                                        href={`/hackathons?${new URLSearchParams({
                                            ...params,
                                            page: String(page + 1),
                                        }).toString()}`}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        Next
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
