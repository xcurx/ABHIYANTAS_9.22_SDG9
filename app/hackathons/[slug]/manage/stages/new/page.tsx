import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import StageForm from "./stage-form"

interface NewStagePageProps {
    params: Promise<{ slug: string }>
}

export default async function NewStagePage({ params }: NewStagePageProps) {
    const { slug } = await params

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        select: {
            id: true,
            title: true,
            slug: true,
            hackathonStart: true,
            hackathonEnd: true,
            stages: {
                select: { id: true, name: true },
                orderBy: { order: "asc" },
            },
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
                    href={`/hackathons/${slug}/manage/stages`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Stage</h1>
                    <p className="text-gray-600">Create a new stage for your hackathon timeline</p>
                </div>
            </div>

            <StageForm
                hackathonId={hackathon.id}
                slug={hackathon.slug}
                hackathonStart={hackathon.hackathonStart}
                hackathonEnd={hackathon.hackathonEnd}
                existingStages={hackathon.stages}
            />
        </div>
    )
}
