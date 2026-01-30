"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn, formatDateTime } from "@/lib/utils"
import {
    Megaphone,
    Pin,
    Clock,
    CheckCircle,
    AlertTriangle,
    Info,
    Edit,
    Trash2,
    MoreHorizontal,
    Eye,
    Bell,
    Users,
} from "lucide-react"
import { deleteAnnouncement } from "@/lib/actions/announcement"

interface Announcement {
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
    createdAt: Date
    _count: {
        notifications: number
    }
}

interface AnnouncementsListProps {
    announcements: Announcement[]
    hackathonId: string
    slug: string
}

const typeIcons: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
    INFO: { icon: <Info className="h-4 w-4" />, bg: "bg-blue-100", text: "text-blue-700" },
    UPDATE: { icon: <Bell className="h-4 w-4" />, bg: "bg-purple-100", text: "text-purple-700" },
    WARNING: { icon: <AlertTriangle className="h-4 w-4" />, bg: "bg-yellow-100", text: "text-yellow-700" },
    URGENT: { icon: <AlertTriangle className="h-4 w-4" />, bg: "bg-red-100", text: "text-red-700" },
    SUCCESS: { icon: <CheckCircle className="h-4 w-4" />, bg: "bg-green-100", text: "text-green-700" },
}

const priorityColors: Record<string, string> = {
    LOW: "border-l-gray-300",
    NORMAL: "border-l-blue-400",
    HIGH: "border-l-orange-400",
    CRITICAL: "border-l-red-500",
}

export default function AnnouncementsList({ announcements, hackathonId, slug }: AnnouncementsListProps) {
    const router = useRouter()
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [loading, setLoading] = useState<string | null>(null)

    const now = new Date()

    const getStatus = (announcement: Announcement) => {
        if (!announcement.isPublished) return "draft"
        if (announcement.publishAt > now) return "scheduled"
        if (announcement.expiresAt && announcement.expiresAt < now) return "expired"
        return "published"
    }

    const handleDelete = async (announcementId: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return
        setLoading(announcementId)
        const result = await deleteAnnouncement(announcementId)
        setLoading(null)
        if (result.success) {
            router.refresh()
        }
        setOpenMenuId(null)
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">All Announcements</h2>
            </div>

            <div className="divide-y divide-gray-100">
                {announcements.map((announcement) => {
                    const status = getStatus(announcement)
                    const typeStyle = typeIcons[announcement.type] || typeIcons.INFO
                    const isMenuOpen = openMenuId === announcement.id
                    const isLoading = loading === announcement.id

                    return (
                        <div
                            key={announcement.id}
                            className={cn(
                                "p-4 border-l-4 hover:bg-gray-50 transition-colors relative",
                                priorityColors[announcement.priority] || priorityColors.NORMAL,
                                isLoading && "opacity-50 pointer-events-none"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                {/* Type Icon */}
                                <div className={cn("p-2 rounded-lg", typeStyle.bg)}>
                                    <span className={typeStyle.text}>{typeStyle.icon}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {announcement.isPinned && (
                                            <Pin className="h-4 w-4 text-indigo-600" />
                                        )}
                                        <h3 className="font-medium text-gray-900 truncate">
                                            {announcement.title}
                                        </h3>
                                        <span
                                            className={cn(
                                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                                typeStyle.bg,
                                                typeStyle.text
                                            )}
                                        >
                                            {announcement.type}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                        {announcement.content.replace(/<[^>]*>/g, "").slice(0, 150)}...
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {status === "scheduled"
                                                ? `Scheduled for ${formatDateTime(announcement.publishAt)}`
                                                : formatDateTime(announcement.publishAt)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {announcement.targetAudience.replace("_", " ")}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Bell className="h-4 w-4" />
                                            {announcement._count.notifications} notified
                                        </span>
                                    </div>
                                </div>

                                {/* Status & Actions */}
                                <div className="flex items-center gap-3">
                                    <span
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium",
                                            status === "published" && "bg-green-100 text-green-700",
                                            status === "scheduled" && "bg-yellow-100 text-yellow-700",
                                            status === "draft" && "bg-gray-100 text-gray-700",
                                            status === "expired" && "bg-red-100 text-red-700"
                                        )}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>

                                    {/* Actions Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenMenuId(isMenuOpen ? null : announcement.id)}
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
                                                        href={`/hackathons/${slug}/manage/announcements/${announcement.id}`}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                    <Link
                                                        href={`/hackathons/${slug}/manage/announcements/${announcement.id}/edit`}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                    <hr className="my-1" />
                                                    <button
                                                        onClick={() => handleDelete(announcement.id)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
