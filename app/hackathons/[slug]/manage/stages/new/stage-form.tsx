"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createStage } from "@/lib/actions/hackathon-stage"
import {
    Calendar,
    Clock,
    FileText,
    Target,
    Users,
    Bell,
    Info,
    Loader2,
    Plus,
    Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const stageTypes = [
    { value: "REGISTRATION", label: "Registration", icon: "🎫", description: "Participant sign-up period" },
    { value: "TEAM_FORMATION", label: "Team Formation", icon: "👥", description: "Teams can form and collaborate" },
    { value: "IDEATION", label: "Ideation", icon: "💡", description: "Brainstorming and idea submission" },
    { value: "MENTORING_SESSION", label: "Mentoring", icon: "🎓", description: "Mentorship and guidance sessions" },
    { value: "CHECKPOINT", label: "Checkpoint", icon: "🔍", description: "Progress review and feedback" },
    { value: "DEVELOPMENT", label: "Development", icon: "💻", description: "Main building/coding phase" },
    { value: "EVALUATION", label: "Evaluation", icon: "⚖️", description: "Judging and scoring submissions" },
    { value: "PRESENTATION", label: "Presentation", icon: "🎤", description: "Demo day and pitches" },
    { value: "RESULTS", label: "Results", icon: "🏆", description: "Winners announcement" },
    { value: "CUSTOM", label: "Custom", icon: "📌", description: "Custom stage type" },
]

interface StageFormProps {
    hackathonId: string
    slug: string
    hackathonStart: Date
    hackathonEnd: Date
    existingStages: { id: string; name: string }[]
    initialData?: {
        id: string
        name: string
        type: string
        description: string | null
        color: string | null
        startDate: Date
        endDate: Date
        isElimination: boolean
        eliminationType: string | null
        eliminationValue: number | null
        requiresSubmission: boolean
        submissionDeadline: Date | null
        allowLateSubmission: boolean
        notifyOnStart: boolean
        notifyBeforeDeadline: boolean
        notifyOnComplete: boolean
        dependsOnStageId: string | null
    }
}

export default function StageForm({
    hackathonId,
    slug,
    hackathonStart,
    hackathonEnd,
    existingStages,
    initialData,
}: StageFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string[]>>({})

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        type: initialData?.type || "DEVELOPMENT",
        description: initialData?.description || "",
        color: initialData?.color || "#6366f1",
        startDate: initialData?.startDate
            ? new Date(initialData.startDate).toISOString().slice(0, 16)
            : new Date(hackathonStart).toISOString().slice(0, 16),
        endDate: initialData?.endDate
            ? new Date(initialData.endDate).toISOString().slice(0, 16)
            : new Date(hackathonEnd).toISOString().slice(0, 16),
        isElimination: initialData?.isElimination || false,
        eliminationType: initialData?.eliminationType || "TOP_N",
        eliminationValue: initialData?.eliminationValue || 10,
        requiresSubmission: initialData?.requiresSubmission || false,
        submissionDeadline: initialData?.submissionDeadline
            ? new Date(initialData.submissionDeadline).toISOString().slice(0, 16)
            : "",
        allowLateSubmission: initialData?.allowLateSubmission || false,
        notifyOnStart: initialData?.notifyOnStart ?? true,
        notifyBeforeDeadline: initialData?.notifyBeforeDeadline ?? true,
        notifyOnComplete: initialData?.notifyOnComplete ?? true,
        dependsOnStageId: initialData?.dependsOnStageId || "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        const result = await createStage({
            hackathonId,
            name: formData.name,
            type: formData.type as "REGISTRATION" | "TEAM_FORMATION" | "IDEATION" | "MENTORING_SESSION" | "CHECKPOINT" | "DEVELOPMENT" | "EVALUATION" | "PRESENTATION" | "RESULTS" | "CUSTOM",
            description: formData.description || undefined,
            color: formData.color || undefined,
            startDate: formData.startDate,
            endDate: formData.endDate,
            isElimination: formData.isElimination,
            eliminationType: formData.isElimination
                ? (formData.eliminationType as "TOP_N" | "PERCENTAGE" | "SCORE_THRESHOLD")
                : undefined,
            eliminationValue: formData.isElimination ? formData.eliminationValue : undefined,
            requiresSubmission: formData.requiresSubmission,
            submissionDeadline: formData.submissionDeadline || undefined,
            allowLateSubmission: formData.allowLateSubmission,
            notifyOnStart: formData.notifyOnStart,
            notifyBeforeDeadline: formData.notifyBeforeDeadline,
            notifyOnComplete: formData.notifyOnComplete,
            dependsOnStageId: formData.dependsOnStageId || undefined,
            // Required fields with defaults
            allowParallel: false,
            blindJudging: false,
            deadlineReminderHours: [24, 6, 1],
            notifyOnElimination: true,
            isActive: true,
        })

        setLoading(false)

        if (result.success) {
            router.push(`/hackathons/${slug}/manage/stages`)
            router.refresh()
        } else {
            if (result.errors) {
                setErrors(result.errors)
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-indigo-600" />
                    Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stage Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Development Phase"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stage Type *
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {stageTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe what happens during this stage..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Depends On
                        </label>
                        <select
                            value={formData.dependsOnStageId}
                            onChange={(e) =>
                                setFormData({ ...formData, dependsOnStageId: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">No dependency</option>
                            {existingStages.map((stage) => (
                                <option key={stage.id} value={stage.id}>
                                    {stage.name}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            This stage will only start after the selected stage completes
                        </p>
                    </div>
                </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    Schedule
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date & Time *
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        {errors.startDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.startDate[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date & Time *
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        {errors.endDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.endDate[0]}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Submissions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Submissions
                </h2>

                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.requiresSubmission}
                            onChange={(e) =>
                                setFormData({ ...formData, requiresSubmission: e.target.checked })
                            }
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Requires Submission</span>
                            <p className="text-sm text-gray-500">
                                Participants must submit work during this stage
                            </p>
                        </div>
                    </label>

                    {formData.requiresSubmission && (
                        <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Submission Deadline
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.submissionDeadline}
                                    onChange={(e) =>
                                        setFormData({ ...formData, submissionDeadline: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Leave empty to use stage end date
                                </p>
                            </div>

                            <div className="flex items-center">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.allowLateSubmission}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                allowLateSubmission: e.target.checked,
                                            })
                                        }
                                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900">
                                            Allow Late Submissions
                                        </span>
                                        <p className="text-sm text-gray-500">
                                            Accept submissions after deadline
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Elimination */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-indigo-600" />
                    Elimination Settings
                </h2>

                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isElimination}
                            onChange={(e) =>
                                setFormData({ ...formData, isElimination: e.target.checked })
                            }
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Elimination Stage</span>
                            <p className="text-sm text-gray-500">
                                Some participants will be eliminated after this stage
                            </p>
                        </div>
                    </label>

                    {formData.isElimination && (
                        <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Elimination Type
                                </label>
                                <select
                                    value={formData.eliminationType}
                                    onChange={(e) =>
                                        setFormData({ ...formData, eliminationType: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="TOP_N">Top N teams advance</option>
                                    <option value="PERCENTAGE">Top percentage advances</option>
                                    <option value="SCORE_THRESHOLD">Score threshold</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {formData.eliminationType === "TOP_N"
                                        ? "Number of teams"
                                        : formData.eliminationType === "PERCENTAGE"
                                        ? "Percentage (%)"
                                        : "Minimum score"}
                                </label>
                                <input
                                    type="number"
                                    value={formData.eliminationValue}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            eliminationValue: Number(e.target.value),
                                        })
                                    }
                                    min={1}
                                    max={formData.eliminationType === "PERCENTAGE" ? 100 : undefined}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-indigo-600" />
                    Notifications
                </h2>

                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.notifyOnStart}
                            onChange={(e) =>
                                setFormData({ ...formData, notifyOnStart: e.target.checked })
                            }
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Notify on Stage Start</span>
                            <p className="text-sm text-gray-500">
                                Send notification when this stage begins
                            </p>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.notifyBeforeDeadline}
                            onChange={(e) =>
                                setFormData({ ...formData, notifyBeforeDeadline: e.target.checked })
                            }
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Deadline Reminders</span>
                            <p className="text-sm text-gray-500">
                                Send reminders before stage ends (24h, 6h, 1h)
                            </p>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.notifyOnComplete}
                            onChange={(e) =>
                                setFormData({ ...formData, notifyOnComplete: e.target.checked })
                            }
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Notify on Completion</span>
                            <p className="text-sm text-gray-500">
                                Send notification when this stage completes
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
                <Link
                    href={`/hackathons/${slug}/manage/stages`}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Plus className="h-4 w-4" />
                            Create Stage
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
