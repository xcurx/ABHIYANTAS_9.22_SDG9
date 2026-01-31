import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { getComputedHackathonStatus, isRegistrationCurrentlyOpen } from "@/lib/utils/hackathon-status"
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
    ArrowRight,
    Sparkles,
    Star,
    MessageSquare,
    Bell,
} from "lucide-react"
import { formatDate, formatDateTime, cn } from "@/lib/utils"
import RegisterButton from "./register-button"
import HackathonAnnouncements from "@/components/hackathon/hackathon-announcements"
import { HackathonCertificateSection } from "./hackathon-certificate-section"

// Default banner images for hackathons without custom banners
const defaultBanners = [
    "/images/hackathon-banners/hack1.png",
    "/images/hackathon-banners/hack2.png",
    "/images/hackathon-banners/hack3.png",
    "/images/hackathon-banners/hack4.png",
]

// Get a consistent banner based on hackathon id (so same hackathon always gets same image)
function getDefaultBanner(hackathonId: string): string {
    let hash = 0
    for (let i = 0; i < hackathonId.length; i++) {
        hash = ((hash << 5) - hash) + hackathonId.charCodeAt(i)
        hash = hash & hash
    }
    return defaultBanners[Math.abs(hash) % defaultBanners.length]
}

interface HackathonPageProps {
    params: Promise<{ slug: string }>
}

const statusConfig = {
    DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-800" },
    PUBLISHED: { label: "Published", className: "bg-blue-100 text-blue-800" },
    REGISTRATION_OPEN: { label: "Registration Open", className: "bg-green-100 text-green-800 animate-pulse" },
    REGISTRATION_CLOSED: { label: "Registration Closed", className: "bg-yellow-100 text-yellow-800" },
    IN_PROGRESS: { label: "Live Now", className: "bg-red-100 text-red-800 animate-pulse" },
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

    // Check if user is a judge or mentor
    let userRole: { role: string; status: string } | null = null
    if (session?.user?.id) {
        userRole = await prisma.hackathonRole.findFirst({
            where: {
                hackathonId: hackathon.id,
                userId: session.user.id,
            },
            select: { role: true, status: true },
        })
    }

    // Check for pending role invitation
    const hasPendingRoleInvitation = userRole?.status === "PENDING"
    const hasAcceptedRole = userRole?.status === "ACCEPTED"

    // Compute real-time status based on dates (not just DB status)
    const computedStatus = getComputedHackathonStatus(hackathon)
    const status = statusConfig[computedStatus]
    const mode = modeConfig[hackathon.mode]
    const ModeIcon = mode.icon

    const spotsLeft = hackathon.maxParticipants
        ? hackathon.maxParticipants - hackathon._count.registrations
        : null

    // Calculate total prize pool from prizes (use stored value as fallback)
    const calculatedPrizePool = hackathon.prizes.reduce((sum, prize) => sum + (prize.amount || 0), 0)
    const totalPrizePool = calculatedPrizePool > 0 ? calculatedPrizePool : (hackathon.prizePool || 0)

    // Check if registration is currently open based on dates (independent of hackathon status)
    // Registration can be open even when hackathon is IN_PROGRESS
    const registrationOpen = isRegistrationCurrentlyOpen(
        hackathon.registrationStart,
        hackathon.registrationEnd
    )

    // User can register if: registration dates are valid, not already registered, and spots available
    const canRegister =
        registrationOpen &&
        !userRegistration &&
        (spotsLeft === null || spotsLeft > 0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Banner */}
            <div className="relative h-72 md:h-96 bg-blue-600 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-700 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-30"></div>
                </div>

                <Image
                    src={hackathon.bannerImage || getDefaultBanner(hackathon.id)}
                    alt={hackathon.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

                {/* Back button */}
                <div className="absolute top-4 left-4 animate-fade-in">
                    <Link
                        href="/hackathons"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200 text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        All Hackathons
                    </Link>
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2 animate-fade-in">
                    <button className="p-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200">
                        <Share2 className="h-5 w-5" />
                    </button>
                    {isOrganizer && (
                        <Link
                            href={`/hackathons/${hackathon.slug}/manage`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200 text-sm font-medium"
                        >
                            <Settings className="h-4 w-4" />
                            Manage
                        </Link>
                    )}
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 animate-fade-in-up">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className={cn("px-3 py-1.5 rounded-full text-xs font-semibold", status.className)}>
                                {status.label}
                            </span>
                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-gray-800 flex items-center gap-1.5">
                                <ModeIcon className="h-3.5 w-3.5" />
                                {mode.label}
                            </span>
                            {totalPrizePool > 0 && (
                                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-400 text-amber-900 flex items-center gap-1.5">
                                    <Trophy className="h-3.5 w-3.5" />
                                    ₹{totalPrizePool.toLocaleString()} in prizes
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{hackathon.title}</h1>
                        {hackathon.shortDescription && (
                            <p className="text-lg text-white/90 mt-3 max-w-2xl">{hackathon.shortDescription}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Pending Role Invitation Banner */}
            {hasPendingRoleInvitation && userRole && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200">
                    <div className="max-w-5xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    userRole.role === "JUDGE" ? "bg-yellow-100" : "bg-green-100"
                                }`}>
                                    {userRole.role === "JUDGE" ? (
                                        <Star className="h-5 w-5 text-yellow-600" />
                                    ) : (
                                        <MessageSquare className="h-5 w-5 text-green-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        You&apos;ve been invited to be a {userRole.role.toLowerCase()} for this hackathon!
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Accept or decline the invitation to continue
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={`/hackathons/${hackathon.slug}/roles`}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium text-sm whitespace-nowrap"
                            >
                                <Bell className="h-4 w-4" />
                                Respond to Invitation
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center p-4 bg-blue-50 rounded-xl">
                                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-2">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {hackathon._count.registrations}
                                    </div>
                                    <div className="text-sm text-gray-600">Registered</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-xl">
                                    <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center mx-auto mb-2">
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {hackathon.tracks.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Tracks</div>
                                </div>
                                <div className="text-center p-4 bg-amber-50 rounded-xl">
                                    <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-2">
                                        <Trophy className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        ₹{totalPrizePool.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Prize Pool</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-xl">
                                    <div className="h-10 w-10 rounded-xl bg-green-600 flex items-center justify-center mx-auto mb-2">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {hackathon.minTeamSize}-{hackathon.maxTeamSize}
                                    </div>
                                    <div className="text-sm text-gray-600">Team Size</div>
                                </div>
                            </div>
                        </div>

                        {/* Announcements */}
                        <HackathonAnnouncements 
                            hackathonId={hackathon.id} 
                            hackathonSlug={hackathon.slug} 
                        />

                        {/* About */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="text-lg">📋</span> About
                            </h2>
                            <div className="prose prose-gray max-w-none">
                                <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">{hackathon.description}</p>
                            </div>
                        </div>

                        {/* Tracks */}
                        {hackathon.tracks.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="text-lg">🎯</span> Tracks
                                </h2>
                                <div className="grid gap-4">
                                    {hackathon.tracks.map((track) => (
                                        <div
                                            key={track.id}
                                            className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                            style={{ borderLeft: `4px solid ${track.color || "#2563eb"}` }}
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{track.name}</h3>
                                                {track.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{track.description}</p>
                                                )}
                                            </div>
                                            {track.prizeAmount && (
                                                <div className="text-sm text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-lg">
                                                    ₹{track.prizeAmount.toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Prizes */}
                        {hackathon.prizes.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="text-lg">🏆</span> Prizes
                                </h2>
                                <div className="grid gap-4">
                                    {hackathon.prizes.map((prize, index) => (
                                        <div
                                            key={prize.id}
                                            className={cn(
                                                "flex gap-4 p-5 rounded-xl transition-all duration-200 hover:scale-[1.01]",
                                                index === 0 ? "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200" :
                                                    index === 1 ? "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200" :
                                                        index === 2 ? "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200" :
                                                            "bg-gray-50 border border-gray-100"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex items-center justify-center w-14 h-14 rounded-xl shadow-sm",
                                                index === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500" :
                                                    index === 1 ? "bg-gradient-to-br from-gray-300 to-slate-400" :
                                                        index === 2 ? "bg-gradient-to-br from-orange-400 to-amber-500" :
                                                            "bg-blue-600"
                                            )}>
                                                <Trophy className="h-7 w-7 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-semibold text-gray-900">{prize.title}</h3>
                                                    <span className="text-xl font-bold text-green-600">
                                                        ₹{(prize.amount || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                                {prize.description && (
                                                    <p className="text-sm text-gray-600">{prize.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timeline / Stages */}
                        {hackathon.stages.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="text-lg">📅</span> Timeline
                                </h2>
                                <div className="relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-100" />
                                    <div className="space-y-6">
                                        {hackathon.stages.map((stage) => (
                                            <div key={stage.id} className="relative flex gap-4 pl-10">
                                                <div className="absolute left-2 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm" />
                                                <div className="flex-1 pb-6">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                                                        <span className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-medium">
                                                            {stage.type.replace("_", " ")}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
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
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="text-lg">📜</span> Rules
                                </h2>
                                <div className="prose prose-gray max-w-none">
                                    <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">{hackathon.rules}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Registration Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
                            {/* Registration Status */}
                            {userRegistration ? (
                                <div className="mb-4">
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                        <div className="flex items-center gap-2 text-green-700">
                                            <CheckCircle className="h-5 w-5" />
                                            <span className="font-semibold">You&apos;re registered!</span>
                                        </div>
                                        <p className="text-sm text-green-600 mt-1">
                                            Status: {userRegistration.status}
                                        </p>
                                    </div>
                                    {/* Team Link */}
                                    {userRegistration.status === "APPROVED" && (
                                        <>
                                            <Link
                                                href={`/hackathons/${hackathon.slug}/team`}
                                                className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors font-medium text-sm"
                                            >
                                                <Users className="h-4 w-4" />
                                                My Team
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={`/hackathons/${hackathon.slug}/stages`}
                                                className="mt-2 flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-medium text-sm"
                                            >
                                                <Calendar className="h-4 w-4" />
                                                View Stages & Submit
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            ) : spotsLeft === 0 ? (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <XCircle className="h-5 w-5" />
                                        <span className="font-semibold">Registration Full</span>
                                    </div>
                                </div>
                            ) : null}

                            {/* Register Button */}
                            <RegisterButton
                                hackathonId={hackathon.id}
                                hackathonSlug={hackathon.slug}
                                canRegister={canRegister}
                                isRegistered={!!userRegistration}
                                isLoggedIn={!!session?.user}
                            />

                            {/* Spots - show when registration is open */}
                            {registrationOpen && hackathon.maxParticipants && (
                                <div className="mt-4 text-center">
                                    {spotsLeft !== null && spotsLeft > 0 ? (
                                        <div className="bg-blue-50 rounded-xl p-3">
                                            <span className="text-sm font-medium text-blue-700">{spotsLeft} of {hackathon.maxParticipants} spots left</span>
                                            <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${((hackathon.maxParticipants - spotsLeft) / hackathon.maxParticipants) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : spotsLeft === 0 ? (
                                        <span className="text-sm text-red-600 font-medium">All spots filled</span>
                                    ) : null}
                                </div>
                            )}

                            {/* Show when registration is not open */}
                            {!registrationOpen && !userRegistration && (
                                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                    <p className="text-sm text-gray-600 text-center">
                                        {new Date() < hackathon.registrationStart ? (
                                            <>Registration opens {formatDate(hackathon.registrationStart)}</>
                                        ) : (
                                            <>Registration closed on {formatDate(hackathon.registrationEnd)}</>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Role-specific Dashboard Links */}
                        {hasAcceptedRole && userRole && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in" style={{ animationDelay: "225ms" }}>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    {userRole.role === "JUDGE" ? (
                                        <>
                                            <Star className="h-5 w-5 text-yellow-500" />
                                            Judge Dashboard
                                        </>
                                    ) : userRole.role === "MENTOR" ? (
                                        <>
                                            <Users className="h-5 w-5 text-green-500" />
                                            Mentor Dashboard
                                        </>
                                    ) : (
                                        <>
                                            <Users className="h-5 w-5 text-blue-500" />
                                            Your Role: {userRole.role}
                                        </>
                                    )}
                                </h3>
                                {userRole.role === "JUDGE" && (
                                    <Link
                                        href={`/hackathons/${hackathon.slug}/judge`}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-colors font-medium text-sm"
                                    >
                                        <Star className="h-4 w-4" />
                                        Review Submissions
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                )}
                                {userRole.role === "MENTOR" && (
                                    <Link
                                        href={`/hackathons/${hackathon.slug}/mentor`}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-medium text-sm"
                                    >
                                        <Users className="h-4 w-4" />
                                        Mentor Dashboard
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Leaderboard Link */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fade-in" style={{ animationDelay: "230ms" }}>
                            <Link
                                href={`/hackathons/${hackathon.slug}/leaderboard`}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors font-medium text-sm"
                            >
                                <Trophy className="h-4 w-4" />
                                View Leaderboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            
                            {/* Certificate Download - Only show when hackathon is completed and user is registered */}
                            {computedStatus === "COMPLETED" && userRegistration && session?.user?.name && (
                                <div className="mt-3">
                                    <HackathonCertificateSection
                                        participantName={session.user.name}
                                        teamName={null}
                                        eventName={hackathon.title}
                                        rank={null}
                                        prize={null}
                                        track={null}
                                        date={formatDate(hackathon.hackathonEnd)}
                                        organizationName={hackathon.organization?.name}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Key Dates */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in" style={{ animationDelay: "250ms" }}>
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                Key Dates
                            </h3>
                            <div className="space-y-4 text-sm">
                                {hackathon.registrationStart && (
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                        <span className="text-gray-600">Registration Opens</span>
                                        <span className="font-semibold text-gray-900">{formatDate(hackathon.registrationStart)}</span>
                                    </div>
                                )}
                                {hackathon.registrationEnd && (
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                        <span className="text-gray-600">Registration Closes</span>
                                        <span className="font-semibold text-gray-900">{formatDate(hackathon.registrationEnd)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-100 my-2" />
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                                    <span className="text-gray-600">Hackathon Starts</span>
                                    <span className="font-semibold text-green-700">{formatDate(hackathon.hackathonStart)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                                    <span className="text-gray-600">Hackathon Ends</span>
                                    <span className="font-semibold text-red-700">{formatDate(hackathon.hackathonEnd)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Organizer */}
                        {hackathon.organization && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    Organized By
                                </h3>
                                <Link
                                    href={`/organizations/${hackathon.organization.slug}`}
                                    className="flex items-center gap-4 hover:bg-gray-50 -m-2 p-3 rounded-xl transition-colors group"
                                >
                                    {hackathon.organization.logo ? (
                                        <Image
                                            src={hackathon.organization.logo}
                                            alt={hackathon.organization.name}
                                            width={48}
                                            height={48}
                                            className="rounded-xl"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-blue-600" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{hackathon.organization.name}</div>
                                        <div className="text-sm text-gray-500">View organization</div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
