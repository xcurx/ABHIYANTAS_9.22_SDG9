import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import prisma from "@/lib/prisma"
import { Navbar } from "@/components/layout/navbar"
import { revalidatePath } from "next/cache"
import {
    ArrowLeft,
    MessageSquare,
    Send,
    Clock,
    CheckCircle,
    Users,
    HelpCircle,
    Video,
    ExternalLink,
    Calendar,
} from "lucide-react"
import { formatDateTime, cn } from "@/lib/utils"

interface MentoringPageProps {
    params: Promise<{ slug: string }>
}

export default async function MentoringPage({ params }: MentoringPageProps) {
    const { slug } = await params
    const session = await auth()

    if (!session?.user) {
        redirect(`/sign-in?callbackUrl=/hackathons/${slug}/mentoring`)
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
        },
    })

    if (!hackathon) {
        notFound()
    }

    // Check if user is registered
    const registration = await prisma.hackathonRegistration.findUnique({
        where: {
            hackathonId_userId: {
                hackathonId: hackathon.id,
                userId: session.user.id!,
            },
        },
    })

    if (!registration || registration.status !== "APPROVED") {
        redirect(`/hackathons/${slug}`)
    }

    // Get user's team
    const teamMember = await prisma.teamMember.findFirst({
        where: {
            userId: session.user.id,
            team: { hackathonId: hackathon.id },
        },
        include: { 
            team: {
                include: {
                    leader: { select: { id: true } },
                },
            },
        },
    })

    const isTeamLeader = teamMember?.team.leader.id === session.user.id

    // Get existing mentoring requests (using StageSubmission)
    const mentoringRequests = await prisma.stageSubmission.findMany({
        where: {
            stageId: { in: hackathon.stages.map(s => s.id) },
            OR: [
                { userId: session.user.id },
                ...(teamMember ? [{ teamId: teamMember.teamId }] : []),
            ],
        },
        include: {
            stage: true,
        },
        orderBy: { submittedAt: "desc" },
    })

    // Get active mentoring sessions
    const now = new Date()
    const activeSessions = hackathon.stages.filter(
        s => now >= s.startDate && now <= s.endDate
    )

    // Get upcoming meetings for the team
    const upcomingMeetings = teamMember ? await prisma.meetingSession.findMany({
        where: {
            hackathonId: hackathon.id,
            teamId: teamMember.teamId,
            status: { not: "CANCELLED" },
            scheduledAt: { gte: new Date() },
        },
        include: {
            host: { select: { name: true, email: true } },
        },
        orderBy: { scheduledAt: "asc" },
    }) : []

    // Get mentors for this hackathon
    const mentors = await prisma.hackathonRole.findMany({
        where: {
            hackathonId: hackathon.id,
            role: "MENTOR",
            status: "ACCEPTED",
        },
        include: {
            user: { select: { name: true, email: true, avatar: true } },
        },
    })

    async function requestMentoringAction(formData: FormData) {
        "use server"
        
        const sessionData = await auth()
        if (!sessionData?.user?.id) {
            throw new Error("Unauthorized")
        }

        const stageId = formData.get("stageId") as string
        const topic = formData.get("topic") as string
        const description = formData.get("description") as string

        const stage = await prisma.hackathonStage.findUnique({
            where: { id: stageId },
            include: { hackathon: true },
        })

        if (!stage) {
            throw new Error("Stage not found")
        }

        // Get user's team
        const teamMemberData = await prisma.teamMember.findFirst({
            where: {
                userId: sessionData.user.id,
                team: { hackathonId: stage.hackathonId },
            },
        })

        await prisma.stageSubmission.create({
            data: {
                stageId,
                hackathonId: stage.hackathonId,
                userId: sessionData.user.id,
                teamId: teamMemberData?.teamId,
                content: JSON.stringify({
                    type: "mentoring_request",
                    topic,
                    description,
                    requestedAt: new Date().toISOString(),
                }),
                status: "PENDING",
            },
        })

        // Get mentors and notify them
        const hackathonMentors = await prisma.hackathonRole.findMany({
            where: {
                hackathonId: stage.hackathonId,
                role: "MENTOR",
                status: "ACCEPTED",
            },
        })

        for (const mentor of hackathonMentors) {
            await prisma.notification.create({
                data: {
                    userId: mentor.userId,
                    type: "SUBMISSION",
                    title: "New Mentoring Request",
                    message: `A team needs help with: ${topic}`,
                    link: `/hackathons/${stage.hackathon.slug}/mentor`,
                },
            })
        }

        revalidatePath(`/hackathons/${stage.hackathon.slug}/mentoring`)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={session.user} signOutAction={signOutAction} />
            
            <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/hackathons/${slug}/stages`}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Stages
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-xl">
                            <MessageSquare className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Request Mentoring</h1>
                            <p className="text-gray-600">{hackathon.title}</p>
                        </div>
                    </div>
                </div>

                {/* Upcoming Meetings - Join Button */}
                {upcomingMeetings.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Video className="h-5 w-5 text-green-600" />
                            Scheduled Mentoring Sessions
                        </h2>
                        <div className="space-y-3">
                            {upcomingMeetings.map((meeting) => (
                                <div
                                    key={meeting.id}
                                    className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{meeting.title}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDateTime(meeting.scheduledAt)}
                                            <span>•</span>
                                            <span>with {meeting.host.name}</span>
                                        </div>
                                        {meeting.hostNotes && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                <strong>Note:</strong> {meeting.hostNotes}
                                            </p>
                                        )}
                                    </div>
                                    {meeting.meetLink && (
                                        <a
                                            href={meeting.meetLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium"
                                        >
                                            <Video className="h-5 w-5" />
                                            Join Meet
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Available Mentors */}
                {mentors.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-600" />
                            Available Mentors
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {mentors.map((mentor) => (
                                <div key={mentor.id} className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                                        {mentor.user.avatar ? (
                                            <img src={mentor.user.avatar} alt="" className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <span className="text-sm font-medium text-green-700">
                                                {mentor.user.name?.charAt(0) || "M"}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{mentor.user.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Sessions */}
                {activeSessions.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-green-600" />
                            Active Mentoring Sessions
                        </h2>
                        
                        {activeSessions.map((session) => {
                            const existingRequest = mentoringRequests.find(r => r.stageId === session.id)
                            
                            return (
                                <div key={session.id} className="border border-green-200 rounded-xl p-4 bg-green-50 mb-4 last:mb-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{session.name}</h3>
                                            <p className="text-sm text-gray-600">{session.description}</p>
                                        </div>
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full animate-pulse">
                                            🟢 Active Now
                                        </span>
                                    </div>

                                    {existingRequest ? (
                                        <div className="p-3 bg-white rounded-lg border border-green-200">
                                            <div className="flex items-center gap-2 text-green-700 mb-2">
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="font-medium text-sm">Request Submitted</span>
                                            </div>
                                            {(() => {
                                                try {
                                                    const content = JSON.parse(existingRequest.content || "{}")
                                                    return (
                                                        <>
                                                            <p className="text-sm text-gray-700"><strong>Topic:</strong> {content.topic}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Submitted {formatDateTime(existingRequest.submittedAt)}
                                                            </p>
                                                            {existingRequest.feedback && (
                                                                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                                                                    <p className="text-sm font-medium text-blue-900">Mentor Response:</p>
                                                                    <p className="text-sm text-blue-700">{existingRequest.feedback}</p>
                                                                </div>
                                                            )}
                                                        </>
                                                    )
                                                } catch {
                                                    return null
                                                }
                                            })()}
                                        </div>
                                    ) : (
                                        <form action={requestMentoringAction} className="space-y-3">
                                            <input type="hidden" name="stageId" value={session.id} />
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    What do you need help with?
                                                </label>
                                                <input
                                                    type="text"
                                                    name="topic"
                                                    required
                                                    placeholder="e.g., Database design, API architecture, UI/UX feedback"
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Describe your question/challenge
                                                </label>
                                                <textarea
                                                    name="description"
                                                    required
                                                    rows={3}
                                                    placeholder="Provide details about what you're trying to accomplish and where you're stuck..."
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                            >
                                                <Send className="h-4 w-4" />
                                                Request Mentoring
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border p-12 text-center mb-6">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">No Active Mentoring Sessions</h3>
                        <p className="text-gray-600 mt-2">
                            Mentoring sessions are not currently active. Check back during scheduled mentoring times.
                        </p>
                    </div>
                )}

                {/* Past Requests */}
                {mentoringRequests.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-blue-600" />
                            Your Mentoring Requests
                        </h2>
                        <div className="space-y-3">
                            {mentoringRequests.map((request) => {
                                let content: { topic?: string; description?: string } = {}
                                try {
                                    content = JSON.parse(request.content || "{}")
                                } catch {}

                                return (
                                    <div key={request.id} className="p-4 border rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-900">{content.topic || "Mentoring Request"}</span>
                                            <span className={cn(
                                                "px-2 py-0.5 text-xs rounded-full",
                                                request.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                                request.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                                "bg-gray-100 text-gray-700"
                                            )}>
                                                {request.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{content.description}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {request.stage.name} • {formatDateTime(request.submittedAt)}
                                        </p>
                                        {request.feedback && (
                                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-sm font-medium text-green-800">Mentor Response:</p>
                                                <p className="text-sm text-green-700 mt-1">{request.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
