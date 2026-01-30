import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { formatDate, formatDateTime } from "@/lib/utils"
import Link from "next/link"
import {
    Calendar,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    Play,
    Pause,
    Settings2,
    ChevronRight,
    GripVertical,
    FileText,
    Users,
    Target,
} from "lucide-react"
import StagesList from "./stages-list"

interface StagesPageProps {
    params: Promise<{ slug: string }>
}

export default async function StagesPage({ params }: StagesPageProps) {
    const { slug } = await params

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        include: {
            stages: {
                orderBy: { order: "asc" },
                include: {
                    _count: {
                        select: { submissions: true },
                    },
                },
            },
        },
    })

    if (!hackathon) {
        notFound()
    }

    const now = new Date()

    // Calculate stage stats
    const totalStages = hackathon.stages.length
    const completedStages = hackathon.stages.filter((s) => s.isCompleted).length
    const activeStages = hackathon.stages.filter(
        (s) => s.isActive && s.startDate <= now && s.endDate >= now
    ).length
    const upcomingStages = hackathon.stages.filter((s) => s.startDate > now).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Timeline & Stages</h1>
                    <p className="text-gray-600 mt-1">
                        Configure your hackathon timeline with customizable stages
                    </p>
                </div>
                <Link
                    href={`/hackathons/${slug}/manage/stages/new`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Stage
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{totalStages}</p>
                            <p className="text-sm text-gray-600">Total Stages</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{completedStages}</p>
                            <p className="text-sm text-gray-600">Completed</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Play className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{activeStages}</p>
                            <p className="text-sm text-gray-600">Active Now</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{upcomingStages}</p>
                            <p className="text-sm text-gray-600">Upcoming</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stages List */}
            {hackathon.stages.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No stages configured yet
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Create stages to define your hackathon timeline. You can add registration,
                        development, submission, judging phases and more.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href={`/hackathons/${slug}/manage/stages/new`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create First Stage
                        </Link>
                        <Link
                            href={`/hackathons/${slug}/manage/stages/templates`}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FileText className="h-4 w-4" />
                            Use Template
                        </Link>
                    </div>
                </div>
            ) : (
                <StagesList 
                    stages={hackathon.stages} 
                    hackathonId={hackathon.id}
                    slug={slug}
                />
            )}
        </div>
    )
}
