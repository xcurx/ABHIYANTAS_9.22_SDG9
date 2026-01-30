import { Suspense } from "react"
import { CalendarView } from "./calendar-view"
import { getContestsForCalendar } from "@/lib/actions/coding-contest"
import { Calendar, Sparkles } from "lucide-react"
import Link from "next/link"

export const metadata = {
    title: "Contest Calendar | ELEVATE",
    description: "View upcoming coding contests on our interactive calendar",
}

async function CalendarData({ year, month }: { year: number; month: number }) {
    const contests = await getContestsForCalendar(year, month)
    return <CalendarView initialContests={contests} initialYear={year} initialMonth={month} />
}

export default async function CalendarPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string; month?: string }>
}) {
    const params = await searchParams
    const now = new Date()
    const year = params.year ? parseInt(params.year) : now.getFullYear()
    const month = params.month ? parseInt(params.month) : now.getMonth() + 1

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <span className="text-emerald-100 text-sm font-medium tracking-wide uppercase">
                                    Event Calendar
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                                Coding Contest Calendar
                            </h1>
                            <p className="text-emerald-100 text-lg max-w-2xl">
                                Plan ahead and never miss a contest. View all upcoming events at a glance.
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/coding-contests"
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
                            >
                                List View
                            </Link>
                            <Link
                                href="/coding-contests/new"
                                className="px-4 py-2 bg-white text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors flex items-center gap-2"
                            >
                                <Sparkles className="h-4 w-4" />
                                Create Contest
                            </Link>
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
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 shadow-sm"></div>
                            <span className="text-sm text-slate-600">Starting Soon</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm"></div>
                            <span className="text-sm text-slate-600">Registration Open</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 shadow-sm animate-pulse"></div>
                            <span className="text-sm text-slate-600">Live Now</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-slate-300"></div>
                            <span className="text-sm text-slate-600">Ended</span>
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
                    <div key={`cell-${i}`} className="h-28 bg-slate-50 rounded-lg"></div>
                ))}
            </div>
        </div>
    )
}
