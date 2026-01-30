import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import prisma from "@/lib/prisma"
import { Navbar } from "@/components/layout/navbar"
import {
    ArrowLeft,
    Star,
    CheckCircle,
    Clock,
    Users,
    FileText,
    ExternalLink,
    ChevronRight,
} from "lucide-react"
import { formatDateTime, cn } from "@/lib/utils"

interface JudgePageProps {
    params: Promise<{ slug: string }>
}

export default async function JudgeDashboardPage({ params }: JudgePageProps) {
    const { slug } = await params
    const session = await auth()

    if (!session?.user) {
        redirect(`/sign-in?callbackUrl=/hackathons/${slug}/judge`)
    }

    const signOutAction = async () => {
        "use server"
        await signOut({ redirectTo: "/" })
    }

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        include: {
            stages: {
                where: {
                    type: { in: ["EVALUATION", "PRESENTATION"] },
                },
                orderBy: { order: "asc" },
            },
            teams: {
                include: {
                    members: {
                        include: { user: { select: { name: true, email: true } } },
                    },
                    leader: { select: { name: true } },
                },
            },
        },
    })

    if (!hackathon) {
        notFound()
    }

    // Check if user is a judge for this hackathon
    const judgeRole = await prisma.hackathonRole.findFirst({
        where: {
            hackathonId: hackathon.id,
            userId: session.user.id,
            role: "JUDGE",
            status: "ACCEPTED",
        },
    })

    if (!judgeRole) {
        redirect(`/hackathons/${slug}`)
    }

    // Get all submissions for evaluation stages
    const submissions = await prisma.stageSubmission.findMany({
        where: {
            stageId: { in: hackathon.stages.map(s => s.id) },
        },
        include: {
            stage: true,
            team: {
                include: {
                    leader: { select: { name: true } },
                },
            },
            user: { select: { name: true, email: true } },
        },
        orderBy: { submittedAt: "desc" },
    })

    // Group submissions by stage
    const submissionsByStage = hackathon.stages.reduce((acc, stage) => {
        acc[stage.id] = submissions.filter(s => s.stageId === stage.id)
        return acc
    }, {} as Record<string, typeof submissions>)

    // Stats
    const totalSubmissions = submissions.length
    const scoredSubmissions = submissions.filter(s => s.score !== null).length
    const pendingSubmissions = totalSubmissions - scoredSubmissions

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={session.user} signOutAction={signOutAction} />
            
            <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/hackathons/${slug}`}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to {hackathon.title}
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-xl">
                            <Star className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Judge Dashboard</h1>
                            <p className="text-gray-600">{hackathon.title}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="text-2xl font-bold text-gray-900">{hackathon.teams.length}</div>
                        <div className="text-sm text-gray-600">Teams</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="text-2xl font-bold text-gray-900">{totalSubmissions}</div>
                        <div className="text-sm text-gray-600">Total Submissions</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="text-2xl font-bold text-green-600">{scoredSubmissions}</div>
                        <div className="text-sm text-gray-600">Scored</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="text-2xl font-bold text-orange-600">{pendingSubmissions}</div>
                        <div className="text-sm text-gray-600">Pending Review</div>
                    </div>
                </div>

                {/* Evaluation Stages */}
                <div className="space-y-6">
                    {hackathon.stages.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">No evaluation stages</h3>
                            <p className="text-gray-600 mt-2">There are no evaluation stages set up yet.</p>
                        </div>
                    ) : (
                        hackathon.stages.map((stage) => {
                            const stageSubmissions = submissionsByStage[stage.id] || []
                            const scored = stageSubmissions.filter(s => s.score !== null).length
                            const pending = stageSubmissions.length - scored
                            const now = new Date()
                            const isActive = now >= stage.startDate && now <= stage.endDate

                            return (
                                <div key={stage.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                                    {/* Stage Header */}
                                    <div className={cn(
                                        "p-6 border-b",
                                        isActive ? "bg-green-50" : "bg-gray-50"
                                    )}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-xl font-bold text-gray-900">{stage.name}</h2>
                                                    {isActive && (
                                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {formatDateTime(stage.startDate)} → {formatDateTime(stage.endDate)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {scored}/{stageSubmissions.length}
                                                </div>
                                                <div className="text-sm text-gray-600">Scored</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submissions List */}
                                    <div className="divide-y">
                                        {stageSubmissions.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                No submissions yet for this stage
                                            </div>
                                        ) : (
                                            stageSubmissions.map((submission) => {
                                                let parsedContent: { title?: string } = {}
                                                try {
                                                    parsedContent = JSON.parse(submission.content || "{}")
                                                } catch {
                                                    parsedContent = {}
                                                }

                                                return (
                                                    <Link
                                                        key={submission.id}
                                                        href={`/hackathons/${slug}/judge/submissions/${submission.id}`}
                                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className={cn(
                                                            "p-2 rounded-lg",
                                                            submission.score !== null 
                                                                ? "bg-green-100" 
                                                                : "bg-orange-100"
                                                        )}>
                                                            {submission.score !== null ? (
                                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                            ) : (
                                                                <Clock className="h-5 w-5 text-orange-600" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900">
                                                                {parsedContent.title || "Untitled Submission"}
                                                            </div>
                                                            <div className="text-sm text-gray-600 flex items-center gap-2">
                                                                <Users className="h-3 w-3" />
                                                                {submission.team?.name || submission.user.name}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            {submission.score !== null ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                                    <span className="font-bold text-gray-900">
                                                                        {submission.score}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-orange-600 font-medium">
                                                                    Needs Review
                                                                </span>
                                                            )}
                                                        </div>
                                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                                    </Link>
                                                )
                                            })
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
