"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn, formatDateTime } from "@/lib/utils"
import {
    CheckCircle,
    Clock,
    AlertCircle,
    Eye,
    MoreHorizontal,
    Star,
    MessageSquare,
    ExternalLink,
} from "lucide-react"
import { judgeSubmission, updateSubmissionStatus } from "@/lib/actions/stage-submission"

interface Submission {
    id: string
    title: string | null
    description: string | null
    status: string
    submittedAt: Date
    isLate: boolean
    score: number | null
    feedback: string | null
    links: unknown
    user: {
        id: string
        name: string | null
        email: string
        avatar: string | null
    }
}

interface StageSubmissionsProps {
    submissions: Submission[]
    stageId: string
    slug: string
}

export default function StageSubmissions({ submissions, stageId, slug }: StageSubmissionsProps) {
    const router = useRouter()
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
    const [score, setScore] = useState("")
    const [feedback, setFeedback] = useState("")
    const [loading, setLoading] = useState(false)

    const statusColors: Record<string, { bg: string; text: string }> = {
        PENDING: { bg: "bg-gray-100", text: "text-gray-700" },
        SUBMITTED: { bg: "bg-blue-100", text: "text-blue-700" },
        UNDER_REVIEW: { bg: "bg-yellow-100", text: "text-yellow-700" },
        APPROVED: { bg: "bg-green-100", text: "text-green-700" },
        REJECTED: { bg: "bg-red-100", text: "text-red-700" },
        NEEDS_REVISION: { bg: "bg-orange-100", text: "text-orange-700" },
    }

    const handleReview = async () => {
        if (!selectedSubmission || !score) return
        setLoading(true)

        const result = await judgeSubmission(selectedSubmission.id, {
            score: parseFloat(score),
            feedback: feedback || undefined,
        })

        setLoading(false)
        if (result.success) {
            setSelectedSubmission(null)
            setScore("")
            setFeedback("")
            router.refresh()
        }
    }

    const handleStatusChange = async (submissionId: string, newStatus: string) => {
        const result = await updateSubmissionStatus(
            submissionId,
            newStatus as "PENDING" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "NEEDS_REVISION"
        )
        if (result.success) {
            router.refresh()
        }
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Submissions ({submissions.length})</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                {submissions.filter((s) => s.status === "APPROVED").length} reviewed
                            </span>
                        </div>
                    </div>
                </div>

                {submissions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No submissions yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {submissions.map((submission) => {
                            const colors = statusColors[submission.status] || statusColors.PENDING

                            return (
                                <div key={submission.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        {/* User Avatar */}
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                                                {submission.user.name?.[0]?.toUpperCase() || "?"}
                                            </div>
                                        </div>

                                        {/* Submission Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900">
                                                    {submission.user.name || submission.user.email}
                                                </span>
                                                {submission.isLate && (
                                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                                                        Late
                                                    </span>
                                                )}
                                            </div>
                                            {submission.title && (
                                                <p className="text-gray-900 mb-1">{submission.title}</p>
                                            )}
                                            {submission.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                    {submission.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>{formatDateTime(submission.submittedAt)}</span>
                                                {submission.score !== null && (
                                                    <span className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 text-yellow-500" />
                                                        Score: {submission.score}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status & Actions */}
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={cn(
                                                    "px-3 py-1 rounded-full text-xs font-medium",
                                                    colors.bg,
                                                    colors.text
                                                )}
                                            >
                                                {submission.status.replace("_", " ")}
                                            </span>

                                            <button
                                                onClick={() => {
                                                    setSelectedSubmission(submission)
                                                    setScore(submission.score?.toString() || "")
                                                    setFeedback(submission.feedback || "")
                                                }}
                                                className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                Review
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Review Submission
                                </h2>
                                <button
                                    onClick={() => setSelectedSubmission(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Submitter Info */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-lg">
                                    {selectedSubmission.user.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {selectedSubmission.user.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {selectedSubmission.user.email}
                                    </p>
                                </div>
                            </div>

                            {/* Submission Content */}
                            {Boolean(selectedSubmission.title) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title
                                    </label>
                                    <p className="text-gray-900">{String(selectedSubmission.title)}</p>
                                </div>
                            )}

                            {Boolean(selectedSubmission.description) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <p className="text-gray-600">{String(selectedSubmission.description)}</p>
                                </div>
                            )}

                            {selectedSubmission.links && Array.isArray(selectedSubmission.links) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Links
                                    </label>
                                    <div className="space-y-2">
                                        {(selectedSubmission.links as { label: string; url: string }[]).map(
                                            (link, i) => (
                                                <a
                                                    key={i}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    {link.label}
                                                </a>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Score Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Score
                                </label>
                                <input
                                    type="number"
                                    value={score}
                                    onChange={(e) => setScore(e.target.value)}
                                    placeholder="Enter score (0-100)"
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Feedback */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Feedback
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Provide feedback to the participant..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReview}
                                disabled={loading || !score}
                                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save Review"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
