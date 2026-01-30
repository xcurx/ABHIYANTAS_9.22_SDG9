import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import {
    Calendar,
    Users,
    Trophy,
    Clock,
    Building2,
    Globe,
    MapPin,
    ArrowLeft,
    Share2,
    Settings,
    CheckCircle,
    XCircle,
} from "lucide-react"
import { formatDate, formatDateTime, cn } from "@/lib/utils"
import RegisterButton from "./register-button"

interface HackathonPageProps {
    params: Promise<{ slug: string }>
}

const statusConfig = {
    DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-800" },
    PUBLISHED: { label: "Published", className: "bg-blue-100 text-blue-800" },
    REGISTRATION_OPEN: { label: "Registration Open", className: "bg-green-100 text-green-800" },
    REGISTRATION_CLOSED: { label: "Registration Closed", className: "bg-yellow-100 text-yellow-800" },
    IN_PROGRESS: { label: "In Progress", className: "bg-purple-100 text-purple-800" },
    JUDGING: { label: "Judging", className: "bg-orange-100 text-orange-800" },
    COMPLETED: { label: "Completed", className: "bg-gray-100 text-gray-800" },
    CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800" },
}

const modeConfig = {
    VIRTUAL: { label: "Virtual", icon: Globe },
    IN_PERSON: { label: "In Person", icon: MapPin },
    HYBRID: { label: "Hybrid", icon: Globe },
}

export async function generateMetadata({ params }: HackathonPageProps) {
    const { slug } = await params
    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        select: { title: true, shortDescription: true },
    })

    if (!hackathon) {
        return { title: "Hackathon Not Found" }
    }

    return {
        title: `${hackathon.title} | ELEVATE`,
        description: hackathon.shortDescription || `Join ${hackathon.title} hackathon`,
    }
}

export default async function HackathonPage({ params }: HackathonPageProps) {
    const { slug } = await params
    const session = await auth()

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                },
            },
            tracks: true,
            prizes: {
                orderBy: { position: "asc" },
            },
            stages: {
                orderBy: { order: "asc" },
            },
            _count: {
                select: {
                    registrations: true,
                },
            },
        },
    })

    if (!hackathon) {
        notFound()
    }

    // Check if user is registered
    let userRegistration = null
    if (session?.user?.id) {
        userRegistration = await prisma.hackathonRegistration.findUnique({
            where: {
                hackathonId_userId: {
                    hackathonId: hackathon.id,
                    userId: session.user.id,
                },
            },
        })
    }

    // Check if user is organizer (via organization membership)
    let isOrganizer = false
    if (session?.user?.id) {
        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: session.user.id,
                    organizationId: hackathon.organizationId,
                },
            },
        })
        isOrganizer = membership?.role === "OWNER" || membership?.role === "ADMIN"
    }

    const status = statusConfig[hackathon.status]
    const mode = modeConfig[hackathon.mode]
    const ModeIcon = mode.icon

    const spotsLeft = hackathon.maxParticipants
        ? hackathon.maxParticipants - hackathon._count.registrations
        : null

    const canRegister =
        hackathon.status === "REGISTRATION_OPEN" &&
        !userRegistration &&
        (spotsLeft === null || spotsLeft > 0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Banner */}
            <div className="relative h-64 md:h-80 bg-gradient-to-r from-indigo-600 to-purple-600">
                {hackathon.bannerImage && (
                    <Image
                        src={hackathon.bannerImage}
                        alt={hackathon.title}
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-black/40" />

                {/* Back button */}
                <div className="absolute top-4 left-4">
                    <Link
                        href="/hackathons"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-md hover:bg-white/20 transition-colors text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        All Hackathons
                    </Link>
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <button className="p-2 bg-white/10 backdrop-blur-sm text-white rounded-md hover:bg-white/20 transition-colors">
                        <Share2 className="h-5 w-5" />
                    </button>
                    {isOrganizer && (
                        <Link
                            href={`/hackathons/${hackathon.slug}/manage`}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-md hover:bg-white/20 transition-colors text-sm"
                        >
                            <Settings className="h-4 w-4" />
                            Manage
                        </Link>
                    )}
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", status.className)}>
                                {status.label}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 flex items-center gap-1">
                                <ModeIcon className="h-3 w-3" />
                                {mode.label}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">{hackathon.title}</h1>
                        {hackathon.shortDescription && (
                            <p className="text-lg text-white/90 mt-2">{hackathon.shortDescription}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-600">
                                        {hackathon._count.registrations}
                                    </div>
                                    <div className="text-sm text-gray-600">Registered</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-600">
                                        {hackathon.tracks.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Tracks</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-amber-600">
                                        ${(hackathon.prizePool || 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Prize Pool</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {hackathon.minTeamSize}-{hackathon.maxTeamSize}
                                    </div>
                                    <div className="text-sm text-gray-600">Team Size</div>
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                            <div className="prose prose-gray max-w-none">
                                <p className="whitespace-pre-wrap">{hackathon.description}</p>
                            </div>
                        </div>

                        {/* Tracks */}
                        {hackathon.tracks.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tracks</h2>
                                <div className="grid gap-4">
                                    {hackathon.tracks.map((track) => (
                                        <div
                                            key={track.id}
                                            className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                                            style={{ borderLeft: `4px solid ${track.color || "#6366f1"}` }}
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{track.name}</h3>
                                                {track.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{track.description}</p>
                                                )}
                                            </div>
                                            {track.prizeAmount && (
                                                <div className="text-sm text-green-600 font-medium">
                                                    ${track.prizeAmount.toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Prizes */}
                        {hackathon.prizes.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Prizes</h2>
                                <div className="grid gap-4">
                                    {hackathon.prizes.map((prize, index) => (
                                        <div
                                            key={prize.id}
                                            className={cn(
                                                "flex gap-4 p-4 rounded-lg",
                                                index === 0 ? "bg-amber-50 border border-amber-200" :
                                                    index === 1 ? "bg-gray-100 border border-gray-200" :
                                                        index === 2 ? "bg-orange-50 border border-orange-200" :
                                                            "bg-gray-50"
                                            )}
                                        >
                                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm">
                                                <Trophy
                                                    className={cn(
                                                        "h-6 w-6",
                                                        index === 0 ? "text-amber-500" :
                                                            index === 1 ? "text-gray-500" :
                                                                index === 2 ? "text-orange-500" :
                                                                    "text-indigo-500"
                                                    )}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-gray-900">{prize.title}</h3>
                                                    <span className="text-lg font-bold text-green-600">
                                                        ${(prize.amount || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                                {prize.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{prize.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timeline / Stages */}
                        {hackathon.stages.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
                                <div className="relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                                    <div className="space-y-6">
                                        {hackathon.stages.map((stage) => (
                                            <div key={stage.id} className="relative flex gap-4 pl-10">
                                                <div className="absolute left-2.5 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white" />
                                                <div className="flex-1 pb-6">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-medium text-gray-900">{stage.name}</h3>
                                                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                                            {stage.type.replace("_", " ")}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {formatDateTime(stage.startDate)} - {formatDateTime(stage.endDate)}
                                                    </div>
                                                    {stage.description && (
                                                        <p className="text-sm text-gray-500 mt-2">{stage.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rules */}
                        {hackathon.rules && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Rules</h2>
                                <div className="prose prose-gray max-w-none">
                                    <p className="whitespace-pre-wrap">{hackathon.rules}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Registration Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                            {/* Registration Status */}
                            {userRegistration ? (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <CheckCircle className="h-5 w-5" />
                                        <span className="font-medium">You are registered!</span>
                                    </div>
                                    <p className="text-sm text-green-600 mt-1">
                                        Status: {userRegistration.status}
                                    </p>
                                </div>
                            ) : spotsLeft === 0 ? (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <XCircle className="h-5 w-5" />
                                        <span className="font-medium">Registration Full</span>
                                    </div>
                                </div>
                            ) : null}

                            {/* Register Button */}
                            <RegisterButton
                                hackathonId={hackathon.id}
                                canRegister={canRegister}
                                isRegistered={!!userRegistration}
                                isLoggedIn={!!session?.user}
                            />

                            {/* Spots */}
                            {hackathon.maxParticipants && (
                                <div className="mt-4 text-center text-sm text-gray-600">
                                    {spotsLeft !== null && spotsLeft > 0 ? (
                                        <span>{spotsLeft} of {hackathon.maxParticipants} spots left</span>
                                    ) : spotsLeft === 0 ? (
                                        <span className="text-red-600">All spots filled</span>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Key Dates */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-indigo-600" />
                                Key Dates
                            </h3>
                            <div className="space-y-3 text-sm">
                                {hackathon.registrationStart && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Registration Opens</span>
                                        <span className="font-medium">{formatDate(hackathon.registrationStart)}</span>
                                    </div>
                                )}
                                {hackathon.registrationEnd && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Registration Closes</span>
                                        <span className="font-medium">{formatDate(hackathon.registrationEnd)}</span>
                                    </div>
                                )}
                                <hr />
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Hackathon Starts</span>
                                    <span className="font-medium">{formatDate(hackathon.hackathonStart)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Hackathon Ends</span>
                                    <span className="font-medium">{formatDate(hackathon.hackathonEnd)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Organizer */}
                        {hackathon.organization && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-indigo-600" />
                                    Organized By
                                </h3>
                                <Link
                                    href={`/organizations/${hackathon.organization.slug}`}
                                    className="flex items-center gap-3 hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
                                >
                                    {hackathon.organization.logo ? (
                                        <Image
                                            src={hackathon.organization.logo}
                                            alt={hackathon.organization.name}
                                            width={48}
                                            height={48}
                                            className="rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-indigo-600" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-medium text-gray-900">{hackathon.organization.name}</div>
                                        <div className="text-sm text-gray-500">View organization</div>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
