import { notFound, redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { formatDate, formatDateTime } from "@/lib/utils"
import { publishHackathon } from "@/lib/actions/hackathon"
import {
    Users,
    Trophy,
    TrendingUp,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowUpRight,
} from "lucide-react"
import Link from "next/link"

async function handlePublish(hackathonId: string, slug: string) {
    "use server"
    const result = await publishHackathon(hackathonId)
    if (result.success) {
        redirect(`/hackathons/${slug}/manage`)
    }
}

interface ManageOverviewPageProps {
    params: Promise<{ slug: string }>
}

export default async function ManageOverviewPage({ params }: ManageOverviewPageProps) {
    const { slug } = await params

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        include: {
            registrations: {
                orderBy: { registeredAt: "desc" },
                take: 5,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
            },
            stages: {
                orderBy: { startDate: "asc" },
            },
            _count: {
                select: {
                    registrations: true,
                    tracks: true,
                    prizes: true,
                },
            },
        },
    })

    if (!hackathon) {
        notFound()
    }

    // Calculate stats
    const pendingRegistrations = hackathon.registrations.filter(
        (r) => r.status === "PENDING"
    ).length

    const approvedRegistrations = hackathon.registrations.filter(
        (r) => r.status === "APPROVED"
    ).length

    // Find current/upcoming stage
    const now = new Date()
    const currentStage = hackathon.stages.find(
        (s) => s.startDate <= now && s.endDate >= now
    )
    const upcomingStage = hackathon.stages.find((s) => s.startDate > now)

    // Calculate days until start/end
    const daysUntilStart = Math.ceil(
        (hackathon.hackathonStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    const daysUntilEnd = Math.ceil(
        (hackathon.hackathonEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    return (
        <div className="space-y-6">
            {/* Status Alert */}
            {hackathon.status === "DRAFT" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-medium text-yellow-800">Hackathon is in Draft</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                            Your hackathon is not yet visible to the public. Publish it to make it live.
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                            <form action={handlePublish.bind(null, hackathon.id, slug)}>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Publish Hackathon
                                </button>
                            </form>
                            <Link
                                href={`/hackathons/${slug}/manage/settings`}
                                className="inline-flex items-center gap-1 text-sm font-medium text-yellow-800 hover:text-yellow-900"
                            >
                                Go to Settings <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Registrations</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {hackathon._count.registrations}
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                    {hackathon.maxParticipants && (
                        <p className="text-sm text-gray-500 mt-2">
                            {hackathon.maxParticipants - hackathon._count.registrations} spots remaining
                        </p>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Approval</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{pendingRegistrations}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                    {pendingRegistrations > 0 && (
                        <Link
                            href={`/hackathons/${slug}/manage/participants`}
                            className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
                        >
                            Review now →
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Prize Pool</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                ₹{(hackathon.prizePool || 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-lg">
                            <Trophy className="h-6 w-6 text-amber-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {hackathon._count.prizes} prizes configured
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                {daysUntilStart > 0 ? "Days Until Start" : "Days Remaining"}
                            </p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {daysUntilStart > 0 ? daysUntilStart : Math.max(0, daysUntilEnd)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {formatDate(daysUntilStart > 0 ? hackathon.hackathonStart : hackathon.hackathonEnd)}
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Registrations */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Recent Registrations</h2>
                        <Link
                            href={`/hackathons/${slug}/manage/participants`}
                            className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                            View all →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {hackathon.registrations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No registrations yet
                            </div>
                        ) : (
                            hackathon.registrations.map((registration) => (
                                <div key={registration.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                                            {registration.user.name?.[0]?.toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {registration.user.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {registration.user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                registration.status === "APPROVED"
                                                    ? "bg-green-100 text-green-700"
                                                    : registration.status === "PENDING"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {registration.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Timeline</h2>
                        <Link
                            href={`/hackathons/${slug}/manage/stages`}
                            className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                            Manage →
                        </Link>
                    </div>
                    <div className="p-4">
                        {hackathon.stages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p>No stages configured</p>
                                <Link
                                    href={`/hackathons/${slug}/manage/stages`}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
                                >
                                    Add stages →
                                </Link>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
                                <div className="space-y-4">
                                    {hackathon.stages.slice(0, 5).map((stage) => {
                                        const isPast = stage.endDate < now
                                        const isCurrent =
                                            stage.startDate <= now && stage.endDate >= now

                                        return (
                                            <div key={stage.id} className="relative flex gap-3 pl-8">
                                                <div
                                                    className={`absolute left-1.5 w-3 h-3 rounded-full border-2 ${
                                                        isCurrent
                                                            ? "bg-indigo-600 border-indigo-600"
                                                            : isPast
                                                            ? "bg-green-500 border-green-500"
                                                            : "bg-white border-gray-300"
                                                    }`}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {stage.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(stage.startDate)} -{" "}
                                                        {formatDate(stage.endDate)}
                                                    </p>
                                                </div>
                                                {isCurrent && (
                                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        href={`/hackathons/${slug}/manage/participants`}
                        className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center"
                    >
                        <Users className="h-6 w-6 mx-auto text-indigo-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Manage Participants</span>
                    </Link>
                    <Link
                        href={`/hackathons/${slug}/manage/tracks`}
                        className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center"
                    >
                        <TrendingUp className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Edit Tracks</span>
                    </Link>
                    <Link
                        href={`/hackathons/${slug}/manage/prizes`}
                        className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center"
                    >
                        <Trophy className="h-6 w-6 mx-auto text-amber-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Configure Prizes</span>
                    </Link>
                    <Link
                        href={`/hackathons/${slug}/manage/settings`}
                        className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center"
                    >
                        <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Update Status</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
