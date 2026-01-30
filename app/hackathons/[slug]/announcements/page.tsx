import { auth } from "@/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import {
    ArrowLeft,
    Megaphone,
    Info,
    Bell,
    AlertTriangle,
    CheckCircle,
    Pin,
    Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AnnouncementsPageProps {
    params: Promise<{ slug: string }>
}

const typeConfig = {
    INFO: { icon: Info, color: "text-blue-600 bg-blue-100", borderColor: "border-l-blue-500" },
    UPDATE: { icon: Bell, color: "text-purple-600 bg-purple-100", borderColor: "border-l-purple-500" },
    WARNING: { icon: AlertTriangle, color: "text-yellow-600 bg-yellow-100", borderColor: "border-l-yellow-500" },
    URGENT: { icon: AlertTriangle, color: "text-red-600 bg-red-100", borderColor: "border-l-red-500" },
    SUCCESS: { icon: CheckCircle, color: "text-green-600 bg-green-100", borderColor: "border-l-green-500" },
}

export default async function HackathonAnnouncementsPage({ params }: AnnouncementsPageProps) {
    const session = await auth()
    const { slug } = await params

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        select: { id: true, title: true, slug: true },
    })

    if (!hackathon) {
        notFound()
    }

    // Get user's registration status for filtering
    let userStatus = "ALL"
    if (session?.user?.id) {
        const registration = await prisma.hackathonRegistration.findUnique({
            where: {
                hackathonId_userId: {
                    hackathonId: hackathon.id,
                    userId: session.user.id,
                },
            },
        })
        if (registration) {
            userStatus = registration.status === "APPROVED" ? "APPROVED" : "PENDING"
        }
    }

    // Get all visible announcements
    const now = new Date()
    const announcements = await prisma.announcement.findMany({
        where: {
            hackathonId: hackathon.id,
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
        include: {
            author: {
                select: { name: true, avatar: true },
            },
        },
    })

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/hackathons/${slug}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Megaphone className="h-6 w-6 text-indigo-600" />
                            Announcements
                        </h1>
                        <p className="text-gray-600">{hackathon.title}</p>
                    </div>
                </div>

                {announcements.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Megaphone className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No announcements yet</h3>
                            <p className="text-gray-600 mt-1">
                                Check back later for updates from the organizers.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => {
                            const config = typeConfig[announcement.type as keyof typeof typeConfig] || typeConfig.INFO
                            const Icon = config.icon

                            return (
                                <div
                                    key={announcement.id}
                                    className={cn(
                                        "bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 overflow-hidden",
                                        config.borderColor
                                    )}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className={cn("p-3 rounded-lg", config.color)}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h2 className="text-lg font-semibold text-gray-900">
                                                        {announcement.title}
                                                    </h2>
                                                    {announcement.isPinned && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-medium">
                                                            <Pin className="h-3 w-3" />
                                                            Pinned
                                                        </span>
                                                    )}
                                                    {announcement.priority === "URGENT" || announcement.priority === "HIGH" ? (
                                                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-medium">
                                                            {announcement.priority}
                                                        </span>
                                                    ) : null}
                                                </div>

                                                <div className="mt-3 prose prose-sm max-w-none text-gray-700">
                                                    <p className="whitespace-pre-wrap">{announcement.content}</p>
                                                </div>

                                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Clock className="h-4 w-4" />
                                                        {formatDate(announcement.publishAt)}
                                                    </div>
                                                    {announcement.author && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            {announcement.author.avatar ? (
                                                                <img
                                                                    src={announcement.author.avatar}
                                                                    alt={announcement.author.name || "Author"}
                                                                    className="w-5 h-5 rounded-full"
                                                                />
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                                                                    <span className="text-xs text-indigo-600">
                                                                        {announcement.author.name?.charAt(0) || "?"}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <span>{announcement.author.name}</span>
                                                        </div>
                                                    )}
                                                </div>
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
    )
}
