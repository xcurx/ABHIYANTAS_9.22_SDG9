"use client"

import { useState } from "react"
import { Video, Send, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { ScheduleMeetingModal } from "@/components/meetings/schedule-meeting-modal"
import { cn } from "@/lib/utils"

interface MentoringRequest {
    id: string
    stageId: string
    content: string | null
    status: string
    submittedAt: Date
    feedback: string | null
    stage: { name: string }
    team: { 
        id: string
        name: string
        leader: { name: string | null; email: string } 
    } | null
    user: { name: string | null; email: string } | null
}

interface UpcomingMeeting {
    id: string
    title: string
    scheduledAt: Date
    meetLink: string | null
    team: { name: string } | null
}

interface MentoringRequestsClientProps {
    requests: MentoringRequest[]
    hackathonId: string
    hackathonSlug: string
    respondAction: (formData: FormData) => Promise<void>
    upcomingMeetings?: UpcomingMeeting[]
}

function formatDateTime(date: Date) {
    return new Date(date).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

export function MentoringRequestsClient({
    requests,
    hackathonId,
    hackathonSlug,
    respondAction,
    upcomingMeetings = [],
}: MentoringRequestsClientProps) {
    const [selectedRequest, setSelectedRequest] = useState<MentoringRequest | null>(null)
    const [showScheduleModal, setShowScheduleModal] = useState(false)

    const handleScheduleMeeting = (request: MentoringRequest) => {
        setSelectedRequest(request)
        setShowScheduleModal(true)
    }

    const handleMeetingScheduled = () => {
        // Refresh the page to show the new meeting
        window.location.reload()
    }

    // Parse content for each request
    const getRequestContent = (request: MentoringRequest) => {
        try {
            return JSON.parse(request.content || "{}")
        } catch {
            return {}
        }
    }

    return (
        <>
            {/* Upcoming Meetings */}
            {upcomingMeetings.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Video className="h-5 w-5 text-green-600" />
                        Upcoming Meetings
                    </h3>
                    <div className="grid gap-3">
                        {upcomingMeetings.map((meeting) => (
                            <div
                                key={meeting.id}
                                className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between"
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
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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

            {/* Requests List */}
            {requests.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No mentoring requests yet</h3>
                    <p className="text-gray-600 mt-2">
                        When teams request mentoring help, their requests will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => {
                        const content = getRequestContent(request)
                        const isPending = request.status === "PENDING"

                        return (
                            <div
                                key={request.id}
                                className={cn(
                                    "bg-white rounded-2xl shadow-sm border overflow-hidden",
                                    isPending && "ring-2 ring-amber-200"
                                )}
                            >
                                <div className={cn(
                                    "p-4 border-b",
                                    isPending ? "bg-amber-50" : "bg-gray-50"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isPending ? (
                                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                            ) : (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            )}
                                            <div>
                                                <span className="font-semibold text-gray-900">
                                                    {content.topic || "Mentoring Request"}
                                                </span>
                                                <span className="text-sm text-gray-500 ml-2">
                                                    from {request.team?.name || request.user?.name}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "px-2 py-0.5 text-xs rounded-full font-medium",
                                            isPending
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-green-100 text-green-700"
                                        )}>
                                            {isPending ? "Needs Response" : "Responded"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <p className="text-gray-700 mb-3">{content.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <span>{request.stage.name}</span>
                                        <span>•</span>
                                        <span>{formatDateTime(request.submittedAt)}</span>
                                        {request.team && (
                                            <>
                                                <span>•</span>
                                                <a
                                                    href={`mailto:${request.team.leader.email}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Contact Team
                                                </a>
                                            </>
                                        )}
                                    </div>

                                    {request.feedback ? (
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                            <p className="text-sm font-medium text-green-800 mb-1">Your Response:</p>
                                            <p className="text-sm text-green-700">{request.feedback}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Schedule Meeting Button */}
                                            <button
                                                onClick={() => handleScheduleMeeting(request)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                <Video className="h-4 w-4" />
                                                Schedule Google Meet
                                            </button>

                                            {/* Quick Response Form */}
                                            <form action={respondAction} className="space-y-3">
                                                <input type="hidden" name="requestId" value={request.id} />
                                                <textarea
                                                    name="response"
                                                    required
                                                    rows={3}
                                                    placeholder="Or send a quick text response..."
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                />
                                                <button
                                                    type="submit"
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                                >
                                                    <Send className="h-4 w-4" />
                                                    Send Text Response
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Schedule Meeting Modal */}
            {selectedRequest && (
                <ScheduleMeetingModal
                    isOpen={showScheduleModal}
                    onClose={() => {
                        setShowScheduleModal(false)
                        setSelectedRequest(null)
                    }}
                    hackathonId={hackathonId}
                    hackathonSlug={hackathonSlug}
                    submissionId={selectedRequest.id}
                    teamId={selectedRequest.team?.id}
                    teamName={selectedRequest.team?.name}
                    requestTopic={(() => {
                        try {
                            return JSON.parse(selectedRequest.content || "{}").topic
                        } catch {
                            return undefined
                        }
                    })()}
                    type="MENTORING"
                    onSuccess={handleMeetingScheduled}
                />
            )}
        </>
    )
}
