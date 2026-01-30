import Link from "next/link"
import Image from "next/image"
import { Calendar, Users, MapPin, Trophy, Clock, Building2 } from "lucide-react"
import { formatDate, getRelativeTime, cn } from "@/lib/utils"
import { HackathonStatus, HackathonMode, HackathonType } from "@/generated/prisma/enums"

interface HackathonCardProps {
    hackathon: {
        id: string
        title: string
        slug: string
        shortDescription: string | null
        bannerImage: string | null
        status: HackathonStatus
        type: HackathonType
        mode: HackathonMode
        registrationStart: Date
        registrationEnd: Date
        hackathonStart: Date
        hackathonEnd: Date
        maxParticipants: number | null
        prizePool: number | null
        organization: {
            name: string
            logo: string | null
        } | null
        _count: {
            registrations: number
            tracks: number
        }
    }
}

const statusConfig: Record<HackathonStatus, { label: string; className: string }> = {
    DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-800" },
    PUBLISHED: { label: "Published", className: "bg-blue-100 text-blue-800" },
    REGISTRATION_OPEN: { label: "Registration Open", className: "bg-green-100 text-green-800" },
    REGISTRATION_CLOSED: { label: "Registration Closed", className: "bg-yellow-100 text-yellow-800" },
    IN_PROGRESS: { label: "In Progress", className: "bg-purple-100 text-purple-800" },
    JUDGING: { label: "Judging", className: "bg-orange-100 text-orange-800" },
    COMPLETED: { label: "Completed", className: "bg-gray-100 text-gray-800" },
    CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800" },
}

const modeConfig: Record<HackathonMode, { label: string; icon: string }> = {
    VIRTUAL: { label: "Virtual", icon: "🌐" },
    IN_PERSON: { label: "In Person", icon: "📍" },
    HYBRID: { label: "Hybrid", icon: "🔄" },
}

const typeConfig: Record<HackathonType, { label: string }> = {
    OPEN: { label: "Open to All" },
    INVITE_ONLY: { label: "Invite Only" },
    ORGANIZATION_ONLY: { label: "Members Only" },
}

export default function HackathonCard({ hackathon }: HackathonCardProps) {
    const status = statusConfig[hackathon.status]
    const mode = modeConfig[hackathon.mode]
    const type = typeConfig[hackathon.type]

    const isRegistrationOpen = hackathon.status === "REGISTRATION_OPEN"
    const isPublished = hackathon.status === "PUBLISHED"
    const spotsLeft = hackathon.maxParticipants
        ? hackathon.maxParticipants - hackathon._count.registrations
        : null

    return (
        <Link href={`/hackathons/${hackathon.slug}`}>
            <article className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-200">
                {/* Banner Image */}
                <div className="relative h-40 bg-gradient-to-r from-indigo-600 to-purple-600">
                    {hackathon.bannerImage ? (
                        <Image
                            src={hackathon.bannerImage}
                            alt={hackathon.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Trophy className="h-16 w-16 text-white/30" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", status.className)}>
                            {status.label}
                        </span>
                    </div>

                    {/* Mode Badge */}
                    <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800">
                            {mode.icon} {mode.label}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Organization */}
                    {hackathon.organization && (
                        <div className="flex items-center gap-2 mb-2">
                            {hackathon.organization.logo ? (
                                <Image
                                    src={hackathon.organization.logo}
                                    alt={hackathon.organization.name}
                                    width={20}
                                    height={20}
                                    className="rounded-full"
                                />
                            ) : (
                                <Building2 className="h-5 w-5 text-gray-400" />
                            )}
                            <span className="text-sm text-gray-600 truncate">
                                {hackathon.organization.name}
                            </span>
                        </div>
                    )}

                    {/* Title & Tagline */}
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {hackathon.title}
                    </h3>
                    {hackathon.shortDescription && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {hackathon.shortDescription}
                        </p>
                    )}

                    {/* Meta Info */}
                    <div className="mt-4 space-y-2">
                        {/* Dates */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>
                                {formatDate(hackathon.hackathonStart)} - {formatDate(hackathon.hackathonEnd)}
                            </span>
                        </div>

                        {/* Registration countdown */}
                        {isPublished && hackathon.registrationStart && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                <Clock className="h-4 w-4 flex-shrink-0" />
                                <span>Registration opens {getRelativeTime(hackathon.registrationStart)}</span>
                            </div>
                        )}

                        {isRegistrationOpen && hackathon.registrationEnd && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <Clock className="h-4 w-4 flex-shrink-0" />
                                <span>Registration closes {getRelativeTime(hackathon.registrationEnd)}</span>
                            </div>
                        )}

                        {/* Participants */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>
                                {hackathon._count.registrations} registered
                                {spotsLeft !== null && spotsLeft > 0 && (
                                    <span className="text-green-600"> • {spotsLeft} spots left</span>
                                )}
                                {spotsLeft === 0 && (
                                    <span className="text-red-600"> • Full</span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        {/* Prize Pool */}
                        {hackathon.prizePool ? (
                            <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
                                <Trophy className="h-4 w-4" />
                                ${hackathon.prizePool.toLocaleString()}
                            </div>
                        ) : (
                            <div />
                        )}

                        {/* Tracks Count */}
                        {hackathon._count.tracks > 0 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {hackathon._count.tracks} {hackathon._count.tracks === 1 ? "track" : "tracks"}
                            </span>
                        )}
                    </div>

                    {/* Type indicator */}
                    {hackathon.type !== "OPEN" && (
                        <div className="mt-2">
                            <span className="text-xs text-gray-500">
                                {type.label}
                            </span>
                        </div>
                    )}
                </div>
            </article>
        </Link>
    )
}
