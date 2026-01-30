"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

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
            <div className="glass-card rounded-3xl p-6 overflow-hidden">
                <div className="animate-pulse space-y-4">
                    <div className="h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl" />
                    <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto" />
                    <div className="space-y-3 pt-4">
                        <div className="h-12 bg-slate-100 rounded-xl" />
                        <div className="h-12 bg-slate-100 rounded-xl" />
                    </div>
                    <div className="h-12 bg-gradient-to-r from-indigo-200 to-violet-200 rounded-xl" />
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
        <div className="glass-card rounded-3xl overflow-hidden">
            {/* Timer Header */}
            <div className={`relative px-6 py-6 text-center overflow-hidden ${
                isLive 
                    ? 'bg-gradient-to-br from-red-500 via-rose-500 to-pink-500' 
                    : isEnded 
                        ? 'bg-gradient-to-br from-slate-500 to-slate-600'
                        : 'bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500'
            }`}>
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)'
                    }} />
                </div>
                
                {isLive ? (
                    <div className="relative space-y-2">
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
                    <div className="relative space-y-2">
                        <p className="text-white/70 text-xs uppercase tracking-wider font-medium">Starts In</p>
                        <p className="text-4xl font-bold text-white font-mono tracking-wide">
                            {timeInfo.value}
                        </p>
                        <p className="text-white/60 text-xs">{timeInfo.unit}</p>
                    </div>
                ) : (
                    <div className="relative text-white/90 font-semibold">
                        Contest Ended
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
                {/* Schedule Details */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-500 font-medium">Start</div>
                            <div className="text-sm font-semibold text-slate-700 truncate">{formatDate(contest.startTime)}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-500 font-medium">End</div>
                            <div className="text-sm font-semibold text-slate-700 truncate">{formatDate(contest.endTime)}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-slate-500 font-medium">Duration</div>
                            <div className="text-sm font-semibold text-slate-700">{contest.duration} minutes</div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Action Buttons */}
                <div className="space-y-3">
                    {!isLoggedIn ? (
                        <Link
                            href="/sign-in"
                            className="group block w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Sign in to Register
                        </Link>
                    ) : canRegister ? (
                        <button
                            type="button"
                            onClick={handleRegister}
                            disabled={isRegistering}
                            className="group w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {isRegistering ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Registering...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Register Now
                                </span>
                            )}
                        </button>
                    ) : contest.isRegistered ? (
                        <div className="space-y-3">
                            <div className="py-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 text-center">
                                <span className="text-emerald-600 font-semibold flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Registered
                                </span>
                            </div>
                            {canStart && (
                                <Link
                                    href={`/coding-contests/${contest.slug}/participate`}
                                    className="group block w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-center shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Start Contest
                                    </span>
                                </Link>
                            )}
                            {isBeforeStart && !contest.allowLateJoin && (
                                <p className="text-center text-slate-500 text-sm">
                                    You can start when the contest begins
                                </p>
                            )}
                        </div>
                    ) : isEnded ? (
                        <Link
                            href={`/coding-contests/${contest.slug}/results`}
                            className="block w-full py-3.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-center hover:bg-slate-200 transition-colors"
                        >
                            View Results
                        </Link>
                    ) : null}

                    {/* Admin Link */}
                    {contest.isAdmin && (
                        <Link
                            href={`/coding-contests/${contest.slug}/manage`}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Manage Contest
                        </Link>
                    )}

                    {/* Leaderboard Link */}
                    {contest.showLeaderboard && !isBeforeStart && (
                        <Link
                            href={`/coding-contests/${contest.slug}/leaderboard`}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Leaderboard
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
