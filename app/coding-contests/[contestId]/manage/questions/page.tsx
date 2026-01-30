import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getContestQuestions, deleteQuestion, reorderQuestions } from "@/lib/actions/coding-question"
import { getCodingContestById } from "@/lib/actions/coding-contest"

type Difficulty = "EASY" | "MEDIUM" | "HARD"
type QuestionType = "MCQ" | "CODING"

const difficultyColors: Record<Difficulty, string> = {
    EASY: "bg-green-600/20 text-green-400 border-green-500/30",
    MEDIUM: "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
    HARD: "bg-red-600/20 text-red-400 border-red-500/30",
}

const typeIcons: Record<QuestionType, string> = {
    MCQ: "📝",
    CODING: "💻",
}

async function handleDelete(questionId: string) {
    "use server"
    await deleteQuestion(questionId)
}

export default async function ManageQuestionsPage({
    params,
}: {
    params: Promise<{ contestId: string }>
}) {
    const session = await auth()
    const { contestId } = await params

    if (!session) {
        redirect("/sign-in")
    }

    const contest = await getCodingContestById(contestId)

    if (!contest) {
        notFound()
    }

    const questions = await getContestQuestions(contest.id)

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
    const mcqCount = questions.filter(q => q.type === "MCQ").length
    const codingCount = questions.filter(q => q.type === "CODING").length

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link href={`/coding-contests/${contest.slug}/manage`} className="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-white">{contest.title} - Questions</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/coding-contests/${contest.slug}/manage/questions/new?type=mcq`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 transition-colors"
                            >
                                <span>📝</span> Add MCQ
                            </Link>
                            <Link
                                href={`/coding-contests/${contest.slug}/manage/questions/new?type=coding`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors"
                            >
                                <span>💻</span> Add Coding Question
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Stats Bar */}
                <div className="flex items-center gap-6 mb-8 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">Total:</span>
                        <span className="font-semibold text-white">{questions.length} questions</span>
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">📝 MCQ:</span>
                        <span className="font-semibold text-white">{mcqCount}</span>
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">💻 Coding:</span>
                        <span className="font-semibold text-white">{codingCount}</span>
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">⭐ Points:</span>
                        <span className="font-semibold text-white">{totalPoints}</span>
                    </div>
                </div>

                {questions.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-900/50 mb-6">
                            <span className="text-5xl">📝</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">No questions yet</h2>
                        <p className="text-gray-400 max-w-md mx-auto mb-8">
                            Start building your contest by adding questions. You can add MCQ questions for quick assessments or coding challenges with test cases.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Link
                                href={`/coding-contests/${contest.slug}/manage/questions/new?type=mcq`}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 transition-colors"
                            >
                                <span>📝</span> Add MCQ Question
                            </Link>
                            <Link
                                href={`/coding-contests/${contest.slug}/manage/questions/new?type=coding`}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors"
                            >
                                <span>💻</span> Add Coding Question
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map((question, index) => (
                            <div
                                key={question.id}
                                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Order Number */}
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center text-lg font-bold text-purple-300">
                                            {question.order}
                                        </span>
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                            </button>
                                            <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Question Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-xl">{typeIcons[question.type as QuestionType]}</span>
                                                    <h3 className="text-lg font-semibold text-white">{question.title}</h3>
                                                    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${difficultyColors[question.difficulty as Difficulty]}`}>
                                                        {question.difficulty}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                                                    {question.description.replace(/<[^>]*>/g, '').slice(0, 200)}...
                                                </p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="text-purple-400 font-medium">
                                                        ⭐ {question.points} points
                                                    </span>
                                                    {question.type === "CODING" && question.testCases && (
                                                        <span className="text-gray-400">
                                                            🧪 {question.testCases.length} test cases
                                                        </span>
                                                    )}
                                                    {question.type === "MCQ" && question.options && (
                                                        <span className="text-gray-400">
                                                            ✓ {(question.options as unknown[]).length} options
                                                        </span>
                                                    )}
                                                    {question.timeLimit && (
                                                        <span className="text-gray-400">
                                                            ⏱️ {question.timeLimit}ms limit
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/coding-contests/${contest.slug}/manage/questions/${question.id}`}
                                                    className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                                <form action={handleDelete.bind(null, question.id)}>
                                                    <button
                                                        type="submit"
                                                        className="px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                                        onClick={(e) => {
                                                            if (!confirm("Are you sure you want to delete this question?")) {
                                                                e.preventDefault()
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-12 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">💡 Tips for Creating Great Questions</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                            <span className="text-green-400">✓</span>
                            <p className="text-gray-300">
                                <strong className="text-white">MCQ Questions:</strong> Best for testing conceptual knowledge. Include clear options and explain the correct answer.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-green-400">✓</span>
                            <p className="text-gray-300">
                                <strong className="text-white">Coding Questions:</strong> Add comprehensive test cases including edge cases. Use hidden test cases to prevent hardcoding.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-green-400">✓</span>
                            <p className="text-gray-300">
                                <strong className="text-white">Difficulty Balance:</strong> Mix easy, medium, and hard questions to cater to all skill levels.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-green-400">✓</span>
                            <p className="text-gray-300">
                                <strong className="text-white">Points Allocation:</strong> Assign higher points to harder questions. Consider partial scoring for coding challenges.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
