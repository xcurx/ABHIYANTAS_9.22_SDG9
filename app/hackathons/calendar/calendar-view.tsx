"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Clock, Users, MapPin, ExternalLink, Layers } from "lucide-react"

type HackathonStatus = "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "ONGOING" | "JUDGING" | "COMPLETED" | "CANCELLED"
type StageType = "REGISTRATION" | "IDEATION" | "SUBMISSION" | "EVALUATION" | "DEMO_DAY" | "MENTORING_SESSION" | "WORKSHOP" | "NETWORKING" | "FINALS" | "ANNOUNCEMENT" | "CUSTOM"

interface HackathonStage {
    id: string
    name: string
    type: StageType
    startDate: Date
    endDate: Date
    order: number
    color: string | null
}

interface Hackathon {
    id: string
    title: string
    slug: string
    status: HackathonStatus
    registrationStart: Date
    registrationEnd: Date
    hackathonStart: Date
    hackathonEnd: Date
    mode: "VIRTUAL" | "IN_PERSON" | "HYBRID"
    organization: { name: string } | null
    stages: HackathonStage[]
    _count: { registrations: number }
}

interface CalendarViewProps {
    initialHackathons: Hackathon[]
    initialYear: number
    initialMonth: number
}

const statusStyles: Record<HackathonStatus, {
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
        bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
        text: "text-blue-700",
        dot: "bg-gradient-to-r from-blue-400 to-indigo-400",
        border: "border-blue-200",
        hover: "hover:from-blue-100 hover:to-indigo-100",
    },
    REGISTRATION_OPEN: {
        bg: "bg-gradient-to-r from-amber-50 to-yellow-50",
        text: "text-amber-700",
        dot: "bg-gradient-to-r from-amber-400 to-yellow-400",
        border: "border-amber-200",
        hover: "hover:from-amber-100 hover:to-yellow-100",
    },
    ONGOING: {
        bg: "bg-gradient-to-r from-emerald-50 to-teal-50",
        text: "text-emerald-700",
        dot: "bg-gradient-to-r from-emerald-400 to-teal-400 animate-pulse",
        border: "border-emerald-200",
        hover: "hover:from-emerald-100 hover:to-teal-100",
    },
    JUDGING: {
        bg: "bg-gradient-to-r from-purple-50 to-violet-50",
        text: "text-purple-700",
        dot: "bg-gradient-to-r from-purple-400 to-violet-400",
        border: "border-purple-200",
        hover: "hover:from-purple-100 hover:to-violet-100",
    },
    COMPLETED: {
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

const stageTypeColors: Record<StageType, string> = {
    REGISTRATION: "bg-amber-400",
    IDEATION: "bg-blue-400",
    SUBMISSION: "bg-purple-400",
    EVALUATION: "bg-orange-400",
    DEMO_DAY: "bg-pink-400",
    MENTORING_SESSION: "bg-cyan-400",
    WORKSHOP: "bg-lime-400",
    NETWORKING: "bg-teal-400",
    FINALS: "bg-rose-400",
    ANNOUNCEMENT: "bg-yellow-400",
    CUSTOM: "bg-gray-400",
}

const stageTypeLabels: Record<StageType, string> = {
    REGISTRATION: "Registration",
    IDEATION: "Ideation",
    SUBMISSION: "Submission",
    EVALUATION: "Evaluation",
    DEMO_DAY: "Demo Day",
    MENTORING_SESSION: "Mentoring",
    WORKSHOP: "Workshop",
    NETWORKING: "Networking",
    FINALS: "Finals",
    ANNOUNCEMENT: "Announcement",
    CUSTOM: "Custom",
}

const modeEmoji = {
    VIRTUAL: "🌐",
    IN_PERSON: "📍",
    HYBRID: "🔄",
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function HackathonCalendarView({ initialHackathons, initialYear, initialMonth }: CalendarViewProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [year, setYear] = useState(initialYear)
    const [month, setMonth] = useState(initialMonth)
    const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null)

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
            router.push(`/hackathons/calendar?year=${newYear}&month=${newMonth}`, { scroll: false })
        })
    }

    const goToToday = () => {
        const today = new Date()
        const newYear = today.getFullYear()
        const newMonth = today.getMonth() + 1
        setYear(newYear)
        setMonth(newMonth)
        startTransition(() => {
            router.push(`/hackathons/calendar?year=${newYear}&month=${newMonth}`, { scroll: false })
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
    
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day)
    }

    // Get events for a specific day (only start and end dates)
    const getEventsForDay = (day: number) => {
        const date = new Date(year, month - 1, day)
        const dateStart = new Date(year, month - 1, day, 0, 0, 0)
        const dateEnd = new Date(year, month - 1, day, 23, 59, 59)

        const events: { type: "hackathon" | "stage"; hackathon: Hackathon; stage?: HackathonStage; eventKind: "reg-start" | "reg-end" | "hack-start" | "hack-end" | "stage-start" | "stage-end" }[] = []

        initialHackathons.forEach(hackathon => {
            const regStart = new Date(hackathon.registrationStart)
            const regEnd = new Date(hackathon.registrationEnd)
            const hackStart = new Date(hackathon.hackathonStart)
            const hackEnd = new Date(hackathon.hackathonEnd)

            // Check registration start
            if (regStart >= dateStart && regStart <= dateEnd) {
                events.push({ type: "hackathon", hackathon, eventKind: "reg-start" })
            }
            // Check registration end
            else if (regEnd >= dateStart && regEnd <= dateEnd) {
                events.push({ type: "hackathon", hackathon, eventKind: "reg-end" })
            }
            // Check hackathon start
            else if (hackStart >= dateStart && hackStart <= dateEnd) {
                events.push({ type: "hackathon", hackathon, eventKind: "hack-start" })
            }
            // Check hackathon end
            else if (hackEnd >= dateStart && hackEnd <= dateEnd) {
                events.push({ type: "hackathon", hackathon, eventKind: "hack-end" })
            }

            // Check stage start and end dates
            hackathon.stages.forEach(stage => {
                const stageStart = new Date(stage.startDate)
                const stageEnd = new Date(stage.endDate)
                
                if (stageStart >= dateStart && stageStart <= dateEnd) {
                    events.push({ type: "stage", hackathon, stage, eventKind: "stage-start" })
                } else if (stageEnd >= dateStart && stageEnd <= dateEnd) {
                    events.push({ type: "stage", hackathon, stage, eventKind: "stage-end" })
                }
            })
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
        })
    }

    const getStatusLabel = (status: HackathonStatus) => {
        const labels: Record<HackathonStatus, string> = {
            DRAFT: "Draft",
            PUBLISHED: "Coming Soon",
            REGISTRATION_OPEN: "Registration Open",
            ONGOING: "In Progress",
            JUDGING: "Judging",
            COMPLETED: "Completed",
            CANCELLED: "Cancelled",
        }
        return labels[status]
    }

    return (
        <div className="relative">
            {/* Calendar Card */}
            <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-opacity ${isPending ? "opacity-60" : ""}`}>
                {/* Calendar Header */}
                <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-b border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {MONTHS[month - 1]} {year}
                            </h2>
                            <button
                                onClick={goToToday}
                                className="px-3 py-1.5 text-sm font-medium text-violet-600 bg-violet-100 hover:bg-violet-200 rounded-lg transition-colors"
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
                        const dayEvents = day ? getEventsForDay(day) : []
                        
                        return (
                            <div
                                key={`day-${index}`}
                                className={`min-h-[130px] border-b border-r border-slate-100 p-2 ${
                                    day === null ? "bg-slate-50/50" : isWeekend ? "bg-slate-50/30" : "bg-white"
                                } ${isToday ? "ring-2 ring-inset ring-violet-400 bg-violet-50/30" : ""}`}
                            >
                                {day !== null && (
                                    <>
                                        {/* Day Number */}
                                        <div className={`text-sm font-medium mb-1 ${
                                            isToday 
                                                ? "text-violet-600" 
                                                : isWeekend 
                                                    ? "text-slate-400" 
                                                    : "text-slate-700"
                                        }`}>
                                            {isToday ? (
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-violet-500 text-white text-sm">
                                                    {day}
                                                </span>
                                            ) : (
                                                day
                                            )}
                                        </div>

                                        {/* Events */}
                                        <div className="space-y-1">
                                            {dayEvents.slice(0, 3).map((event, eventIndex) => {
                                                const style = statusStyles[event.hackathon.status]
                                                
                                                // Get label based on event kind
                                                const getEventLabel = () => {
                                                    switch (event.eventKind) {
                                                        case "reg-start": return "📝 Reg. Opens"
                                                        case "reg-end": return "⏰ Reg. Closes"
                                                        case "hack-start": return "🚀 Starts"
                                                        case "hack-end": return "🏁 Ends"
                                                        case "stage-start": return `▶ ${event.stage ? stageTypeLabels[event.stage.type] : ""}`
                                                        case "stage-end": return `◼ ${event.stage ? stageTypeLabels[event.stage.type] : ""} ends`
                                                        default: return ""
                                                    }
                                                }
                                                
                                                if (event.type === "stage" && event.stage) {
                                                    const stageColor = event.stage.color || stageTypeColors[event.stage.type]
                                                    return (
                                                        <button
                                                            key={`${event.hackathon.id}-${event.stage.id}-${event.eventKind}-${eventIndex}`}
                                                            onClick={() => setSelectedHackathon(event.hackathon)}
                                                            className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium truncate border transition-all bg-white hover:bg-slate-50 border-slate-200"
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`w-2 h-2 rounded flex-shrink-0 ${stageColor}`}></div>
                                                                <span className="truncate text-slate-700">{event.hackathon.title}</span>
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 ml-3.5 mt-0.5">
                                                                {getEventLabel()}
                                                            </div>
                                                        </button>
                                                    )
                                                }
                                                
                                                // Determine colors based on event kind
                                                const eventColors = {
                                                    "reg-start": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
                                                    "reg-end": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-400" },
                                                    "hack-start": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
                                                    "hack-end": { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
                                                }
                                                const colors = eventColors[event.eventKind as keyof typeof eventColors] || style
                                                
                                                return (
                                                    <button
                                                        key={`${event.hackathon.id}-${event.eventKind}-${eventIndex}`}
                                                        onClick={() => setSelectedHackathon(event.hackathon)}
                                                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium truncate border transition-all hover:opacity-80 ${colors.bg} ${colors.text} ${colors.border}`}
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`}></div>
                                                            <span className="truncate">{event.hackathon.title}</span>
                                                        </div>
                                                        <div className="text-[10px] opacity-75 ml-3.5 mt-0.5">
                                                            {getEventLabel()}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                            {dayEvents.length > 3 && (
                                                <div className="text-xs text-slate-400 pl-2 font-medium">
                                                    +{dayEvents.length - 2} more
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

            {/* Hackathon Detail Modal */}
            {selectedHackathon && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedHackathon(null)}>
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`p-6 ${statusStyles[selectedHackathon.status].bg} border-b ${statusStyles[selectedHackathon.status].border}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${statusStyles[selectedHackathon.status].dot}`}></div>
                                        <span className={`text-sm font-medium ${statusStyles[selectedHackathon.status].text}`}>
                                            {getStatusLabel(selectedHackathon.status)}
                                        </span>
                                        <span className="text-lg">{modeEmoji[selectedHackathon.mode]}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">{selectedHackathon.title}</h3>
                                    {selectedHackathon.organization && (
                                        <p className="text-sm text-slate-500 mt-1">by {selectedHackathon.organization.name}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedHackathon(null)}
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
                            {/* Key Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <p className="text-xs text-amber-600 font-medium mb-1">Registration</p>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {new Date(selectedHackathon.registrationStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        {" - "}
                                        {new Date(selectedHackathon.registrationEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <p className="text-xs text-emerald-600 font-medium mb-1">Hackathon</p>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {new Date(selectedHackathon.hackathonStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        {" - "}
                                        {new Date(selectedHackathon.hackathonEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </p>
                                </div>
                            </div>

                            {/* Stages */}
                            {selectedHackathon.stages.length > 0 && (
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-violet-500" />
                                        Stages ({selectedHackathon.stages.length})
                                    </p>
                                    <div className="space-y-2">
                                        {selectedHackathon.stages.map((stage) => {
                                            const stageColor = stage.color || stageTypeColors[stage.type]
                                            return (
                                                <div
                                                    key={stage.id}
                                                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                                                >
                                                    <div className={`w-3 h-3 rounded ${stageColor}`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-slate-700 text-sm truncate">{stage.name}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {new Date(stage.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                            {" - "}
                                                            {new Date(stage.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs px-2 py-1 bg-white rounded-full text-slate-500 border border-slate-200">
                                                        {stageTypeLabels[stage.type]}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Registrations</p>
                                    <p className="font-medium">{selectedHackathon._count.registrations} teams registered</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-200">
                            <Link
                                href={`/hackathons/${selectedHackathon.slug}`}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-200"
                            >
                                View Hackathon
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
