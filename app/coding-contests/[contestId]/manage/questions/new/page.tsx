import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCodingContestBySlug } from "@/lib/actions/coding-contest"
import NewQuestionForm from "./question-form"

export default async function NewQuestionPage({
    params,
}: {
    params: Promise<{ contestId: string }>
}) {
    const session = await auth()
    const { contestId } = await params

    if (!session) {
        redirect("/sign-in")
    }

    const contest = await getCodingContestBySlug(contestId)

    if (!contest) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
                <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
                    <Link href={`/coding-contests/${contest.slug}/manage/questions`} className="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Questions
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Add New Question</h1>
                    <p className="text-gray-400 text-sm">{contest.title}</p>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <NewQuestionForm contestId={contest.id} contestSlug={contest.slug} />
            </main>
        </div>
    )
}
