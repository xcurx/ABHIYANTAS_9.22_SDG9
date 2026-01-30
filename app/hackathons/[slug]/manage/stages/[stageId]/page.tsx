import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { formatDate, formatDateTime, cn } from "@/lib/utils"
import {
    ArrowLeft,
    Calendar,
    Clock,
    FileText,
    Users,
    Target,
    CheckCircle,
    Play,
    AlertCircle,
    Edit,
    Bell,
    BarChart3,
} from "lucide-react"
import StageSubmissions from "./stage-submissions"

interface StageDetailPageProps {
    params: Promise<{ slug: string; stageId: string }>
}

const stageTypeInfo: Record<string, { icon: string; label: string }> = {
    REGISTRATION: { icon: "🎫", label: "Registration" },
    TEAM_FORMATION: { icon: "👥", label: "Team Formation" },
    IDEATION: { icon: "💡", label: "Ideation" },
    MENTORING_SESSION: { icon: "🎓", label: "Mentoring Session" },
    CHECKPOINT: { icon: "🔍", label: "Checkpoint" },
    DEVELOPMENT: { icon: "💻", label: "Development" },
    EVALUATION: { icon: "⚖️", label: "Evaluation" },
    PRESENTATION: { icon: "🎤", label: "Presentation" },
    RESULTS: { icon: "🏆", label: "Results" },
    CUSTOM: { icon: "📌", label: "Custom" },
}

export default async function StageDetailPage({ params }: StageDetailPageProps) {
    const { slug, stageId } = await params

    const stage = await prisma.hackathonStage.findUnique({
        where: { id: stageId },
        include: {
            hackathon: {
                select: { id: true, title: true, slug: true },
            },
            submissions: {
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
                orderBy: { submittedAt: "desc" },
            },
            dependsOnStage: {
                select: { id: true, name: true },
            },
            _count: {
                select: { submissions: true },
            },
        },
    })

    if (!stage || stage.hackathon.slug !== slug) {
        notFound()
    }

    const now = new Date()
    const isPast = stage.endDate < now
    const isCurrent = stage.startDate <= now && stage.endDate >= now
    const isUpcoming = stage.startDate > now

    // Calculate stats
    const totalSubmissions = stage._count.submissions
    const approvedSubmissions = stage.submissions.filter((s) => s.status === "APPROVED").length
    const pendingSubmissions = stage.submissions.filter(
        (s) => s.status === "PENDING" || s.status === "SUBMITTED"
    ).length

    const typeInfo = stageTypeInfo[stage.type] || stageTypeInfo.CUSTOM

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <Link
                        href={`/hackathons/${slug}/manage/stages`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{typeInfo.icon}</span>
                            <h1 className="text-2xl font-bold text-gray-900">{stage.name}</h1>
                            {stage.isCompleted ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    Completed
                                </span>
                            ) : isCurrent && stage.isActive ? (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full flex items-center gap-1">
                                    <Play className="h-4 w-4" />
                                    Active
                                </span>
                            ) : isUpcoming ? (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Upcoming
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    Overdue
                                </span>
                            )}
                        </div>
                        {stage.description && (
                            <p className="text-gray-600 max-w-2xl">{stage.description}</p>
                        )}
                    </div>
                </div>

                <Link
                    href={`/hackathons/${slug}/manage/stages/${stageId}/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <Edit className="h-4 w-4" />
                    Edit Stage
                </Link>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-medium text-gray-900">
                                {formatDate(stage.startDate)} - {formatDate(stage.endDate)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Submissions</p>
                            <p className="font-medium text-gray-900">
                                {stage.requiresSubmission ? `${totalSubmissions} received` : "Not required"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Reviewed</p>
                            <p className="font-medium text-gray-900">
                                {approvedSubmissions} / {totalSubmissions}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Target className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Elimination</p>
                            <p className="font-medium text-gray-900">
                                {stage.isElimination
                                    ? `${stage.eliminationType?.replace("_", " ")} (${stage.eliminationValue})`
                                    : "None"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stage Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Stage Settings</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Type</span>
                            <span className="font-medium text-gray-900">
                                {typeInfo.icon} {typeInfo.label}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Order</span>
                            <span className="font-medium text-gray-900">#{stage.order}</span>
                        </div>
                        {stage.dependsOnStage && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Depends On</span>
                                <span className="font-medium text-gray-900">
                                    {stage.dependsOnStage.name}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Requires Submission</span>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                stage.requiresSubmission ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                            )}>
                                {stage.requiresSubmission ? "Yes" : "No"}
                            </span>
                        </div>
                        {stage.requiresSubmission && stage.submissionDeadline && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Submission Deadline</span>
                                <span className="font-medium text-gray-900">
                                    {formatDateTime(stage.submissionDeadline)}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Late Submissions</span>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                stage.allowLateSubmission ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"
                            )}>
                                {stage.allowLateSubmission ? "Allowed" : "Not Allowed"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-indigo-600" />
                        Notification Settings
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                stage.notifyOnStart ? "bg-green-500" : "bg-gray-300"
                            )} />
                            <span className={stage.notifyOnStart ? "text-gray-900" : "text-gray-400"}>
                                Notify on stage start
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                stage.notifyBeforeDeadline ? "bg-green-500" : "bg-gray-300"
                            )} />
                            <span className={stage.notifyBeforeDeadline ? "text-gray-900" : "text-gray-400"}>
                                Deadline reminders
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                stage.notifyOnComplete ? "bg-green-500" : "bg-gray-300"
                            )} />
                            <span className={stage.notifyOnComplete ? "text-gray-900" : "text-gray-400"}>
                                Notify on completion
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                stage.notifyOnElimination ? "bg-green-500" : "bg-gray-300"
                            )} />
                            <span className={stage.notifyOnElimination ? "text-gray-900" : "text-gray-400"}>
                                Notify on elimination
                            </span>
                        </div>
                    </div>

                    {stage.deadlineReminderHours && stage.deadlineReminderHours.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">Reminder Schedule</p>
                            <div className="flex flex-wrap gap-2">
                                {stage.deadlineReminderHours.map((hours) => (
                                    <span
                                        key={hours}
                                        className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md"
                                    >
                                        {hours}h before
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Judging Criteria */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                        Judging Criteria
                    </h2>
                    {stage.judgingCriteria && Array.isArray(stage.judgingCriteria) && stage.judgingCriteria.length > 0 ? (
                        <div className="space-y-3">
                            {(stage.judgingCriteria as { name: string; weight: number; maxScore: number }[]).map(
                                (criteria, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-gray-900">{criteria.name}</span>
                                            <span className="text-sm text-gray-600">
                                                {criteria.weight}% • Max {criteria.maxScore}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-indigo-600 h-1.5 rounded-full"
                                                style={{ width: `${criteria.weight}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No judging criteria configured</p>
                    )}
                </div>
            </div>

            {/* Submissions */}
            {stage.requiresSubmission && (
                <StageSubmissions
                    submissions={stage.submissions}
                    stageId={stageId}
                    slug={slug}
                />
            )}
        </div>
    )
}
