import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import prisma from "@/lib/prisma"
import { Navbar } from "@/components/layout/navbar"
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    Upload,
    ArrowLeft,
    Play,
    Lock,
    Users,
    Star,
    MessageSquare,
    Presentation,
    Filter,
} from "lucide-react"
import { formatDateTime, cn } from "@/lib/utils"

interface StagesPageProps {
    params: Promise<{ slug: string }>
}

const stageTypeConfig = {
    SUBMISSION: { 
        label: "Submission", 
        icon: Upload, 
        color: "bg-blue-100 text-blue-700",
        description: "Submit your project or files"
    },
    REVIEW: { 
        label: "Review", 
        icon: Star, 
        color: "bg-yellow-100 text-yellow-700",
        description: "Your submission will be reviewed"
    },
    PRESENTATION: { 
        label: "Presentation", 
        icon: Presentation, 
        color: "bg-purple-100 text-purple-700",
        description: "Present your project to judges"
    },
    MENTORING_SESSION: { 
        label: "Mentoring", 
        icon: MessageSquare, 
        color: "bg-green-100 text-green-700",
        description: "Get guidance from mentors"
    },
    ELIMINATION: { 
        label: "Elimination", 
        icon: Filter, 
        color: "bg-red-100 text-red-700",
        description: "Teams will be selected for next round"
    },
    EVALUATION: { 
        label: "Evaluation", 
        icon: CheckCircle, 
        color: "bg-orange-100 text-orange-700",
        description: "Submit your work for evaluation"
    },
    IDEATION: { 
        label: "Ideation", 
        icon: FileText, 
        color: "bg-indigo-100 text-indigo-700",
        description: "Submit your project idea"
    },
    DEVELOPMENT: { 
        label: "Development", 
        icon: Upload, 
        color: "bg-cyan-100 text-cyan-700",
        description: "Build and submit your project"
    },
    CHECKPOINT: { 
        label: "Checkpoint", 
        icon: CheckCircle, 
        color: "bg-amber-100 text-amber-700",
        description: "Submit progress update"
    },
    CUSTOM: { 
        label: "Custom", 
        icon: FileText, 
        color: "bg-gray-100 text-gray-700",
        description: "Custom stage"
    },
}

function getStageStatus(stage: { startDate: Date; endDate: Date }) {
    const now = new Date()
    const start = new Date(stage.startDate)
    const end = new Date(stage.endDate)

    if (now < start) {
        return { status: "upcoming", label: "Upcoming", className: "bg-gray-100 text-gray-700" }
    } else if (now >= start && now <= end) {
        return { status: "active", label: "Active Now", className: "bg-green-100 text-green-700 animate-pulse" }
    } else {
        return { status: "completed", label: "Completed", className: "bg-blue-100 text-blue-700" }
    }
}

export default async function StagesPage({ params }: StagesPageProps) {
    const { slug } = await params
    const session = await auth()

    if (!session?.user) {
        redirect(`/sign-in?callbackUrl=/hackathons/${slug}/stages`)
    }

    const signOutAction = async () => {
        "use server"
        await signOut({ redirectTo: "/" })
    }

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        include: {
            stages: {
                orderBy: { order: "asc" },
            },
            organization: {
                select: { name: true },
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
            team: true,
        },
    })

    // Get user's submissions for each stage
    const submissions = await prisma.stageSubmission.findMany({
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
    })

    const submissionsByStage = submissions.reduce((acc, sub) => {
        acc[sub.stageId] = sub
        return acc
    }, {} as Record<string, typeof submissions[0]>)

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
                    <h1 className="text-3xl font-bold text-gray-900">Hackathon Stages</h1>
                    <p className="text-gray-600 mt-2">
                        Track your progress through each stage of {hackathon.title}
                    </p>
                    {teamMember && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                            <Users className="h-4 w-4" />
                            Team: {teamMember.team.name}
                        </div>
                    )}
                </div>

                {/* Stages Timeline */}
                <div className="space-y-6">
                    {hackathon.stages.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">No stages defined yet</h3>
                            <p className="text-gray-600 mt-2">The organizers haven&apos;t set up the hackathon stages yet.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

                            {hackathon.stages.map((stage, index) => {
                                const stageStatus = getStageStatus(stage)
                                const typeConfig = stageTypeConfig[stage.type as keyof typeof stageTypeConfig] || stageTypeConfig.CUSTOM
                                const TypeIcon = typeConfig.icon
                                const submission = submissionsByStage[stage.id]
                                // Allow submission for stages that require it
                                const submittableTypes = ["IDEATION", "DEVELOPMENT", "CHECKPOINT", "PRESENTATION", "EVALUATION", "MENTORING_SESSION", "CUSTOM"]
                                const canSubmit = stageStatus.status === "active" && 
                                    submittableTypes.includes(stage.type)

                                return (
                                    <div key={stage.id} className="relative pl-20 pb-8">
                                        {/* Timeline dot */}
                                        <div className={cn(
                                            "absolute left-6 w-5 h-5 rounded-full border-4 border-white shadow",
                                            stageStatus.status === "completed" ? "bg-green-500" :
                                            stageStatus.status === "active" ? "bg-blue-500 animate-pulse" :
                                            "bg-gray-300"
                                        )} />

                                        {/* Stage card */}
                                        <div className={cn(
                                            "bg-white rounded-2xl shadow-sm border p-6 transition-all duration-200",
                                            stageStatus.status === "active" 
                                                ? "border-blue-200 ring-2 ring-blue-100" 
                                                : "border-gray-100 hover:shadow-md"
                                        )}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    {/* Stage header */}
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className={cn(
                                                            "p-2 rounded-lg",
                                                            typeConfig.color
                                                        )}>
                                                            <TypeIcon className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                                                            <span className={cn(
                                                                "inline-block text-xs px-2 py-0.5 rounded-full mt-1",
                                                                stageStatus.className
                                                            )}>
                                                                {stageStatus.label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Stage description */}
                                                    {stage.description && (
                                                        <p className="text-gray-600 text-sm mb-4">{stage.description}</p>
                                                    )}

                                                    {/* Date range */}
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <Play className="h-4 w-4" />
                                                            <span>{formatDateTime(stage.startDate)}</span>
                                                        </div>
                                                        <span>→</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{formatDateTime(stage.endDate)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Submission status */}
                                                    {submission && (
                                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                                                            <div className="flex items-center gap-2 text-green-700">
                                                                <CheckCircle className="h-4 w-4" />
                                                                <span className="font-medium text-sm">Submitted</span>
                                                            </div>
                                                            <p className="text-xs text-green-600 mt-1">
                                                                Submitted on {formatDateTime(submission.submittedAt)}
                                                            </p>
                                                            {submission.score !== null && (
                                                                <p className="text-sm font-medium text-green-700 mt-1">
                                                                    Score: {submission.score}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action button */}
                                                <div className="flex-shrink-0">
                                                    {stageStatus.status === "upcoming" ? (
                                                        <div className="p-3 bg-gray-100 rounded-xl">
                                                            <Lock className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    ) : canSubmit && !submission ? (
                                                        <Link
                                                            href={`/hackathons/${slug}/stages/${stage.id}/submit`}
                                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                                                        >
                                                            <Upload className="h-4 w-4" />
                                                            Submit
                                                        </Link>
                                                    ) : submission ? (
                                                        <Link
                                                            href={`/hackathons/${slug}/stages/${stage.id}/submission`}
                                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                            View
                                                        </Link>
                                                    ) : stageStatus.status === "active" && stage.type === "MENTORING_SESSION" ? (
                                                        <Link
                                                            href={`/hackathons/${slug}/mentoring`}
                                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
                                                        >
                                                            <MessageSquare className="h-4 w-4" />
                                                            Request Mentoring
                                                        </Link>
                                                    ) : stageStatus.status === "completed" ? (
                                                        <div className="p-3 bg-green-100 rounded-xl">
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
