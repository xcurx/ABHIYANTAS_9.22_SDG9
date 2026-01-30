"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Calendar, Users, Trophy, Plus, ExternalLink, Settings, Loader2, Sparkles, ChevronRight } from "lucide-react"

interface Hackathon {
    id: string
    title: string
    slug: string
    shortDescription: string | null
    status: string
    type: string
    mode: string
    hackathonStart: string
    hackathonEnd: string
    registrationStart: string
    registrationEnd: string
    isPublic: boolean
    prizePool: number | null
    _count: {
        registrations: number
        tracks: number
    }
}

interface HackathonsTabProps {
    organizationId: string
    organizationSlug: string
    isAdmin: boolean
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    DRAFT: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
    PUBLISHED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    REGISTRATION_OPEN: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    REGISTRATION_CLOSED: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    IN_PROGRESS: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    JUDGING: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
    COMPLETED: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
    CANCELLED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
}

const modeColors: Record<string, string> = {
    VIRTUAL: "🌐",
    IN_PERSON: "📍",
    HYBRID: "🔄",
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

export default function HackathonsTab({ organizationId, organizationSlug, isAdmin }: HackathonsTabProps) {
    const [hackathons, setHackathons] = useState<Hackathon[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadHackathons() {
            try {
                const res = await fetch(`/api/organizations/${organizationId}/hackathons`)
                if (res.ok) {
                    const data = await res.json()
                    setHackathons(data.hackathons)
                }
            } catch (error) {
                console.error("Failed to load hackathons:", error)
            } finally {
                setLoading(false)
            }
        }
        loadHackathons()
    }, [organizationId])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="mt-3 text-sm text-gray-500">Loading hackathons...</p>
            </div>
        )
    }

    if (hackathons.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <div className="mx-auto h-20 w-20 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                    <Trophy className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hackathons yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Get started by creating your first hackathon. Host amazing events and bring innovators together!
                </p>
                {isAdmin && (
                    <Link
                        href="/hackathons/new"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all hover:scale-105 btn-animate"
                    >
                        <Plus className="h-4 w-4" />
                        Create Your First Hackathon
                    </Link>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Hackathons</h3>
                    <p className="text-sm text-gray-500">{hackathons.length} hackathon{hackathons.length !== 1 ? "s" : ""} hosted by this organization</p>
                </div>
                {isAdmin && (
                    <Link
                        href="/hackathons/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all hover:scale-105 btn-animate"
                    >
                        <Plus className="h-4 w-4" />
                        Create Hackathon
                    </Link>
                )}
            </div>

            {/* Hackathon List */}
            <div className="grid gap-5">
                {hackathons.map((hackathon, index) => {
                    const status = statusColors[hackathon.status] || statusColors.DRAFT
                    const modeIcon = modeColors[hackathon.mode] || "🌐"
                    return (
                        <div
                            key={hackathon.id}
                            className="group bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <Link
                                            href={`/hackathons/${hackathon.slug}`}
                                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                        >
                                            {hackathon.title}
                                        </Link>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}>
                                            {hackathon.status.replace(/_/g, " ")}
                                        </span>
                                        {!hackathon.isPublic && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                Private
                                            </span>
                                        )}
                                        <span className="text-sm">{modeIcon}</span>
                                    </div>
                                    {hackathon.shortDescription && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {hackathon.shortDescription}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                                        <span className="inline-flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            {formatDate(hackathon.hackathonStart)} - {formatDate(hackathon.hackathonEnd)}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1">
                                            <Users className="h-4 w-4 text-gray-400" />
                                            {hackathon._count.registrations} registered
                                        </span>
                                        {hackathon.prizePool && hackathon.prizePool > 0 && (
                                            <span className="inline-flex items-center gap-1.5 bg-amber-50 rounded-lg px-2.5 py-1 text-amber-700">
                                                <Trophy className="h-4 w-4" />
                                                ${hackathon.prizePool.toLocaleString()}
                                            </span>
                                        )}
                                        {hackathon._count.tracks > 0 && (
                                            <span className="inline-flex items-center gap-1.5 bg-purple-50 rounded-lg px-2.5 py-1 text-purple-700">
                                                <Sparkles className="h-4 w-4" />
                                                {hackathon._count.tracks} tracks
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/hackathons/${hackathon.slug}`}
                                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                        title="View"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            href={`/hackathons/${hackathon.slug}/manage`}
                                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                            title="Manage"
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Link>
                                    )}
                                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
