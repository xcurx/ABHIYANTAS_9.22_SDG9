import Link from "next/link"
import Image from "next/image"
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

const statusConfig: Record<HackathonStatus, { label: string; gradient: string; textColor: string; glow?: string }> = {
    DRAFT: { 
        label: "Draft", 
        gradient: "from-slate-100 to-slate-200", 
        textColor: "text-slate-600" 
    },
    PUBLISHED: { 
        label: "Published", 
        gradient: "from-blue-50 to-indigo-100", 
        textColor: "text-indigo-600" 
    },
    REGISTRATION_OPEN: { 
        label: "Registration Open", 
        gradient: "from-emerald-50 to-teal-100", 
        textColor: "text-emerald-600",
        glow: "shadow-emerald-200/50"
    },
    REGISTRATION_CLOSED: { 
        label: "Registration Closed", 
        gradient: "from-amber-50 to-yellow-100", 
        textColor: "text-amber-600" 
    },
    IN_PROGRESS: { 
        label: "Live", 
        gradient: "from-violet-50 to-purple-100", 
        textColor: "text-purple-600",
        glow: "shadow-purple-200/50"
    },
    JUDGING: { 
        label: "Judging", 
        gradient: "from-orange-50 to-amber-100", 
        textColor: "text-orange-600" 
    },
    COMPLETED: { 
        label: "Completed", 
        gradient: "from-slate-50 to-gray-100", 
        textColor: "text-slate-500" 
    },
    CANCELLED: { 
        label: "Cancelled", 
        gradient: "from-red-50 to-rose-100", 
        textColor: "text-red-500" 
    },
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
            <article className="group glass-card rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {/* Banner Image */}
                <div className="relative h-44 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 overflow-hidden">
                    {hackathon.bannerImage ? (
                        <Image
                            src={hackathon.bannerImage}
                            alt={hackathon.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <>
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-xl" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-16 h-16 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                        </>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                        <span className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm bg-gradient-to-r",
                            status.gradient,
                            status.textColor,
                            status.glow && `shadow-lg ${status.glow}`
                        )}>
                            {isLive && <span className="mr-1 inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                            {status.label}
                        </span>
                    </div>

                    {/* Mode Badge */}
                    <div className="absolute top-3 left-3">
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-700 shadow-lg">
                            {mode.icon} {mode.label}
                        </span>
                    </div>

                    {/* Organization Badge - Bottom Left */}
                    {hackathon.organization && (
                        <div className="absolute bottom-3 left-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg">
                                {hackathon.organization.logo ? (
                                    <Image
                                        src={hackathon.organization.logo}
                                        alt={hackathon.organization.name}
                                        width={20}
                                        height={20}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-white">
                                            {hackathon.organization.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <span className="text-xs font-medium text-slate-700 max-w-24 truncate">
                                    {hackathon.organization.name}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Title */}
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {hackathon.title}
                    </h3>
                    {hackathon.shortDescription && (
                        <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">
                            {hackathon.shortDescription}
                        </p>
                    )}

                    {/* Meta Info */}
                    <div className="mt-4 space-y-2.5">
                        {/* Dates */}
                        <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-slate-600">
                                {formatDate(hackathon.hackathonStart)} - {formatDate(hackathon.hackathonEnd)}
                            </span>
                        </div>

                        {/* Registration countdown */}
                        {isPublished && hackathon.registrationStart && (
                            <div className="flex items-center gap-2.5 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-blue-600 font-medium">
                                    Registration opens {getRelativeTime(hackathon.registrationStart)}
                                </span>
                            </div>
                        )}

                        {isRegistrationOpen && hackathon.registrationEnd && (
                            <div className="flex items-center gap-2.5 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-emerald-600 font-medium">
                                    Closes {getRelativeTime(hackathon.registrationEnd)}
                                </span>
                            </div>
                        )}

                        {/* Participants */}
                        <div className="flex items-center gap-2.5 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="text-slate-600">
                                <span className="font-semibold text-slate-800">{hackathon._count.registrations}</span> registered
                                {spotsLeft !== null && spotsLeft > 0 && (
                                    <span className="text-emerald-600 font-medium"> • {spotsLeft} spots left</span>
                                )}
                                {spotsLeft === 0 && (
                                    <span className="text-red-500 font-medium"> • Full</span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                        {/* Prize Pool */}
                        {hackathon.prizePool ? (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
                                    </svg>
                                </div>
                                <span className="font-bold text-amber-600">${hackathon.prizePool.toLocaleString()}</span>
                            </div>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-2">
                            {/* Tracks Count */}
                            {hackathon._count.tracks > 0 && (
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                    {hackathon._count.tracks} {hackathon._count.tracks === 1 ? "track" : "tracks"}
                                </span>
                            )}

                            {/* Type indicator */}
                            {hackathon.type !== "OPEN" && (
                                <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                                    {type.label}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    )
}
