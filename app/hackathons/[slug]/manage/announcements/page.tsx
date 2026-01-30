import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { formatDateTime, cn } from "@/lib/utils"
import {
    Megaphone,
    Plus,
    Bell,
    AlertTriangle,
    Info,
    CheckCircle,
    Clock,
    Pin,
    Eye,
    Edit,
    Trash2,
    Users,
} from "lucide-react"
import AnnouncementsList from "./announcements-list"

interface AnnouncementsPageProps {
    params: Promise<{ slug: string }>
}

export default async function AnnouncementsPage({ params }: AnnouncementsPageProps) {
    const { slug } = await params

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        select: {
            id: true,
            title: true,
            slug: true,
            announcements: {
                orderBy: [
                    { isPinned: "desc" },
                    { publishAt: "desc" },
                ],
                include: {
                    _count: {
                        select: { notifications: true },
                    },
                },
            },
            _count: {
                select: { registrations: true },
            },
        },
    })

    if (!hackathon) {
        notFound()
    }

    const now = new Date()
    const publishedCount = hackathon.announcements.filter((a) => a.isPublished && a.publishAt <= now).length
    const scheduledCount = hackathon.announcements.filter((a) => a.publishAt > now).length
    const draftCount = hackathon.announcements.filter((a) => !a.isPublished).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-600 mt-1">
                        Communicate updates and important information to participants
                    </p>
                </div>
                <Link
                    href={`/hackathons/${slug}/manage/announcements/new`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Announcement
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Megaphone className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {hackathon.announcements.length}
                            </p>
                            <p className="text-sm text-gray-600">Total</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
                            <p className="text-sm text-gray-600">Published</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{scheduledCount}</p>
                            <p className="text-sm text-gray-600">Scheduled</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Edit className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
                            <p className="text-sm text-gray-600">Drafts</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audience Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                    <h3 className="font-medium text-blue-900">Audience</h3>
                    <p className="text-sm text-blue-700">
                        Announcements will be visible to{" "}
                        <span className="font-medium">{hackathon._count.registrations} registered participants</span>.
                        They will also receive notifications based on their preferences.
                    </p>
                </div>
            </div>

            {/* Announcements List */}
            {hackathon.announcements.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <Megaphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Create announcements to keep participants informed about updates, 
                        deadlines, and important information.
                    </p>
                    <Link
                        href={`/hackathons/${slug}/manage/announcements/new`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Create First Announcement
                    </Link>
                </div>
            ) : (
                <AnnouncementsList
                    announcements={hackathon.announcements}
                    hackathonId={hackathon.id}
                    slug={slug}
                />
            )}
        </div>
    )
}
