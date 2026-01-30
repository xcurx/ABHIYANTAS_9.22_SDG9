import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
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

    // Get active mentoring sessions
    const now = new Date()
    const activeSessions = hackathon.stages.filter(
        s => now >= s.startDate && now <= s.endDate
    )

    // Stats
    const pendingRequests = mentoringRequests.filter(r => r.status === "PENDING").length
    const respondedRequests = mentoringRequests.filter(r => r.status === "APPROVED").length

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
            <div className="max-w-6xl mx-auto px-4 py-8">
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                        
                        {mentoringRequests.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900">No mentoring requests yet</h3>
                                <p className="text-gray-600 mt-2">
                                    When teams request mentoring help, their requests will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {mentoringRequests.map((request) => {
                                    let content: { topic?: string; description?: string; type?: string } = {}
                                    try {
                                        content = JSON.parse(request.content || "{}")
                                    } catch {}

                                    const isPending = request.status === "PENDING"

                                    return (
                                        <div 
                                            key={request.id} 
                                            className={cn(
                                                "bg-white rounded-2xl shadow-sm border overflow-hidden",
                                                isPending && "ring-2 ring-amber-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-4 border-b",
                                                isPending ? "bg-amber-50" : "bg-gray-50"
                                            )}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {isPending ? (
                                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                                        ) : (
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                        )}
                                                        <div>
                                                            <span className="font-semibold text-gray-900">
                                                                {content.topic || "Mentoring Request"}
                                                            </span>
                                                            <span className="text-sm text-gray-500 ml-2">
                                                                from {request.team?.name || request.user?.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className={cn(
                                                        "px-2 py-0.5 text-xs rounded-full font-medium",
                                                        isPending 
                                                            ? "bg-amber-100 text-amber-700" 
                                                            : "bg-green-100 text-green-700"
                                                    )}>
                                                        {isPending ? "Needs Response" : "Responded"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <p className="text-gray-700 mb-3">{content.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                    <span>{request.stage.name}</span>
                                                    <span>•</span>
                                                    <span>{formatDateTime(request.submittedAt)}</span>
                                                    {request.team && (
                                                        <>
                                                            <span>•</span>
                                                            <a 
                                                                href={`mailto:${request.team.leader.email}`}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                Contact Team
                                                            </a>
                                                        </>
                                                    )}
                                                </div>

                                                {request.feedback ? (
                                                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                        <p className="text-sm font-medium text-green-800 mb-1">Your Response:</p>
                                                        <p className="text-sm text-green-700">{request.feedback}</p>
                                                    </div>
                                                ) : (
                                                    <form action={respondToRequest} className="space-y-3">
                                                        <input type="hidden" name="requestId" value={request.id} />
                                                        <textarea
                                                            name="response"
                                                            required
                                                            rows={3}
                                                            placeholder="Provide guidance, answer questions, or suggest a meeting time..."
                                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                                        >
                                                            <Send className="h-4 w-4" />
                                                            Send Response
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
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
