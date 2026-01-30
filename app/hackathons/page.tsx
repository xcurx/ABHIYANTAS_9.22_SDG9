import { Suspense } from "react"
import Link from "next/link"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { getHackathons } from "@/lib/actions/hackathon"
import HackathonFilters from "./hackathon-filters"
import HackathonCard from "./hackathon-card"
import { Calendar, Users, Trophy } from "lucide-react"

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
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                            Discover Hackathons
                        </h1>
                        <p className="mt-4 text-xl text-indigo-100">
                            Find your next challenge and build something amazing
                        </p>
                        {canCreateHackathon && (
                            <div className="mt-6">
                                <Link
                                    href="/hackathons/new"
                                    className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 transition-colors"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Hackathon
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-8 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="flex justify-center">
                                <Calendar className="h-8 w-8 text-indigo-200" />
                            </div>
                            <p className="mt-2 text-3xl font-bold">{pagination.total}</p>
                            <p className="text-sm text-indigo-200">Active Hackathons</p>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center">
                                <Users className="h-8 w-8 text-indigo-200" />
                            </div>
                            <p className="mt-2 text-3xl font-bold">5K+</p>
                            <p className="text-sm text-indigo-200">Participants</p>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center">
                                <Trophy className="h-8 w-8 text-indigo-200" />
                            </div>
                            <p className="mt-2 text-3xl font-bold">$100K+</p>
                            <p className="text-sm text-indigo-200">In Prizes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Filters */}
                <Suspense fallback={<div className="h-16 bg-white rounded-lg animate-pulse" />}>
                    <HackathonFilters />
                </Suspense>

                {/* Results */}
                {hackathons.length === 0 ? (
                    <div className="mt-8 text-center py-12 bg-white rounded-lg shadow">
                        <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hackathons found</h3>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your filters or check back later for new hackathons.
                        </p>
                        <Link
                            href="/hackathons"
                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
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

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-2">
                                {page > 1 && (
                                    <Link
                                        href={`/hackathons?${new URLSearchParams({
                                            ...params,
                                            page: String(page - 1),
                                        }).toString()}`}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                <span className="px-4 py-2 text-sm text-gray-700">
                                    Page {page} of {pagination.totalPages}
                                </span>
                                {page < pagination.totalPages && (
                                    <Link
                                        href={`/hackathons?${new URLSearchParams({
                                            ...params,
                                            page: String(page + 1),
                                        }).toString()}`}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Next
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
