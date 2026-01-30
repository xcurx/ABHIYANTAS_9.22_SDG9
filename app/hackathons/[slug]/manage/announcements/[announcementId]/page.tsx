import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { ArrowLeft, Clock, Users, Pin, Edit, Trash2 } from "lucide-react"
import { deleteAnnouncement } from "@/lib/actions/announcement"

interface AnnouncementDetailPageProps {
    params: Promise<{ slug: string; announcementId: string }>
}

export default async function AnnouncementDetailPage({ params }: AnnouncementDetailPageProps) {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/sign-in")
    }

    const { slug, announcementId } = await params

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        include: {
            organization: {
                include: {
                    members: {
                        where: { userId: session.user.id },
                    },
                },
            },
        },
    })

    if (!hackathon) {
        notFound()
    }

    const isOrganizer = hackathon.organization.members.length > 0

    if (!isOrganizer) {
        redirect(`/hackathons/${slug}`)
    }

    const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
            author: {
                select: { id: true, name: true, email: true, avatar: true },
            },
        },
    })

    if (!announcement || announcement.hackathonId !== hackathon.id) {
        notFound()
    }

    const now = new Date()
    const publishAt = new Date(announcement.publishAt)
    const expiresAt = announcement.expiresAt ? new Date(announcement.expiresAt) : null

    let status = "draft"
    if (announcement.isPublished) {
        if (expiresAt && now > expiresAt) {
            status = "expired"
        } else if (now >= publishAt) {
            status = "published"
        } else {
            status = "scheduled"
        }
    }

    const statusColors: Record<string, string> = {
        published: "bg-green-100 text-green-800",
        scheduled: "bg-blue-100 text-blue-800",
        draft: "bg-gray-100 text-gray-800",
        expired: "bg-red-100 text-red-800",
    }

    const typeColors: Record<string, string> = {
        INFO: "bg-blue-100 text-blue-800",
        UPDATE: "bg-purple-100 text-purple-800",
        WARNING: "bg-yellow-100 text-yellow-800",
        URGENT: "bg-red-100 text-red-800",
        SUCCESS: "bg-green-100 text-green-800",
    }

    const priorityColors: Record<string, string> = {
        LOW: "border-l-gray-300",
        NORMAL: "border-l-blue-400",
        HIGH: "border-l-orange-400",
        CRITICAL: "border-l-red-500",
    }

    async function handleDelete() {
        "use server"
        await deleteAnnouncement(announcementId)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/hackathons/${slug}/manage/announcements`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{announcement.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[status]}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[announcement.type]}`}>
                                {announcement.type}
                            </span>
                            {announcement.isPinned && (
                                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                                    <Pin className="h-3 w-3" />
                                    Pinned
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/hackathons/${slug}/manage/announcements/${announcementId}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Edit className="h-4 w-4" />
                        Edit
                    </Link>
                    <form action={handleDelete}>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${priorityColors[announcement.priority]} p-6`}>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                            {announcement.content}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Details */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Users className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Target Audience</p>
                                    <p className="font-medium text-gray-900">
                                        {announcement.targetAudience.replace("_", " ")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Clock className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Publish Date</p>
                                    <p className="font-medium text-gray-900">
                                        {publishAt.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {expiresAt && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Clock className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Expires</p>
                                        <p className="font-medium text-gray-900">
                                            {expiresAt.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Author Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Author</h2>
                        <div className="flex items-center gap-3">
                            {announcement.author?.avatar ? (
                                <img
                                    src={announcement.author.avatar}
                                    alt={announcement.author.name || "Author"}
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-indigo-600 font-medium">
                                        {announcement.author?.name?.charAt(0) || "?"}
                                    </span>
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-900">
                                    {announcement.author?.name || "Unknown"}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {announcement.author?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created</span>
                                <span className="text-gray-900">
                                    {new Date(announcement.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Updated</span>
                                <span className="text-gray-900">
                                    {new Date(announcement.updatedAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
