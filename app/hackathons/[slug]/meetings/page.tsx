import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import prisma from "@/lib/prisma"
import { Navbar } from "@/components/layout/navbar"
import {
    ArrowLeft,
    Video,
    Calendar,
    Clock,
    User,
    ExternalLink,
    CheckCircle,
    XCircle,
} from "lucide-react"
import { formatDateTime, cn } from "@/lib/utils"

interface MeetingsPageProps {
    params: Promise<{ slug: string }>
}

export default async function MeetingsPage({ params }: MeetingsPageProps) {
    const { slug } = await params
    const session = await auth()

    if (!session?.user) {
        redirect(`/sign-in?callbackUrl=/hackathons/${slug}/meetings`)
    }

    const signOutAction = async () => {
        "use server"
        await signOut({ redirectTo: "/" })
    }

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
    })

    if (!hackathon) {
        notFound()
    }

    // Get user's team
    const teamMember = await prisma.teamMember.findFirst({
        where: {
            userId: session.user.id,
            team: { hackathonId: hackathon.id },
        },
        include: {
            team: true,
        },
    })

    // Get all meetings for the user (either as host or as team member)
    const now = new Date()
    
    const upcomingMeetings = await prisma.meetingSession.findMany({
        where: {
            hackathonId: hackathon.id,
            OR: [
                { hostId: session.user.id },
                ...(teamMember ? [{ teamId: teamMember.teamId }] : []),
            ],
            status: { not: "CANCELLED" },
            scheduledAt: { gte: now },
        },
        include: {
            host: { select: { id: true, name: true, email: true, avatar: true } },
            team: { select: { name: true } },
        },
        orderBy: { scheduledAt: "asc" },
    })

    const pastMeetings = await prisma.meetingSession.findMany({
        where: {
            hackathonId: hackathon.id,
            OR: [
                { hostId: session.user.id },
                ...(teamMember ? [{ teamId: teamMember.teamId }] : []),
            ],
            scheduledAt: { lt: now },
        },
        include: {
            host: { select: { id: true, name: true, email: true, avatar: true } },
            team: { select: { name: true } },
        },
        orderBy: { scheduledAt: "desc" },
        take: 10,
    })

    const isHost = (meeting: { hostId: string }) => meeting.hostId === session.user.id

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={session.user} signOutAction={signOutAction} />
            
            <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/hackathons/${slug}`}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to {hackathon.title}
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Video className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Your Meetings</h1>
                            <p className="text-gray-600">{hackathon.title}</p>
                        </div>
                    </div>
                </div>

                {/* Upcoming Meetings */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Upcoming Meetings
                        {upcomingMeetings.length > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                {upcomingMeetings.length}
                            </span>
                        )}
                    </h2>

                    {upcomingMeetings.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">No upcoming meetings</h3>
                            <p className="text-gray-600 mt-2">
                                Scheduled meetings with mentors and judges will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingMeetings.map((meeting) => {
                                const isNow = now >= meeting.scheduledAt && now <= meeting.endTime
                                const isSoon = !isNow && meeting.scheduledAt.getTime() - now.getTime() < 30 * 60 * 1000 // 30 min

                                return (
                                    <div 
                                        key={meeting.id}
                                        className={cn(
                                            "bg-white rounded-2xl shadow-sm border overflow-hidden",
                                            isNow && "ring-2 ring-green-500",
                                            isSoon && !isNow && "ring-2 ring-amber-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-4 border-b",
                                            isNow ? "bg-green-50" : isSoon ? "bg-amber-50" : "bg-gray-50"
                                        )}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "p-2 rounded-lg",
                                                        meeting.type === "MENTORING" 
                                                            ? "bg-green-100" 
                                                            : "bg-purple-100"
                                                    )}>
                                                        <Video className={cn(
                                                            "h-5 w-5",
                                                            meeting.type === "MENTORING"
                                                                ? "text-green-600"
                                                                : "text-purple-600"
                                                        )} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                                                        <span className={cn(
                                                            "text-xs px-2 py-0.5 rounded-full",
                                                            meeting.type === "MENTORING"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-purple-100 text-purple-700"
                                                        )}>
                                                            {meeting.type === "MENTORING" ? "Mentoring" : "Evaluation"}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isNow && (
                                                    <span className="px-3 py-1 text-sm font-medium bg-green-600 text-white rounded-full animate-pulse">
                                                        🟢 Happening Now
                                                    </span>
                                                )}
                                                {isSoon && !isNow && (
                                                    <span className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-700 rounded-full">
                                                        Starting Soon
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDateTime(meeting.scheduledAt)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    {meeting.duration} min
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    {isHost(meeting) ? (
                                                        <span>with {meeting.team?.name}</span>
                                                    ) : (
                                                        <span>with {meeting.host.name}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {meeting.description && (
                                                <p className="text-sm text-gray-600 mb-4">{meeting.description}</p>
                                            )}

                                            {meeting.hostNotes && (
                                                <div className="p-3 bg-amber-50 rounded-lg mb-4">
                                                    <p className="text-sm text-amber-800">
                                                        <strong>Notes:</strong> {meeting.hostNotes}
                                                    </p>
                                                </div>
                                            )}

                                            {meeting.meetLink && (
                                                <a
                                                    href={meeting.meetLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={cn(
                                                        "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition",
                                                        isNow
                                                            ? "bg-green-600 text-white hover:bg-green-700"
                                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                                    )}
                                                >
                                                    <Video className="h-5 w-5" />
                                                    {isNow ? "Join Now" : "Join Google Meet"}
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Past Meetings */}
                {pastMeetings.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-600" />
                            Past Meetings
                        </h2>

                        <div className="bg-white rounded-2xl shadow-sm border divide-y">
                            {pastMeetings.map((meeting) => (
                                <div key={meeting.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            meeting.status === "COMPLETED"
                                                ? "bg-green-100"
                                                : meeting.status === "CANCELLED"
                                                ? "bg-red-100"
                                                : "bg-gray-100"
                                        )}>
                                            {meeting.status === "COMPLETED" ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : meeting.status === "CANCELLED" ? (
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            ) : (
                                                <Video className="h-4 w-4 text-gray-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{meeting.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {formatDateTime(meeting.scheduledAt)} •{" "}
                                                {isHost(meeting) ? meeting.team?.name : meeting.host.name}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-xs px-2 py-1 rounded-full",
                                        meeting.status === "COMPLETED" 
                                            ? "bg-green-100 text-green-700"
                                            : meeting.status === "CANCELLED"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-gray-100 text-gray-700"
                                    )}>
                                        {meeting.status === "COMPLETED" ? "Completed" : 
                                         meeting.status === "CANCELLED" ? "Cancelled" : 
                                         meeting.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
