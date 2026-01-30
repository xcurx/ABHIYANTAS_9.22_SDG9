"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Calendar, Users, Trophy, Plus, ExternalLink, Settings } from "lucide-react"

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

const statusColors: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: "bg-gray-100", text: "text-gray-600" },
    PUBLISHED: { bg: "bg-blue-100", text: "text-blue-700" },
    REGISTRATION_OPEN: { bg: "bg-green-100", text: "text-green-700" },
    REGISTRATION_CLOSED: { bg: "bg-yellow-100", text: "text-yellow-700" },
    IN_PROGRESS: { bg: "bg-purple-100", text: "text-purple-700" },
    JUDGING: { bg: "bg-orange-100", text: "text-orange-700" },
    COMPLETED: { bg: "bg-gray-100", text: "text-gray-600" },
    CANCELLED: { bg: "bg-red-100", text: "text-red-700" },
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
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading hackathons...</p>
            </div>
        )
    }

    if (hackathons.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No hackathons yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first hackathon.
                </p>
                {isAdmin && (
                    <div className="mt-6">
                        <Link
                            href="/hackathons/new"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create Hackathon
                        </Link>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Hackathons</h3>
                    <p className="text-sm text-gray-500">{hackathons.length} hackathon{hackathons.length !== 1 ? "s" : ""}</p>
                </div>
                {isAdmin && (
                    <Link
                        href="/hackathons/new"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Create Hackathon
                    </Link>
                )}
            </div>

            {/* Hackathon List */}
            <div className="grid gap-4">
                {hackathons.map((hackathon) => {
                    const status = statusColors[hackathon.status] || statusColors.DRAFT
                    return (
                        <div
                            key={hackathon.id}
                            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Link
                                            href={`/hackathons/${hackathon.slug}`}
                                            className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                                        >
                                            {hackathon.title}
                                        </Link>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                            {hackathon.status.replace(/_/g, " ")}
                                        </span>
                                        {!hackathon.isPublic && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                Private
                                            </span>
                                        )}
                                    </div>
                                    {hackathon.shortDescription && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {hackathon.shortDescription}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(hackathon.hackathonStart)} - {formatDate(hackathon.hackathonEnd)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {hackathon._count.registrations} registered
                                        </span>
                                        {hackathon.prizePool && hackathon.prizePool > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Trophy className="h-4 w-4" />
                                                ${hackathon.prizePool.toLocaleString()}
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 rounded bg-gray-100 text-xs">
                                            {hackathon.mode}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/hackathons/${hackathon.slug}`}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="View"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            href={`/hackathons/${hackathon.slug}/manage`}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Manage"
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
