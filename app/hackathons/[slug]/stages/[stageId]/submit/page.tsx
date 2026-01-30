import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { ArrowLeft, Upload, FileText, Link as LinkIcon } from "lucide-react"
import { revalidatePath } from "next/cache"

interface SubmitPageProps {
    params: Promise<{ slug: string; stageId: string }>
}

export default async function SubmitPage({ params }: SubmitPageProps) {
    const { slug, stageId } = await params
    const session = await auth()

    if (!session?.user) {
        redirect(`/sign-in?callbackUrl=/hackathons/${slug}/stages/${stageId}/submit`)
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

    // Check if user is registered
    const registration = await prisma.hackathonRegistration.findUnique({
        where: {
            hackathonId_userId: {
                hackathonId: hackathon.id,
                userId: session.user.id!,
            },
        },
    })

    if (!registration || registration.status !== "APPROVED") {
        redirect(`/hackathons/${slug}`)
    }

    // Get user's team
    const teamMember = await prisma.teamMember.findFirst({
        where: {
            userId: session.user.id,
            team: { hackathonId: hackathon.id },
        },
        include: { team: true },
    })

    // Check if stage is active
    const now = new Date()
    const isActive = now >= stage.startDate && now <= stage.endDate

    if (!isActive) {
        redirect(`/hackathons/${slug}/stages`)
    }

    // Check for existing submission
    const existingSubmission = await prisma.stageSubmission.findFirst({
        where: {
            stageId: stage.id,
            OR: [
                { userId: session.user.id },
                ...(teamMember ? [{ teamId: teamMember.teamId }] : []),
            ],
        },
    })

    if (existingSubmission) {
        redirect(`/hackathons/${slug}/stages/${stageId}/submission`)
    }

    async function submitAction(formData: FormData) {
        "use server"
        
        const sessionData = await auth()
        if (!sessionData?.user?.id) {
            throw new Error("Unauthorized")
        }

        const title = formData.get("title") as string
        const content = formData.get("content") as string
        const fileUrl = formData.get("fileUrl") as string
        const demoUrl = formData.get("demoUrl") as string
        const repoUrl = formData.get("repoUrl") as string

        // Get team if exists
        const member = await prisma.teamMember.findFirst({
            where: {
                userId: sessionData.user.id,
                team: { hackathonId: hackathon!.id },
            },
        })

        await prisma.stageSubmission.create({
            data: {
                stageId: stageId,
                hackathonId: hackathon!.id,
                userId: sessionData.user.id,
                teamId: member?.teamId,
                content: JSON.stringify({
                    title,
                    content,
                    fileUrl,
                    demoUrl,
                    repoUrl,
                }),
                submittedAt: new Date(),
            },
        })

        revalidatePath(`/hackathons/${slug}/stages`)
        redirect(`/hackathons/${slug}/stages`)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/hackathons/${slug}/stages`}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Stages
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Submit to {stage.name}</h1>
                    <p className="text-gray-600 mt-2">{stage.description}</p>
                    {teamMember && (
                        <p className="text-sm text-indigo-600 mt-2">
                            Submitting as team: {teamMember.team.name}
                        </p>
                    )}
                </div>

                {/* Submission Form */}
                <form action={submitAction} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Submission Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your submission title"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            required
                            rows={6}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe your submission, approach, and key features..."
                        />
                    </div>

                    {/* File URL */}
                    <div>
                        <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="h-4 w-4 inline mr-1" />
                            File/Document URL
                        </label>
                        <input
                            type="url"
                            id="fileUrl"
                            name="fileUrl"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://drive.google.com/... or https://..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Link to your presentation, documentation, or other files
                        </p>
                    </div>

                    {/* Demo URL */}
                    <div>
                        <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                            <LinkIcon className="h-4 w-4 inline mr-1" />
                            Demo/Live URL
                        </label>
                        <input
                            type="url"
                            id="demoUrl"
                            name="demoUrl"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://your-demo-site.com"
                        />
                    </div>

                    {/* Repository URL */}
                    <div>
                        <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                            <svg className="h-4 w-4 inline mr-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                            Repository URL
                        </label>
                        <input
                            type="url"
                            id="repoUrl"
                            name="repoUrl"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://github.com/username/repo"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Upload className="h-5 w-5" />
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
