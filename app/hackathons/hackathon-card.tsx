import Link from "next/link"
import Image from "next/image"
import { Calendar, Users, MapPin, Trophy, Clock, Building2, ArrowRight } from "lucide-react"
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
    DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-700" },
    PUBLISHED: { label: "Coming Soon", className: "bg-blue-100 text-blue-700" },
    REGISTRATION_OPEN: { label: "Open", className: "bg-green-100 text-green-700" },
    REGISTRATION_CLOSED: { label: "Registration Closed", className: "bg-yellow-100 text-yellow-700" },
    IN_PROGRESS: { label: "Live", className: "bg-blue-600 text-white" },
    JUDGING: { label: "Judging", className: "bg-orange-100 text-orange-700" },
    COMPLETED: { label: "Completed", className: "bg-gray-100 text-gray-600" },
    CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
}

const modeConfig: Record<HackathonMode, { label: string; icon: string; gradient: string }> = {
    VIRTUAL: { label: "Virtual", icon: "🌐", gradient: "from-cyan-500 to-blue-500" },
    IN_PERSON: { label: "In Person", icon: "📍", gradient: "from-rose-500 to-pink-500" },
    HYBRID: { label: "Hybrid", icon: "🔄", gradient: "from-violet-500 to-purple-500" },
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
    const isLive = hackathon.status === "IN_PROGRESS"
    const spotsLeft = hackathon.maxParticipants
        ? hackathon.maxParticipants - hackathon._count.registrations
        : null

    return (
        <Link href={`/hackathons/${hackathon.slug}`}>
            <article className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                {/* Banner Image */}
                <div className="relative h-44 bg-blue-600">
                    {hackathon.bannerImage ? (
                        <Image
                            src={hackathon.bannerImage}
                            alt={hackathon.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-1/3 translate-y-1/3"></div>
                            </div>
                            <Trophy className="h-16 w-16 text-white/40" />
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                        <span className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm",
                            status.className,
                            isLive && "animate-pulse"
                        )}>
                            {isLive && <span className="inline-block w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span>}
                            {status.label}
                        </span>
                    </div>

                    {/* Mode Badge */}
                    <div className="absolute top-3 left-3">
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 text-gray-800 shadow-sm backdrop-blur-sm">
                            {mode.icon} {mode.label}
                        </span>
                    </div>

                    {/* Prize Pool Highlight */}
                    {hackathon.prizePool && hackathon.prizePool > 0 && (
                        <div className="absolute bottom-3 left-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-amber-900 shadow-sm">
                                <Trophy className="h-3.5 w-3.5" />
                                ${hackathon.prizePool.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Organization */}
                    {hackathon.organization && (
                        <div className="flex items-center gap-2 mb-3">
                            {hackathon.organization.logo ? (
                                <Image
                                    src={hackathon.organization.logo}
                                    alt={hackathon.organization.name}
                                    width={20}
                                    height={20}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Building2 className="h-3 w-3 text-blue-600" />
                                </div>
                            )}
                            <span className="text-sm text-gray-600 truncate">
                                {hackathon.organization.name}
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {hackathon.title}
                    </h3>
                    
                    {/* Description */}
                    {hackathon.shortDescription && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {hackathon.shortDescription}
                        </p>
                    )}

                    {/* Meta Info */}
                    <div className="mt-4 space-y-2.5">
                        {/* Dates */}
                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-4 w-4 text-gray-500" />
                            </div>
                            <span>
                                {formatDate(hackathon.hackathonStart)} - {formatDate(hackathon.hackathonEnd)}
                            </span>
                        </div>

                        {/* Registration countdown */}
                        {isPublished && hackathon.registrationStart && (
                            <div className="flex items-center gap-2.5 text-sm text-blue-600">
                                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="font-medium">Opens {getRelativeTime(hackathon.registrationStart)}</span>
                            </div>
                        )}

                        {isRegistrationOpen && hackathon.registrationEnd && (
                            <div className="flex items-center gap-2.5 text-sm text-green-600">
                                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <Clock className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="font-medium">Closes {getRelativeTime(hackathon.registrationEnd)}</span>
                            </div>
                        )}

                        {/* Participants */}
                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Users className="h-4 w-4 text-gray-500" />
                            </div>
                            <span>
                                <span className="font-semibold text-gray-900">{hackathon._count.registrations}</span> registered
                                {spotsLeft !== null && spotsLeft > 0 && (
                                    <span className="text-green-600 font-medium"> • {spotsLeft} spots left</span>
                                )}
                                {spotsLeft === 0 && (
                                    <span className="text-red-600 font-medium"> • Full</span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                        {/* Tracks Count */}
                        <div className="flex items-center gap-2">
                            {hackathon._count.tracks > 0 && (
                                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                                    {hackathon._count.tracks} {hackathon._count.tracks === 1 ? "track" : "tracks"}
                                </span>
                            )}
                            {hackathon.type !== "OPEN" && (
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                                    {type.label}
                                </span>
                            )}
                        </div>

                        {/* View Arrow */}
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <ArrowRight className="h-4 w-4 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    )
}
