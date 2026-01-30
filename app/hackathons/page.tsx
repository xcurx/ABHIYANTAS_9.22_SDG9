import { Suspense } from "react"
import Link from "next/link"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { getHackathons } from "@/lib/actions/hackathon"
import HackathonFilters from "./hackathon-filters"
import HackathonCard from "./hackathon-card"
import { Calendar, Users, Trophy, Sparkles, ArrowRight, Zap, Globe, Award, Clock, TrendingUp, Star, Shield, Code } from "lucide-react"

interface PageProps {
    searchParams: Promise<{
        status?: string
        type?: string
        mode?: string
        search?: string
        page?: string
        sort?: string
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
                            <Sparkles className="h-4 w-4" />
                            Discover Amazing Opportunities
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0 }}>
                            Explore Hackathons
                        </h1>
                        <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards', opacity: 0 }}>
                            Find your next challenge, build innovative solutions, and compete with the best minds
                        </p>
                        
                        {canCreateHackathon && (
                            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards', opacity: 0 }}>
                                <Link
                                    href="/hackathons/new"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
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
                    <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards', opacity: 0 }}>
                        <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                            <div className="flex justify-center mb-2">
                                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold">{pagination.total}</p>
                            <p className="text-sm text-blue-200">Active Events</p>
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
                                    <Trophy className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold">$100K+</p>
                            <p className="text-sm text-blue-200">In Prizes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Categories */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards', opacity: 0 }}>
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Code className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Open Innovation</h3>
                        <p className="text-xs text-gray-500">Build anything you imagine</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">AI & ML</h3>
                        <p className="text-xs text-gray-500">Machine learning challenges</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Globe className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Web3 & Blockchain</h3>
                        <p className="text-xs text-gray-500">Decentralized solutions</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Cybersecurity</h3>
                        <p className="text-xs text-gray-500">Security-focused hacks</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Why Join Section */}
                <div className="mb-10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100 animate-fade-in-up" style={{ animationDelay: '0.65s', animationFillMode: 'forwards', opacity: 0 }}>
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Join a Hackathon?</h2>
                        <p className="text-gray-600">Unlock your potential and grow your skills</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center mx-auto mb-3">
                                <TrendingUp className="h-7 w-7 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 text-sm">Skill Growth</h4>
                            <p className="text-xs text-gray-500 mt-1">Learn by building real projects</p>
                        </div>
                        <div className="text-center">
                            <div className="h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center mx-auto mb-3">
                                <Users className="h-7 w-7 text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 text-sm">Networking</h4>
                            <p className="text-xs text-gray-500 mt-1">Connect with like-minded devs</p>
                        </div>
                        <div className="text-center">
                            <div className="h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center mx-auto mb-3">
                                <Award className="h-7 w-7 text-amber-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 text-sm">Win Prizes</h4>
                            <p className="text-xs text-gray-500 mt-1">Compete for exciting rewards</p>
                        </div>
                        <div className="text-center">
                            <div className="h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center mx-auto mb-3">
                                <Star className="h-7 w-7 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 text-sm">Portfolio</h4>
                            <p className="text-xs text-gray-500 mt-1">Showcase your work</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards', opacity: 0 }}>
                    <Suspense fallback={<div className="h-20 bg-white rounded-2xl animate-pulse shadow-sm" />}>
                        <HackathonFilters />
                    </Suspense>
                </div>

                {/* Results */}
                {hackathons.length === 0 ? (
                    <div className="mt-8 text-center py-16 bg-white rounded-2xl shadow-sm animate-fade-in-up" style={{ animationDelay: '0.75s', animationFillMode: 'forwards', opacity: 0 }}>
                        <div className="mx-auto h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
                            <Calendar className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No hackathons found</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Try adjusting your filters or check back later for new hackathons.
                        </p>
                        <Link
                            href="/hackathons"
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-all duration-200"
                        >
                            Clear all filters
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Results Header */}
                        <div className="mt-8 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '0.75s', animationFillMode: 'forwards', opacity: 0 }}>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">All Hackathons</h3>
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-semibold text-blue-600">{hackathons.length}</span> of{" "}
                                    <span className="font-semibold text-blue-600">{pagination.total}</span> hackathons
                                </p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                Updated just now
                            </div>
                        </div>

                        {/* Hackathon Grid */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hackathons.map((hackathon, index) => (
                                <div 
                                    key={hackathon.id} 
                                    className="animate-fade-in-up" 
                                    style={{ animationDelay: `${0.1 * (index % 6)}s`, animationFillMode: 'forwards', opacity: 0 }}
                                >
                                    <HackathonCard hackathon={hackathon} />
                                </div>
                            ))}
                        </div>

                        {/* Premium Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards', opacity: 0 }}>
                                {page > 1 && (
                                    <Link
                                        href={`/hackathons?${new URLSearchParams({
                                            ...params,
                                            page: String(page - 1),
                                        }).toString()}`}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                                    >
                                        <ArrowRight className="h-4 w-4 rotate-180" />
                                        Previous
                                    </Link>
                                )}
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        let pageNum: number
                                        if (pagination.totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (page <= 3) {
                                            pageNum = i + 1
                                        } else if (page >= pagination.totalPages - 2) {
                                            pageNum = pagination.totalPages - 4 + i
                                        } else {
                                            pageNum = page - 2 + i
                                        }
                                        return (
                                            <Link
                                                key={pageNum}
                                                href={`/hackathons?${new URLSearchParams({
                                                    ...params,
                                                    page: String(pageNum),
                                                }).toString()}`}
                                                className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-xl transition-all duration-200 ${
                                                    page === pageNum
                                                        ? "bg-blue-600 text-white"
                                                        : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                                                }`}
                                            >
                                                {pageNum}
                                            </Link>
                                        )
                                    })}
                                </div>
                                {page < pagination.totalPages && (
                                    <Link
                                        href={`/hackathons?${new URLSearchParams({
                                            ...params,
                                            page: String(page + 1),
                                        }).toString()}`}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                                    >
                                        Next
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* CTA Section */}
                        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards', opacity: 0 }}>
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -translate-x-1/3 translate-y-1/3"></div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl md:text-3xl font-bold mb-3">Ready to Host Your Own Hackathon?</h3>
                                <p className="text-blue-100 mb-6 max-w-xl mx-auto">Create and manage hackathons with our powerful platform. Set up tracks, prizes, and engage with participants.</p>
                                <Link
                                    href="/hackathons/new"
                                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-lg"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    Create a Hackathon
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
        </div>    
    )
}
