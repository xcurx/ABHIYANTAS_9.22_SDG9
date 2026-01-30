import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import prisma from "@/lib/prisma"
import { Navbar } from "@/components/layout/navbar"
import { 
    ArrowLeft, 
    FileText, 
    Link as LinkIcon, 
    CheckCircle, 
    Clock,
    Star,
    ExternalLink,
} from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface SubmissionPageProps {
    params: Promise<{ slug: string; stageId: string }>
}

export default async function SubmissionPage({ params }: SubmissionPageProps) {
    const { slug, stageId } = await params
    const session = await auth()

    if (!session?.user) {
        redirect(`/sign-in?callbackUrl=/hackathons/${slug}/stages/${stageId}/submission`)
    }

    const signOutAction = async () => {
        "use server"
        await signOut({ redirectTo: "/" })
    }

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        select: { id: true, title: true, slug: true },
    })

    if (!hackathon) {
        notFound()
    }

    const stage = await prisma.hackathonStage.findUnique({
        where: { id: stageId },
    })

    if (!stage || stage.hackathonId !== hackathon.id) {
        notFound()
    }

    // Get user's team
    const teamMember = await prisma.teamMember.findFirst({
        where: {
            userId: session.user.id,
            team: { hackathonId: hackathon.id },
        },
        include: { team: true },
    })

    // Get submission
    const submission = await prisma.stageSubmission.findFirst({
        where: {
            stageId: stage.id,
            OR: [
                { userId: session.user.id },
                ...(teamMember ? [{ teamId: teamMember.teamId }] : []),
            ],
        },
        include: {
            user: {
                select: { name: true, email: true },
            },
            team: {
                select: { name: true },
            },
        },
    })

    if (!submission) {
        redirect(`/hackathons/${slug}/stages`)
    }

    // Parse the content
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={session.user} signOutAction={signOutAction} />
            
            <div className="max-w-3xl mx-auto px-4 py-8 pt-24">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/hackathons/${slug}/stages`}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Stages
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Your Submission</h1>
                    <p className="text-gray-600 mt-2">Stage: {stage.name}</p>
                </div>

                {/* Submission Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Status Header */}
                    <div className="bg-green-50 border-b border-green-100 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                                <div>
                                    <h2 className="font-semibold text-green-800">Submitted Successfully</h2>
                                    <p className="text-sm text-green-600 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDateTime(submission.submittedAt)}
                                    </p>
                                </div>
                            </div>
                            {submission.score !== null && (
                                <div className="bg-white px-4 py-2 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-2xl font-bold text-gray-900">{submission.score}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">Score</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submission Content */}
                    <div className="p-6 space-y-6">
                        {/* Submitted by */}
                        <div className="text-sm text-gray-500">
                            {submission.team ? (
                                <span>Submitted by team: <strong>{submission.team.name}</strong></span>
                            ) : (
                                <span>Submitted by: <strong>{submission.user.name}</strong></span>
                            )}
                        </div>

                        {/* Title */}
                        {parsedContent.title && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{parsedContent.title}</h3>
                            </div>
                        )}

                        {/* Description */}
                        {parsedContent.content && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                                <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                                    {parsedContent.content}
                                </p>
                            </div>
                        )}

                        {/* Links */}
                        <div className="grid gap-4">
                            {parsedContent.fileUrl && (
                                <a
                                    href={parsedContent.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                                >
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="font-medium text-blue-900">Document/File</p>
                                        <p className="text-sm text-blue-600 truncate">{parsedContent.fileUrl}</p>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-blue-600" />
                                </a>
                            )}

                            {parsedContent.demoUrl && (
                                <a
                                    href={parsedContent.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                                >
                                    <LinkIcon className="h-5 w-5 text-purple-600" />
                                    <div className="flex-1">
                                        <p className="font-medium text-purple-900">Live Demo</p>
                                        <p className="text-sm text-purple-600 truncate">{parsedContent.demoUrl}</p>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-purple-600" />
                                </a>
                            )}

                            {parsedContent.repoUrl && (
                                <a
                                    href={parsedContent.repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                                    </svg>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Repository</p>
                                        <p className="text-sm text-gray-600 truncate">{parsedContent.repoUrl}</p>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-gray-600" />
                                </a>
                            )}
                        </div>

                        {/* Feedback */}
                        {submission.feedback && (
                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    Judge Feedback
                                </h4>
                                <p className="text-gray-600 bg-yellow-50 p-4 rounded-xl">
                                    {submission.feedback}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
