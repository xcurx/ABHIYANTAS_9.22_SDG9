import { Suspense } from "react"
import { HackathonCalendarView } from "./calendar-view"
import { getHackathonsForCalendar } from "@/lib/actions/hackathon"
import { Calendar, Sparkles } from "lucide-react"
import Link from "next/link"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export const metadata = {
    title: "Hackathon Calendar | ELEVATE",
    description: "View upcoming hackathons on our interactive calendar",
}

async function CalendarData({ year, month }: { year: number; month: number }) {
    const hackathons = await getHackathonsForCalendar(year, month)
    return <HackathonCalendarView initialHackathons={hackathons} initialYear={year} initialMonth={month} />
}

export default async function HackathonCalendarPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string; month?: string }>
}) {
    const params = await searchParams
    const now = new Date()
    const year = params.year ? parseInt(params.year) : now.getFullYear()
    const month = params.month ? parseInt(params.month) : now.getMonth() + 1

    // Check if user can create hackathons
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <span className="text-violet-100 text-sm font-medium tracking-wide uppercase">
                                    Event Calendar
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                                Hackathon Calendar
                            </h1>
                            <p className="text-violet-100 text-lg max-w-2xl">
                                Plan your participation and never miss a hackathon. See all stages at a glance.
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/hackathons"
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
                            >
                                List View
                            </Link>
                            {canCreateHackathon && (
                                <Link
                                    href="/hackathons/new"
                                    className="px-4 py-2 bg-white text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-50 transition-colors flex items-center gap-2"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Create Hackathon
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Suspense fallback={<CalendarSkeleton />}>
                    <CalendarData year={year} month={month} />
                </Suspense>
            </div>

            {/* Legend */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Legend</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 shadow-sm"></div>
                                <span className="text-sm text-slate-600">Registration Open</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm"></div>
                                <span className="text-sm text-slate-600">In Progress</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-slate-300"></div>
                                <span className="text-sm text-slate-600">Completed</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Stages</p>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-blue-400"></div>
                                <span className="text-sm text-slate-600">Ideation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-purple-400"></div>
                                <span className="text-sm text-slate-600">Submission</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-orange-400"></div>
                                <span className="text-sm text-slate-600">Evaluation</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">More Stages</p>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-pink-400"></div>
                                <span className="text-sm text-slate-600">Demo Day</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-cyan-400"></div>
                                <span className="text-sm text-slate-600">Mentoring</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-rose-400"></div>
                                <span className="text-sm text-slate-600">Finals</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Mode</p>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🌐</span>
                                <span className="text-sm text-slate-600">Virtual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📍</span>
                                <span className="text-sm text-slate-600">In-Person</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🔄</span>
                                <span className="text-sm text-slate-600">Hybrid</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CalendarSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
            <div className="flex items-center justify-between mb-8">
                <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
                <div className="flex gap-2">
                    <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
                    <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={`header-${i}`} className="h-10 bg-slate-100 rounded-lg"></div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={`cell-${i}`} className="h-32 bg-slate-50 rounded-lg"></div>
                ))}
            </div>
        </div>
    )
}
