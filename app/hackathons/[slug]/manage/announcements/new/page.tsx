import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import AnnouncementForm from "./announcement-form"

interface NewAnnouncementPageProps {
    params: Promise<{ slug: string }>
}

export default async function NewAnnouncementPage({ params }: NewAnnouncementPageProps) {
    const { slug } = await params

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        select: {
            id: true,
            title: true,
            slug: true,
        },
    })

    if (!hackathon) {
        notFound()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/hackathons/${slug}/manage/announcements`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">New Announcement</h1>
                    <p className="text-gray-600">Create an announcement for your hackathon participants</p>
                </div>
            </div>

            <AnnouncementForm hackathonId={hackathon.id} slug={hackathon.slug} />
        </div>
    )
}
