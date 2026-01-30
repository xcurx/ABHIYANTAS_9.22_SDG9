"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, Play, UserPlus, Settings, BarChart3, CheckCircle } from "lucide-react"

interface ContestActionCardProps {
    contest: {
        id: string
        slug: string
        startTime: Date
        endTime: Date
        duration: number
        status: string
        allowLateJoin: boolean
        showLeaderboard: boolean
        isRegistered: boolean
        isAdmin: boolean
    }
    isLoggedIn: boolean
    onRegister: () => Promise<void>
}

export default function ContestActionCard({ 
    contest, 
    isLoggedIn,
    onRegister 
}: ContestActionCardProps) {
    const [now, setNow] = useState<Date | null>(null)
    const [isRegistering, setIsRegistering] = useState(false)

    useEffect(() => {
        setNow(new Date())
        const interval = setInterval(() => {
            setNow(new Date())
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    // Loading skeleton
    if (!now) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 overflow-hidden">
                <div className="animate-pulse space-y-4">
                    <div className="h-16 bg-gray-100 rounded-xl" />
                    <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto" />
                    <div className="space-y-3 pt-4">
                        <div className="h-12 bg-gray-100 rounded-xl" />
                        <div className="h-12 bg-gray-100 rounded-xl" />
                    </div>
                    <div className="h-12 bg-blue-100 rounded-xl" />
                </div>
            </div>
        )
    }

    const isBeforeStart = now < new Date(contest.startTime)
    const isLive = now >= new Date(contest.startTime) && now <= new Date(contest.endTime)
    const isEnded = now > new Date(contest.endTime)

    const canRegister = 
        isLoggedIn && 
        !contest.isRegistered && 
        !isEnded && 
        (contest.status === "PUBLISHED" || contest.status === "REGISTRATION_OPEN" || contest.status === "LIVE")

    const canStart = 
        isLoggedIn && 
        contest.isRegistered && 
        (isLive || (isBeforeStart && contest.allowLateJoin))

    function getTimeUntil(date: Date): { value: string; unit: string } {
        const target = new Date(date)
        const diff = target.getTime() - now!.getTime()

        if (diff <= 0) return { value: "0", unit: "Started" }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        if (days > 0) return { value: `${days}d ${hours}h`, unit: "remaining" }
        if (hours > 0) return { value: `${hours}h ${minutes}m`, unit: "remaining" }
        return { value: `${minutes}:${seconds.toString().padStart(2, '0')}`, unit: "minutes" }
    }

    function formatDate(date: Date) {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(date))
    }

    async function handleRegister() {
        setIsRegistering(true)
        try {
            await onRegister()
            window.location.reload()
        } catch (error) {
            console.error("Registration failed:", error)
            alert("Failed to register. Please try again.")
        } finally {
            setIsRegistering(false)
        }
    }

    const timeInfo = isLive 
        ? getTimeUntil(contest.endTime)
        : getTimeUntil(contest.startTime)

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Timer Header */}
            <div className={`relative px-6 py-6 text-center ${
                isLive 
                    ? 'bg-red-600' 
                    : isEnded 
                        ? 'bg-gray-600'
                        : 'bg-blue-600'
            }`}>
                {isLive ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                            <span className="font-bold text-white/90 text-sm uppercase tracking-wider">Live Now</span>
                        </div>
                        <p className="text-3xl font-bold text-white font-mono tracking-wide">
                            {timeInfo.value}
                        </p>
                        <p className="text-white/70 text-xs uppercase tracking-wider">
                            {timeInfo.unit} left
                        </p>
                    </div>
                ) : isBeforeStart ? (
                    <div className="space-y-2">
                        <p className="text-white/70 text-xs uppercase tracking-wider font-medium">Starts In</p>
                        <p className="text-4xl font-bold text-white font-mono tracking-wide">
                            {timeInfo.value}
                        </p>
                        <p className="text-white/60 text-xs">{timeInfo.unit}</p>
                    </div>
                ) : (
                    <div className="text-white font-semibold">
                        Contest Ended
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
                {/* Schedule Details */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 font-medium">Start</div>
                            <div className="text-sm font-semibold text-gray-900 truncate">{formatDate(contest.startTime)}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 font-medium">End</div>
                            <div className="text-sm font-semibold text-gray-900 truncate">{formatDate(contest.endTime)}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium">Duration</div>
                            <div className="text-sm font-semibold text-gray-900">{contest.duration} minutes</div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200" />

                {/* Action Buttons */}
                <div className="space-y-3">
                    {!isLoggedIn ? (
                        <Link
                            href="/sign-in"
                            className="block w-full text-center py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Sign in to Register
                        </Link>
                    ) : canRegister ? (
                        <button
                            type="button"
                            onClick={handleRegister}
                            disabled={isRegistering}
                            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRegistering ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Registering...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <UserPlus className="w-5 h-5" />
                                    Register Now
                                </span>
                            )}
                        </button>
                    ) : contest.isRegistered ? (
                        <div className="space-y-3">
                            <div className="py-3 rounded-xl bg-green-50 border border-green-200 text-center">
                                <span className="text-green-700 font-semibold flex items-center justify-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Registered
                                </span>
                            </div>
                            {canStart && (
                                <Link
                                    href={`/coding-contests/${contest.slug}/participate`}
                                    className="block w-full py-3.5 rounded-xl bg-green-600 text-white font-semibold text-center hover:bg-green-700 transition-colors"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <Play className="w-5 h-5" />
                                        Start Contest
                                    </span>
                                </Link>
                            )}
                            {isBeforeStart && !contest.allowLateJoin && (
                                <p className="text-center text-gray-500 text-sm">
                                    You can start when the contest begins
                                </p>
                            )}
                        </div>
                    ) : isEnded ? (
                        <Link
                            href={`/coding-contests/${contest.slug}/results`}
                            className="block w-full py-3.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-center hover:bg-gray-200 transition-colors"
                        >
                            View Results
                        </Link>
                    ) : null}

                    {/* Admin Link */}
                    {contest.isAdmin && (
                        <Link
                            href={`/coding-contests/${contest.slug}/manage`}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <Settings className="w-4 h-4" />
                            Manage Contest
                        </Link>
                    )}

                    {/* Leaderboard Link */}
                    {contest.showLeaderboard && !isBeforeStart && (
                        <Link
                            href={`/coding-contests/${contest.slug}/leaderboard`}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Leaderboard
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
