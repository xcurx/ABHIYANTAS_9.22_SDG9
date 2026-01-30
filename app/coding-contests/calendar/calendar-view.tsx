"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Clock, Users, Zap, ExternalLink } from "lucide-react"

type ContestStatus = "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "LIVE" | "ENDED" | "CANCELLED"

interface Contest {
    id: string
    title: string
    slug: string
    startTime: Date
    endTime: Date
    status: ContestStatus
    organization: { name: string } | null
    _count: { participants: number }
}

interface CalendarViewProps {
    initialContests: Contest[]
    initialYear: number
    initialMonth: number
}

const statusStyles: Record<ContestStatus, {
    bg: string
    text: string
    dot: string
    border: string
    hover: string
}> = {
    DRAFT: {
        bg: "bg-slate-50",
        text: "text-slate-600",
        dot: "bg-slate-400",
        border: "border-slate-200",
        hover: "hover:bg-slate-100",
    },
    PUBLISHED: {
        bg: "bg-gradient-to-r from-amber-50 to-yellow-50",
        text: "text-amber-700",
        dot: "bg-gradient-to-r from-amber-400 to-yellow-400",
        border: "border-amber-200",
        hover: "hover:from-amber-100 hover:to-yellow-100",
    },
    REGISTRATION_OPEN: {
        bg: "bg-gradient-to-r from-emerald-50 to-teal-50",
        text: "text-emerald-700",
        dot: "bg-gradient-to-r from-emerald-400 to-teal-400",
        border: "border-emerald-200",
        hover: "hover:from-emerald-100 hover:to-teal-100",
    },
    LIVE: {
        bg: "bg-gradient-to-r from-rose-50 to-pink-50",
        text: "text-rose-700",
        dot: "bg-gradient-to-r from-rose-400 to-pink-400 animate-pulse",
        border: "border-rose-200",
        hover: "hover:from-rose-100 hover:to-pink-100",
    },
    ENDED: {
        bg: "bg-slate-50",
        text: "text-slate-500",
        dot: "bg-slate-300",
        border: "border-slate-200",
        hover: "hover:bg-slate-100",
    },
    CANCELLED: {
        bg: "bg-slate-50",
        text: "text-slate-400",
        dot: "bg-slate-300",
        border: "border-slate-200",
        hover: "hover:bg-slate-100",
    },
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function CalendarView({ initialContests, initialYear, initialMonth }: CalendarViewProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [year, setYear] = useState(initialYear)
    const [month, setMonth] = useState(initialMonth)
    const [contests, setContests] = useState(initialContests)
    const [selectedContest, setSelectedContest] = useState<Contest | null>(null)

    const navigateMonth = (direction: "prev" | "next") => {
        let newMonth = month
        let newYear = year

        if (direction === "prev") {
            newMonth = month === 1 ? 12 : month - 1
            newYear = month === 1 ? year - 1 : year
        } else {
            newMonth = month === 12 ? 1 : month + 1
            newYear = month === 12 ? year + 1 : year
        }

        setMonth(newMonth)
        setYear(newYear)
        
        startTransition(() => {
            router.push(`/coding-contests/calendar?year=${newYear}&month=${newMonth}`, { scroll: false })
        })
    }

    const goToToday = () => {
        const today = new Date()
        const newYear = today.getFullYear()
        const newMonth = today.getMonth() + 1
        setYear(newYear)
        setMonth(newMonth)
        startTransition(() => {
            router.push(`/coding-contests/calendar?year=${newYear}&month=${newMonth}`, { scroll: false })
        })
    }

    // Calendar calculations
    const firstDayOfMonth = new Date(year, month - 1, 1)
    const lastDayOfMonth = new Date(year, month, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const startingDayOfWeek = firstDayOfMonth.getDay()
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month

    // Create calendar grid
    const calendarDays: (number | null)[] = []
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day)
    }

    // Get contests for a specific day (only start and end dates)
    const getContestsForDay = (day: number): { contest: Contest; eventKind: "start" | "end" }[] => {
        const dateStart = new Date(year, month - 1, day, 0, 0, 0)
        const dateEnd = new Date(year, month - 1, day, 23, 59, 59)

        const events: { contest: Contest; eventKind: "start" | "end" }[] = []

        initialContests.forEach(contest => {
            const contestStart = new Date(contest.startTime)
            const contestEnd = new Date(contest.endTime)
            
            // Check if contest starts this day
            if (contestStart >= dateStart && contestStart <= dateEnd) {
                events.push({ contest, eventKind: "start" })
            }
            // Check if contest ends this day
            else if (contestEnd >= dateStart && contestEnd <= dateEnd) {
                events.push({ contest, eventKind: "end" })
            }
        })

        return events
    }

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
    }

    const formatFullDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        })
    }

    return (
        <div className="relative">
            {/* Calendar Card */}
            <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-opacity ${isPending ? "opacity-60" : ""}`}>
                {/* Calendar Header */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {MONTHS[month - 1]} {year}
                            </h2>
                            <button
                                onClick={goToToday}
                                className="px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                            >
                                Today
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateMonth("prev")}
                                disabled={isPending}
                                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
                            >
                                <ChevronLeft className="h-5 w-5 text-slate-600" />
                            </button>
                            <button
                                onClick={() => navigateMonth("next")}
                                disabled={isPending}
                                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
                            >
                                <ChevronRight className="h-5 w-5 text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                    {WEEKDAYS.map((day, index) => (
                        <div
                            key={day}
                            className={`py-3 text-center text-sm font-semibold ${
                                index === 0 || index === 6 ? "text-slate-400" : "text-slate-600"
                            }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, index) => {
                        const isToday = isCurrentMonth && day === today.getDate()
                        const isWeekend = index % 7 === 0 || index % 7 === 6
                        const dayContests = day ? getContestsForDay(day) : []
                        
                        return (
                            <div
                                key={`day-${index}`}
                                className={`min-h-[120px] border-b border-r border-slate-100 p-2 ${
                                    day === null ? "bg-slate-50/50" : isWeekend ? "bg-slate-50/30" : "bg-white"
                                } ${isToday ? "ring-2 ring-inset ring-emerald-400 bg-emerald-50/30" : ""}`}
                            >
                                {day !== null && (
                                    <>
                                        {/* Day Number */}
                                        <div className={`text-sm font-medium mb-1 ${
                                            isToday 
                                                ? "text-emerald-600" 
                                                : isWeekend 
                                                    ? "text-slate-400" 
                                                    : "text-slate-700"
                                        }`}>
                                            {isToday ? (
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-sm">
                                                    {day}
                                                </span>
                                            ) : (
                                                day
                                            )}
                                        </div>

                                        {/* Contests */}
                                        <div className="space-y-1">
                                            {dayContests.slice(0, 3).map((event, eventIndex) => {
                                                const style = statusStyles[event.contest.status]
                                                const isStart = event.eventKind === "start"
                                                
                                                // Colors based on start/end
                                                const eventColors = isStart
                                                    ? { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" }
                                                    : { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" }
                                                
                                                return (
                                                    <button
                                                        key={`${event.contest.id}-${event.eventKind}`}
                                                        onClick={() => setSelectedContest(event.contest)}
                                                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium truncate border transition-all hover:opacity-80 ${eventColors.bg} ${eventColors.text} ${eventColors.border}`}
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${eventColors.dot}`}></div>
                                                            <span className="truncate">{event.contest.title}</span>
                                                        </div>
                                                        <div className="text-[10px] opacity-75 ml-3.5 mt-0.5">
                                                            {isStart ? `🚀 Starts ${formatTime(event.contest.startTime)}` : "🏁 Ends"}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                            {dayContests.length > 3 && (
                                                <div className="text-xs text-slate-400 pl-2 font-medium">
                                                    +{dayContests.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Contest Detail Modal */}
            {selectedContest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedContest(null)}>
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`p-6 ${statusStyles[selectedContest.status].bg} border-b ${statusStyles[selectedContest.status].border}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${statusStyles[selectedContest.status].dot}`}></div>
                                        <span className={`text-sm font-medium ${statusStyles[selectedContest.status].text}`}>
                                            {selectedContest.status.replace("_", " ")}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">{selectedContest.title}</h3>
                                    {selectedContest.organization && (
                                        <p className="text-sm text-slate-500 mt-1">by {selectedContest.organization.name}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedContest(null)}
                                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Starts</p>
                                    <p className="font-medium">{formatFullDate(selectedContest.startTime)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Zap className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Ends</p>
                                    <p className="font-medium">{formatFullDate(selectedContest.endTime)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Participants</p>
                                    <p className="font-medium">{selectedContest._count.participants} registered</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-200">
                            <Link
                                href={`/coding-contests/${selectedContest.slug}`}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-200"
                            >
                                View Contest
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
