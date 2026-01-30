"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn, formatDate, formatDateTime } from "@/lib/utils"
import {
    Calendar,
    CheckCircle,
    Clock,
    Play,
    Pause,
    Settings2,
    ChevronRight,
    GripVertical,
    FileText,
    Users,
    Target,
    MoreHorizontal,
    Trash2,
    Edit,
    Eye,
    AlertTriangle,
} from "lucide-react"
import { activateStage, completeStage, deleteStage } from "@/lib/actions/hackathon-stage"

interface Stage {
    id: string
    name: string
    type: string
    description: string | null
    color: string | null
    order: number
    startDate: Date
    endDate: Date
    isActive: boolean
    isCompleted: boolean
    requiresSubmission: boolean
    isElimination: boolean
    submissionDeadline: Date | null
    _count: {
        submissions: number
    }
}

interface StagesListProps {
    stages: Stage[]
    hackathonId: string
    slug: string
}

const stageTypeColors: Record<string, { bg: string; text: string; icon: string }> = {
    REGISTRATION: { bg: "bg-blue-100", text: "text-blue-700", icon: "🎫" },
    TEAM_FORMATION: { bg: "bg-purple-100", text: "text-purple-700", icon: "👥" },
    IDEATION: { bg: "bg-yellow-100", text: "text-yellow-700", icon: "💡" },
    MENTORING_SESSION: { bg: "bg-green-100", text: "text-green-700", icon: "🎓" },
    CHECKPOINT: { bg: "bg-orange-100", text: "text-orange-700", icon: "🔍" },
    DEVELOPMENT: { bg: "bg-indigo-100", text: "text-indigo-700", icon: "💻" },
    EVALUATION: { bg: "bg-pink-100", text: "text-pink-700", icon: "⚖️" },
    PRESENTATION: { bg: "bg-cyan-100", text: "text-cyan-700", icon: "🎤" },
    RESULTS: { bg: "bg-amber-100", text: "text-amber-700", icon: "🏆" },
    CUSTOM: { bg: "bg-gray-100", text: "text-gray-700", icon: "📌" },
}

export default function StagesList({ stages, hackathonId, slug }: StagesListProps) {
    const router = useRouter()
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [loading, setLoading] = useState<string | null>(null)

    const now = new Date()

    const getStageStatus = (stage: Stage) => {
        if (stage.isCompleted) return "completed"
        if (stage.startDate <= now && stage.endDate >= now && stage.isActive) return "active"
        if (stage.startDate > now) return "upcoming"
        if (stage.endDate < now && !stage.isCompleted) return "overdue"
        return "inactive"
    }

    const handleActivate = async (stageId: string) => {
        setLoading(stageId)
        const result = await activateStage(stageId)
        setLoading(null)
        if (result.success) {
            router.refresh()
        }
        setOpenMenuId(null)
    }

    const handleComplete = async (stageId: string) => {
        setLoading(stageId)
        const result = await completeStage(stageId)
        setLoading(null)
        if (result.success) {
            router.refresh()
        }
        setOpenMenuId(null)
    }

    const handleDelete = async (stageId: string) => {
        if (!confirm("Are you sure you want to delete this stage?")) return
        setLoading(stageId)
        const result = await deleteStage(stageId)
        setLoading(null)
        if (result.success) {
            router.refresh()
        }
        setOpenMenuId(null)
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">All Stages</h2>
                    <p className="text-sm text-gray-500">
                        Drag to reorder • Click to manage
                    </p>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {stages.map((stage, index) => {
                    const status = getStageStatus(stage)
                    const typeStyle = stageTypeColors[stage.type] || stageTypeColors.CUSTOM
                    const isMenuOpen = openMenuId === stage.id
                    const isLoading = loading === stage.id

                    return (
                        <div
                            key={stage.id}
                            className={cn(
                                "p-4 hover:bg-gray-50 transition-colors relative",
                                isLoading && "opacity-50 pointer-events-none"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                {/* Drag Handle */}
                                <button className="mt-1 p-1 text-gray-400 hover:text-gray-600 cursor-grab">
                                    <GripVertical className="h-5 w-5" />
                                </button>

                                {/* Order Number */}
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                                    {stage.order}
                                </div>

                                {/* Stage Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-medium text-gray-900 truncate">
                                            {stage.name}
                                        </h3>
                                        <span
                                            className={cn(
                                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                                typeStyle.bg,
                                                typeStyle.text
                                            )}
                                        >
                                            {typeStyle.icon} {stage.type.replace("_", " ")}
                                        </span>
                                        {stage.isElimination && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                <Target className="h-3 w-3 inline mr-1" />
                                                Elimination
                                            </span>
                                        )}
                                    </div>

                                    {stage.description && (
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                            {stage.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(stage.startDate)} - {formatDate(stage.endDate)}
                                        </span>
                                        {stage.requiresSubmission && (
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-4 w-4" />
                                                {stage._count.submissions} submissions
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center gap-3">
                                    <span
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium",
                                            status === "completed" && "bg-green-100 text-green-700",
                                            status === "active" && "bg-blue-100 text-blue-700",
                                            status === "upcoming" && "bg-gray-100 text-gray-700",
                                            status === "overdue" && "bg-red-100 text-red-700",
                                            status === "inactive" && "bg-gray-100 text-gray-500"
                                        )}
                                    >
                                        {status === "completed" && (
                                            <CheckCircle className="h-3 w-3 inline mr-1" />
                                        )}
                                        {status === "active" && (
                                            <Play className="h-3 w-3 inline mr-1" />
                                        )}
                                        {status === "upcoming" && (
                                            <Clock className="h-3 w-3 inline mr-1" />
                                        )}
                                        {status === "overdue" && (
                                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                                        )}
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>

                                    {/* Actions Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenMenuId(isMenuOpen ? null : stage.id)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>

                                        {isMenuOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setOpenMenuId(null)}
                                                />
                                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                                                    <Link
                                                        href={`/hackathons/${slug}/manage/stages/${stage.id}`}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                    <Link
                                                        href={`/hackathons/${slug}/manage/stages/${stage.id}/edit`}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Edit Stage
                                                    </Link>
                                                    <hr className="my-1" />
                                                    {!stage.isActive && !stage.isCompleted && (
                                                        <button
                                                            onClick={() => handleActivate(stage.id)}
                                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                                        >
                                                            <Play className="h-4 w-4" />
                                                            Activate Stage
                                                        </button>
                                                    )}
                                                    {stage.isActive && !stage.isCompleted && (
                                                        <button
                                                            onClick={() => handleComplete(stage.id)}
                                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Mark Complete
                                                        </button>
                                                    )}
                                                    <hr className="my-1" />
                                                    <button
                                                        onClick={() => handleDelete(stage.id)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete Stage
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <Link
                                        href={`/hackathons/${slug}/manage/stages/${stage.id}`}
                                        className="p-2 text-gray-400 hover:text-gray-600"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
