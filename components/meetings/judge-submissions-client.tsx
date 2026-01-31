"use client"

import { useState } from "react"
import Link from "next/link"
import { Video, CheckCircle, Clock, Users, Star, ChevronRight, ExternalLink } from "lucide-react"
import { ScheduleMeetingModal } from "@/components/meetings/schedule-meeting-modal"
import { cn } from "@/lib/utils"

interface Submission {
    id: string
    stageId: string
    content: string | null
    status: string
    submittedAt: Date
    score: number | null
    stage: { id: string; name: string }
    team: { 
        id: string
        name: string
        leader: { name: string | null } 
    } | null
    user: { name: string | null; email: string }
}

interface UpcomingMeeting {
    id: string
    title: string
    scheduledAt: Date
    meetLink: string | null
    team: { name: string } | null
}

interface JudgeSubmissionsClientProps {
    submissions: Submission[]
    hackathonId: string
    hackathonSlug: string
    upcomingMeetings?: UpcomingMeeting[]
}

function formatDateTime(date: Date) {
    return new Date(date).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

export function JudgeSubmissionsClient({
    submissions,
    hackathonId,
    hackathonSlug,
    upcomingMeetings = [],
}: JudgeSubmissionsClientProps) {
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
    const [showScheduleModal, setShowScheduleModal] = useState(false)

    const handleScheduleMeeting = (submission: Submission, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setSelectedSubmission(submission)
        setShowScheduleModal(true)
    }

    const handleMeetingScheduled = () => {
        window.location.reload()
    }

    const getSubmissionTitle = (submission: Submission) => {
        try {
            const content = JSON.parse(submission.content || "{}")
            return content.title || "Untitled Submission"
        } catch {
            return "Untitled Submission"
        }
    }

    return (
        <>
            {/* Upcoming Meetings */}
            {upcomingMeetings.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Video className="h-5 w-5 text-purple-600" />
                        Upcoming Evaluation Meetings
                    </h3>
                    <div className="grid gap-3">
                        {upcomingMeetings.map((meeting) => (
                            <div
                                key={meeting.id}
                                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">{meeting.title}</p>
                                    <p className="text-sm text-gray-600">
                                        {meeting.team?.name} • {formatDateTime(meeting.scheduledAt)}
                                    </p>
                                </div>
                                {meeting.meetLink && (
                                    <a
                                        href={meeting.meetLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                    >
                                        <Video className="h-4 w-4" />
                                        Join Meet
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Submissions List */}
            <div className="divide-y">
                {submissions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No submissions yet for this stage
                    </div>
                ) : (
                    submissions.map((submission) => (
                        <div
                            key={submission.id}
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
                                    {getSubmissionTitle(submission)}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <Users className="h-3 w-3" />
                                    {submission.team?.name || submission.user.name}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Schedule Meeting Button */}
                                {submission.score === null && submission.team && (
                                    <button
                                        onClick={(e) => handleScheduleMeeting(submission, e)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium"
                                    >
                                        <Video className="h-4 w-4" />
                                        Schedule Meet
                                    </button>
                                )}
                                
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
                                
                                <Link
                                    href={`/hackathons/${hackathonSlug}/judge/submissions/${submission.id}`}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Schedule Meeting Modal */}
            {selectedSubmission && (
                <ScheduleMeetingModal
                    isOpen={showScheduleModal}
                    onClose={() => {
                        setShowScheduleModal(false)
                        setSelectedSubmission(null)
                    }}
                    hackathonId={hackathonId}
                    hackathonSlug={hackathonSlug}
                    submissionId={selectedSubmission.id}
                    teamId={selectedSubmission.team?.id}
                    teamName={selectedSubmission.team?.name}
                    requestTopic={getSubmissionTitle(selectedSubmission)}
                    type="EVALUATION"
                    onSuccess={handleMeetingScheduled}
                />
            )}
        </>
    )
}
