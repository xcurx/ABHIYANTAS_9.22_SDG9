"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createAnnouncement, updateAnnouncement } from "@/lib/actions/announcement"
import {
    Megaphone,
    Info,
    Bell,
    AlertTriangle,
    CheckCircle,
    Clock,
    Users,
    Pin,
    Loader2,
    Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"

const announcementTypes = [
    { value: "INFO", label: "Information", icon: Info, color: "text-blue-600 bg-blue-100" },
    { value: "UPDATE", label: "Update", icon: Bell, color: "text-purple-600 bg-purple-100" },
    { value: "DEADLINE", label: "Deadline", icon: AlertTriangle, color: "text-yellow-600 bg-yellow-100" },
    { value: "URGENT", label: "Urgent", icon: AlertTriangle, color: "text-red-600 bg-red-100" },
    { value: "RESULT", label: "Result", icon: CheckCircle, color: "text-green-600 bg-green-100" },
    { value: "SCHEDULE_CHANGE", label: "Schedule Change", icon: Clock, color: "text-orange-600 bg-orange-100" },
]

const priorityLevels = [
    { value: "LOW", label: "Low", color: "border-gray-300" },
    { value: "NORMAL", label: "Normal", color: "border-blue-400" },
    { value: "HIGH", label: "High", color: "border-orange-400" },
    { value: "URGENT", label: "Urgent", color: "border-red-500" },
]

const audienceOptions = [
    { value: "ALL", label: "All", description: "Everyone" },
    { value: "REGISTERED", label: "Registered", description: "All registered participants" },
    { value: "APPROVED", label: "Approved", description: "Only approved participants" },
    { value: "TEAM_LEADERS", label: "Team Leaders", description: "Only team leaders" },
    { value: "MENTORS", label: "Mentors", description: "Only mentors" },
    { value: "JUDGES", label: "Judges", description: "Only judges" },
    { value: "ORGANIZERS", label: "Organizers", description: "Only organizers" },
]

interface AnnouncementFormProps {
    hackathonId: string
    slug: string
    initialData?: {
        id: string
        title: string
        content: string
        type: string
        priority: string
        targetAudience: string
        publishAt: Date
        expiresAt: Date | null
        isPinned: boolean
        isPublished: boolean
    }
}

export default function AnnouncementForm({ hackathonId, slug, initialData }: AnnouncementFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string[]>>({})

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        content: initialData?.content || "",
        type: initialData?.type || "INFO",
        priority: initialData?.priority || "NORMAL",
        targetAudience: initialData?.targetAudience || "ALL",
        publishAt: initialData?.publishAt
            ? new Date(initialData.publishAt).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
        expiresAt: initialData?.expiresAt
            ? new Date(initialData.expiresAt).toISOString().slice(0, 16)
            : "",
        isPinned: initialData?.isPinned || false,
        isPublished: initialData?.isPublished ?? true,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        const payload = {
            hackathonId,
            title: formData.title,
            content: formData.content,
            type: formData.type as "INFO" | "UPDATE" | "DEADLINE" | "URGENT" | "RESULT" | "SCHEDULE_CHANGE",
            priority: formData.priority as "LOW" | "NORMAL" | "HIGH" | "URGENT",
            targetAudience: formData.targetAudience as "ALL" | "REGISTERED" | "APPROVED" | "TEAM_LEADERS" | "MENTORS" | "JUDGES" | "ORGANIZERS",
            publishAt: formData.publishAt,
            expiresAt: formData.expiresAt || undefined,
            isPinned: formData.isPinned,
            isPublished: formData.isPublished,
        }

        const result = initialData
            ? await updateAnnouncement(initialData.id, payload)
            : await createAnnouncement(payload)

        setLoading(false)

        if (result.success) {
            router.push(`/hackathons/${slug}/manage/announcements`)
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
                    <Megaphone className="h-5 w-5 text-indigo-600" />
                    Announcement Details
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Important Update: Deadline Extended"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content *
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Write your announcement content here... You can use markdown formatting."
                            rows={8}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">Supports Markdown formatting</p>
                        {errors.content && (
                            <p className="mt-1 text-sm text-red-600">{errors.content[0]}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Type & Priority */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Type & Priority</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Announcement Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {announcementTypes.map((type) => {
                                const Icon = type.icon
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: type.value })}
                                        className={cn(
                                            "flex items-center gap-2 p-3 rounded-lg border-2 transition-colors",
                                            formData.type === type.value
                                                ? "border-indigo-500 bg-indigo-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        <div className={cn("p-1.5 rounded", type.color)}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">{type.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Priority Level
                        </label>
                        <div className="space-y-2">
                            {priorityLevels.map((priority) => (
                                <button
                                    key={priority.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: priority.value })}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg border-2 border-l-4 transition-colors",
                                        priority.color,
                                        formData.priority === priority.value
                                            ? "border-indigo-500 bg-indigo-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <span className="text-sm font-medium">{priority.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Target Audience */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Target Audience
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {audienceOptions.map((audience) => (
                        <button
                            key={audience.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, targetAudience: audience.value })}
                            className={cn(
                                "flex flex-col items-start p-4 rounded-lg border-2 transition-colors text-left",
                                formData.targetAudience === audience.value
                                    ? "border-indigo-500 bg-indigo-50"
                                    : "border-gray-200 hover:border-gray-300"
                            )}
                        >
                            <span className="font-medium text-gray-900">{audience.label}</span>
                            <span className="text-xs text-gray-500 mt-1">{audience.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Scheduling */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    Scheduling
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Publish Date & Time *
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.publishAt}
                            onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Set to future date to schedule the announcement
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiration Date (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.expiresAt}
                            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Announcement will be hidden after this date
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isPinned}
                            onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="flex items-center gap-2">
                            <Pin className="h-4 w-4 text-gray-600" />
                            <div>
                                <span className="font-medium text-gray-900">Pin Announcement</span>
                                <p className="text-sm text-gray-500">
                                    Pinned announcements appear at the top of the list
                                </p>
                            </div>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isPublished}
                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Publish Immediately</span>
                            <p className="text-sm text-gray-500">
                                Uncheck to save as draft
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
                <Link
                    href={`/hackathons/${slug}/manage/announcements`}
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
                            {initialData ? "Saving..." : "Creating..."}
                        </>
                    ) : (
                        <>
                            <Plus className="h-4 w-4" />
                            {initialData ? "Save Changes" : "Create Announcement"}
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
