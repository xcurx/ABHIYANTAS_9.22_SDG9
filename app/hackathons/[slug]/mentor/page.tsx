import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import prisma from "@/lib/prisma"
import { Navbar } from "@/components/layout/navbar"
import { revalidatePath } from "next/cache"
import { MentoringRequestsClient } from "@/components/meetings/mentoring-requests-client"
import {
    ArrowLeft,
    MessageSquare,
    Users,
    Calendar,
    Clock,
    CheckCircle,
    Video,
    Send,
    HelpCircle,
    AlertCircle,
} from "lucide-react"
import { formatDateTime, cn } from "@/lib/utils"

interface MentorPageProps {
    params: Promise<{ slug: string }>
}

export default async function MentorDashboardPage({ params }: MentorPageProps) {
    const { slug } = await params
    const session = await auth()

    if (!session?.user) {
        redirect(`/sign-in?callbackUrl=/hackathons/${slug}/mentor`)
    }

    const signOutAction = async () => {
        "use server"
        await signOut({ redirectTo: "/" })
    }

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        include: {
            stages: {
                where: { type: "MENTORING_SESSION" },
                orderBy: { order: "asc" },
            },
            teams: {
                include: {
                    leader: { select: { name: true, email: true } },
                    members: {
                        include: { user: { select: { name: true } } },
                    },
                },
            },
        },
    })

    if (!hackathon) {
        notFound()
    }

    // Check if user is a mentor for this hackathon
    const mentorRole = await prisma.hackathonRole.findFirst({
        where: {
            hackathonId: hackathon.id,
            userId: session.user.id,
            role: "MENTOR",
            status: "ACCEPTED",
        },
    })

    if (!mentorRole) {
        redirect(`/hackathons/${slug}`)
    }

    // Get all mentoring requests (submissions to mentoring stages)
    const mentoringRequests = await prisma.stageSubmission.findMany({
        where: {
            stageId: { in: hackathon.stages.map(s => s.id) },
        },
        include: {
            stage: true,
            team: {
                include: {
                    leader: { select: { name: true, email: true } },
                },
            },
            user: { select: { name: true, email: true } },
        },
        orderBy: { submittedAt: "desc" },
    })

    // Get upcoming meetings for this mentor
    const upcomingMeetings = await prisma.meetingSession.findMany({
        where: {
            hackathonId: hackathon.id,
            hostId: session.user.id,
            status: { not: "CANCELLED" },
            scheduledAt: { gte: new Date() },
        },
        include: {
            team: { select: { name: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
    })

    // Get active mentoring sessions
    const now = new Date()
    const activeSessions = hackathon.stages.filter(
        s => now >= s.startDate && now <= s.endDate
    )

    // Stats
    const pendingRequests = mentoringRequests.filter(r => r.status === "PENDING").length
    const respondedRequests = mentoringRequests.filter(r => r.status === "APPROVED").length
    const scheduledMeetings = upcomingMeetings.length

    async function respondToRequest(formData: FormData) {
        "use server"

        const sessionData = await auth()
        if (!sessionData?.user?.id) {
            throw new Error("Unauthorized")
        }

        const requestId = formData.get("requestId") as string
        const response = formData.get("response") as string

        await prisma.stageSubmission.update({
            where: { id: requestId },
            data: {
                feedback: response,
                status: "APPROVED",
                judgedAt: new Date(),
                judgedBy: sessionData.user.id,
            },
        })

        // Notify the requester
        const request = await prisma.stageSubmission.findUnique({
            where: { id: requestId },
            include: { 
                user: true,
                stage: { include: { hackathon: true } },
            },
        })

        if (request) {
            await prisma.notification.create({
                data: {
                    userId: request.userId,
                    type: "SUBMISSION",
                    title: "Mentor Response",
                    message: "A mentor has responded to your mentoring request!",
                    link: `/hackathons/${request.stage.hackathon.slug}/mentoring`,
                },
            })
        }

        revalidatePath(`/hackathons/${slug}/mentor`)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={session.user} signOutAction={signOutAction} />
            
            <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
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
                        <div className="p-2 bg-green-100 rounded-xl">
                            <MessageSquare className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
                            <p className="text-gray-600">{hackathon.title}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="text-2xl font-bold text-gray-900">{hackathon.teams.length}</div>
                        <div className="text-sm text-gray-600">Teams</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="text-2xl font-bold text-green-600">{activeSessions.length}</div>
                        <div className="text-sm text-gray-600">Active Sessions</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="text-2xl font-bold text-amber-600">{pendingRequests}</div>
                        <div className="text-sm text-gray-600">Pending Requests</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="text-2xl font-bold text-blue-600">{respondedRequests}</div>
                        <div className="text-sm text-gray-600">Responded</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="text-2xl font-bold text-purple-600">{scheduledMeetings}</div>
                        <div className="text-sm text-gray-600">Scheduled Meets</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Mentoring Requests */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-amber-600" />
                            Mentoring Requests
                            {pendingRequests > 0 && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                                    {pendingRequests} pending
                                </span>
                            )}
                        </h2>
                        
                        <MentoringRequestsClient
                            requests={mentoringRequests}
                            hackathonId={hackathon.id}
                            hackathonSlug={hackathon.slug}
                            respondAction={respondToRequest}
                            upcomingMeetings={upcomingMeetings}
                        />
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Active Sessions */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Sessions</h2>
                            {hackathon.stages.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border p-4 text-center text-gray-500">
                                    No sessions scheduled
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {hackathon.stages.map((stage) => {
                                        const isActive = now >= stage.startDate && now <= stage.endDate
                                        return (
                                            <div 
                                                key={stage.id}
                                                className={cn(
                                                    "p-3 rounded-xl border",
                                                    isActive 
                                                        ? "bg-green-50 border-green-200" 
                                                        : "bg-white border-gray-200"
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isActive && (
                                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                    )}
                                                    <span className="font-medium text-sm">{stage.name}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDateTime(stage.startDate)}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Teams List */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Teams ({hackathon.teams.length})</h2>
                            
                            {hackathon.teams.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border p-4 text-center text-gray-500">
                                    No teams yet
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border divide-y max-h-96 overflow-y-auto">
                                    {hackathon.teams.map((team) => (
                                        <div key={team.id} className="p-3">
                                            <div className="font-medium text-sm text-gray-900">{team.name}</div>
                                            <div className="text-xs text-gray-500">{team.members.length} members</div>
                                            <a
                                                href={`mailto:${team.leader.email}`}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                {team.leader.email}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
