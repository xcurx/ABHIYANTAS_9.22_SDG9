import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { ArrowLeft, Megaphone } from "lucide-react"
import AnnouncementForm from "../../new/announcement-form"

interface EditAnnouncementPageProps {
    params: Promise<{ slug: string; announcementId: string }>
}

export default async function EditAnnouncementPage({ params }: EditAnnouncementPageProps) {
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
    })

    if (!announcement || announcement.hackathonId !== hackathon.id) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/hackathons/${slug}/manage/announcements/${announcementId}`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Announcement</h1>
                    <p className="text-gray-600">Update the announcement details</p>
                </div>
            </div>

            <AnnouncementForm
                hackathonId={hackathon.id}
                slug={slug}
                initialData={{
                    id: announcement.id,
                    title: announcement.title,
                    content: announcement.content,
                    type: announcement.type,
                    priority: announcement.priority,
                    targetAudience: announcement.targetAudience,
                    publishAt: announcement.publishAt,
                    expiresAt: announcement.expiresAt,
                    isPinned: announcement.isPinned,
                    isPublished: announcement.isPublished,
                }}
            />
        </div>
    )
}
