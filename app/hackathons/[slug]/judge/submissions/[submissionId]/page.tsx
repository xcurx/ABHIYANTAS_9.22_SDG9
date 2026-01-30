import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import prisma from "@/lib/prisma"
import { Navbar } from "@/components/layout/navbar"
import { revalidatePath } from "next/cache"
import {
    ArrowLeft,
    Star,
    Users,
    FileText,
    ExternalLink,
    Link as LinkIcon,
    CheckCircle,
    Clock,
} from "lucide-react"
import { formatDateTime, cn } from "@/lib/utils"

interface ScoreSubmissionPageProps {
    params: Promise<{ slug: string; submissionId: string }>
}

export default async function ScoreSubmissionPage({ params }: ScoreSubmissionPageProps) {
    const { slug, submissionId } = await params
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
    })

    if (!hackathon) {
        notFound()
    }

    // Check if user is a judge
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

    // Get the submission
    const submission = await prisma.stageSubmission.findUnique({
        where: { id: submissionId },
        include: {
            stage: true,
            team: {
                include: {
                    leader: { select: { name: true, email: true } },
                    members: {
                        include: { user: { select: { name: true, email: true } } },
                    },
                },
            },
            user: { select: { name: true, email: true } },
        },
    })

    if (!submission || submission.stage.hackathonId !== hackathon.id) {
        notFound()
    }

    // Parse content
    let parsedContent: {
        title?: string
        content?: string
        fileUrl?: string
        demoUrl?: string
        repoUrl?: string
    } = {}
    try {
        parsedContent = JSON.parse(submission.content || "{}")
    } catch {
        parsedContent = { content: submission.content || "" }
    }

    // Parse judging criteria from stage
    let judgingCriteria: Array<{
        name: string
        description?: string
        weight: number
        maxScore: number
    }> = []
    try {
        judgingCriteria = (submission.stage.judgingCriteria as typeof judgingCriteria) || []
    } catch {
        judgingCriteria = []
    }

    // Default criteria if none set
    if (judgingCriteria.length === 0) {
        judgingCriteria = [
            { name: "Innovation", description: "How innovative is the solution?", weight: 25, maxScore: 10 },
            { name: "Technical Execution", description: "Quality of implementation", weight: 25, maxScore: 10 },
            { name: "Design & UX", description: "User experience and design quality", weight: 20, maxScore: 10 },
            { name: "Impact", description: "Potential impact and scalability", weight: 20, maxScore: 10 },
            { name: "Presentation", description: "Quality of submission/pitch", weight: 10, maxScore: 10 },
        ]
    }

    async function scoreAction(formData: FormData) {
        "use server"

        const sessionData = await auth()
        if (!sessionData?.user?.id) {
            throw new Error("Unauthorized")
        }

        const scores: Record<string, number> = {}
        let totalWeightedScore = 0
        let totalWeight = 0

        // Calculate weighted score
        for (const criteria of judgingCriteria) {
            const score = parseFloat(formData.get(`score_${criteria.name}`) as string) || 0
            scores[criteria.name] = score
            totalWeightedScore += (score / criteria.maxScore) * criteria.weight
            totalWeight += criteria.weight
        }

        const finalScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0
        const feedback = formData.get("feedback") as string

        await prisma.stageSubmission.update({
            where: { id: submissionId },
            data: {
                score: Math.round(finalScore * 10) / 10, // Round to 1 decimal
                feedback: JSON.stringify({ scores, comments: feedback }),
                judgedAt: new Date(),
                judgedBy: sessionData.user.id,
                status: "APPROVED",
            },
        })

        revalidatePath(`/hackathons/${slug}/judge`)
        redirect(`/hackathons/${slug}/judge`)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={session.user} signOutAction={signOutAction} />
            
            <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/hackathons/${slug}/judge`}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Judge Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Score Submission</h1>
                    <p className="text-gray-600 mt-2">Stage: {submission.stage.name}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Submission Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Team/Submitter Info */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                {submission.team ? "Team" : "Submitted By"}
                            </h2>
                            {submission.team ? (
                                <div>
                                    <div className="text-xl font-semibold text-gray-900">{submission.team.name}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Leader: {submission.team.leader.name}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {submission.team.members.map((member) => (
                                            <span
                                                key={member.id}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                                            >
                                                {member.user.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xl font-semibold text-gray-900">{submission.user.name}</div>
                            )}
                        </div>

                        {/* Submission Content */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-purple-600" />
                                Submission
                            </h2>
                            
                            {parsedContent.title && (
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    {parsedContent.title}
                                </h3>
                            )}

                            {parsedContent.content && (
                                <div className="prose prose-gray max-w-none mb-6">
                                    <p className="whitespace-pre-wrap text-gray-600">
                                        {parsedContent.content}
                                    </p>
                                </div>
                            )}

                            {/* Links */}
                            <div className="space-y-3">
                                {parsedContent.fileUrl && (
                                    <a
                                        href={parsedContent.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                                    >
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        <span className="flex-1 text-blue-700 truncate">{parsedContent.fileUrl}</span>
                                        <ExternalLink className="h-4 w-4 text-blue-600" />
                                    </a>
                                )}
                                {parsedContent.demoUrl && (
                                    <a
                                        href={parsedContent.demoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                                    >
                                        <LinkIcon className="h-5 w-5 text-purple-600" />
                                        <span className="flex-1 text-purple-700 truncate">{parsedContent.demoUrl}</span>
                                        <ExternalLink className="h-4 w-4 text-purple-600" />
                                    </a>
                                )}
                                {parsedContent.repoUrl && (
                                    <a
                                        href={parsedContent.repoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                                        </svg>
                                        <span className="flex-1 text-gray-700 truncate">{parsedContent.repoUrl}</span>
                                        <ExternalLink className="h-4 w-4 text-gray-600" />
                                    </a>
                                )}
                            </div>

                            <div className="mt-4 text-sm text-gray-500">
                                Submitted: {formatDateTime(submission.submittedAt)}
                            </div>
                        </div>
                    </div>

                    {/* Scoring Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                Score Submission
                            </h2>

                            {submission.score !== null ? (
                                <div className="text-center py-6">
                                    <div className="text-4xl font-bold text-green-600 mb-2">
                                        {submission.score}
                                    </div>
                                    <div className="text-gray-600">Already Scored</div>
                                    <div className="mt-4 p-3 bg-green-50 rounded-xl">
                                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
                                        <p className="text-sm text-green-700">
                                            Scored on {submission.judgedAt ? formatDateTime(submission.judgedAt) : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form action={scoreAction} className="space-y-4">
                                    {judgingCriteria.map((criteria) => (
                                        <div key={criteria.name}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {criteria.name}
                                                <span className="text-gray-400 font-normal ml-1">
                                                    ({criteria.weight}% weight)
                                                </span>
                                            </label>
                                            {criteria.description && (
                                                <p className="text-xs text-gray-500 mb-2">{criteria.description}</p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="range"
                                                    name={`score_${criteria.name}`}
                                                    min="0"
                                                    max={criteria.maxScore}
                                                    step="0.5"
                                                    defaultValue={criteria.maxScore / 2}
                                                    className="flex-1"
                                                />
                                                <span className="text-sm font-medium text-gray-700 w-12 text-center">
                                                    /{criteria.maxScore}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Feedback (Optional)
                                        </label>
                                        <textarea
                                            name="feedback"
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Provide feedback for the team..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        <CheckCircle className="h-5 w-5" />
                                        Submit Score
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
