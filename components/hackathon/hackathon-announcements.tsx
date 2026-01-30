import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import {
    Megaphone,
    Info,
    Bell,
    AlertTriangle,
    CheckCircle,
    Pin,
    Clock,
    ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface HackathonAnnouncementsProps {
    hackathonId: string
    hackathonSlug: string
    limit?: number
}

const typeConfig = {
    INFO: { icon: Info, color: "text-blue-600 bg-blue-100", borderColor: "border-l-blue-500" },
    UPDATE: { icon: Bell, color: "text-purple-600 bg-purple-100", borderColor: "border-l-purple-500" },
    WARNING: { icon: AlertTriangle, color: "text-yellow-600 bg-yellow-100", borderColor: "border-l-yellow-500" },
    URGENT: { icon: AlertTriangle, color: "text-red-600 bg-red-100", borderColor: "border-l-red-500" },
    SUCCESS: { icon: CheckCircle, color: "text-green-600 bg-green-100", borderColor: "border-l-green-500" },
}

export default async function HackathonAnnouncements({ 
    hackathonId, 
    hackathonSlug, 
    limit = 3 
}: HackathonAnnouncementsProps) {
    const session = await auth()

    // Get user's registration status for filtering
    let userStatus = "ALL"
    if (session?.user?.id) {
        const registration = await prisma.hackathonRegistration.findUnique({
            where: {
                hackathonId_userId: {
                    hackathonId,
                    userId: session.user.id,
                },
            },
        })
        if (registration) {
            userStatus = registration.status === "APPROVED" ? "APPROVED" : "PENDING"
        }
    }

    // Build where clause based on user status
    const now = new Date()
    const announcements = await prisma.announcement.findMany({
        where: {
            hackathonId,
            isPublished: true,
            publishAt: { lte: now },
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: now } },
            ],
            targetAudience: {
                in: userStatus === "APPROVED" 
                    ? ["ALL", "REGISTERED", "APPROVED"] 
                    : userStatus === "PENDING"
                    ? ["ALL", "REGISTERED"]
                    : ["ALL"],
            },
        },
        orderBy: [
            { isPinned: "desc" },
            { publishAt: "desc" },
        ],
        take: limit,
        include: {
            author: {
                select: { name: true, avatar: true },
            },
        },
    })

    if (announcements.length === 0) {
        return null
    }

    const totalCount = await prisma.announcement.count({
        where: {
            hackathonId,
            isPublished: true,
            publishAt: { lte: now },
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: now } },
            ],
        },
    })

    const formatTime = (date: Date) => {
        const diff = now.getTime() - new Date(date).getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return "Just now"
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return new Date(date).toLocaleDateString()
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-indigo-600" />
                    Announcements
                </h2>
                {totalCount > limit && (
                    <Link
                        href={`/hackathons/${hackathonSlug}/announcements`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                        View all ({totalCount})
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                )}
            </div>

            <div className="space-y-4">
                {announcements.map((announcement: { id: string; type: string; title: string; content: string; isPinned: boolean; publishAt: Date; author: { name: string | null; avatar: string | null } | null }) => {
                    const config = typeConfig[announcement.type as keyof typeof typeConfig] || typeConfig.INFO
                    const Icon = config.icon

                    return (
                        <div
                            key={announcement.id}
                            className={cn(
                                "p-4 bg-gray-50 rounded-lg border-l-4",
                                config.borderColor
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn("p-2 rounded-lg", config.color)}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                                        {announcement.isPinned && (
                                            <Pin className="h-3.5 w-3.5 text-amber-500" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {announcement.content}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatTime(announcement.publishAt)}
                                        </span>
                                        {announcement.author && (
                                            <span>by {announcement.author.name}</span>
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
