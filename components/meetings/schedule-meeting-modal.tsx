"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Video, X, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScheduleMeetingModalProps {
    isOpen: boolean
    onClose: () => void
    hackathonId: string
    hackathonSlug: string
    submissionId?: string
    teamId?: string
    teamName?: string
    requestTopic?: string
    type: "MENTORING" | "EVALUATION"
    onSuccess?: (meeting: { meetLink: string; scheduledAt: string }) => void
}

interface ScheduledTime {
    id: string
    scheduledAt: string
    endTime: string
    duration: number
    title: string
    teamName?: string
}

export function ScheduleMeetingModal({
    isOpen,
    onClose,
    hackathonId,
    hackathonSlug,
    submissionId,
    teamId,
    teamName,
    requestTopic,
    type,
    onSuccess,
}: ScheduleMeetingModalProps) {
    const [title, setTitle] = useState(requestTopic || "")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [duration, setDuration] = useState(30)
    const [notes, setNotes] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [scheduledTimes, setScheduledTimes] = useState<ScheduledTime[]>([])
    const [loadingTimes, setLoadingTimes] = useState(false)

    // Set default title based on type and team
    useEffect(() => {
        if (!title && teamName) {
            setTitle(`${type === "MENTORING" ? "Mentoring" : "Evaluation"} Session with ${teamName}`)
        }
    }, [teamName, type, title])

    // Fetch scheduled times when date changes
    useEffect(() => {
        async function fetchScheduledTimes() {
            if (!date) return
            
            setLoadingTimes(true)
            try {
                const res = await fetch(
                    `/api/hackathons/${hackathonId}/meetings/scheduled-times?date=${date}`
                )
                if (res.ok) {
                    const data = await res.json()
                    setScheduledTimes(data.scheduledTimes || [])
                }
            } catch (err) {
                console.error("Failed to fetch scheduled times:", err)
            } finally {
                setLoadingTimes(false)
            }
        }

        fetchScheduledTimes()
    }, [date, hackathonId])

    // Check if selected time conflicts
    const checkConflict = () => {
        if (!date || !time) return false

        const selectedStart = new Date(`${date}T${time}`)
        const selectedEnd = new Date(selectedStart.getTime() + duration * 60000)

        return scheduledTimes.some(meeting => {
            const meetingStart = new Date(meeting.scheduledAt)
            const meetingEnd = new Date(meeting.endTime)
            return selectedStart < meetingEnd && selectedEnd > meetingStart
        })
    }

    const hasConflict = checkConflict()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (hasConflict) {
            setError("This time slot conflicts with another meeting")
            return
        }

        setLoading(true)
        setError("")

        try {
            const scheduledAt = new Date(`${date}T${time}`).toISOString()

            const res = await fetch(`/api/hackathons/${hackathonId}/meetings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    submissionId,
                    teamId,
                    title,
                    description,
                    type,
                    scheduledAt,
                    duration,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    notes,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to schedule meeting")
            }

            onSuccess?.({
                meetLink: data.meetLink,
                scheduledAt,
            })
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to schedule meeting")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    // Get min date (today)
    const today = new Date()
    const minDate = today.toISOString().split("T")[0]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-xl",
                            type === "MENTORING" ? "bg-green-100" : "bg-purple-100"
                        )}>
                            <Video className={cn(
                                "h-5 w-5",
                                type === "MENTORING" ? "text-green-600" : "text-purple-600"
                            )} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Schedule {type === "MENTORING" ? "Mentoring" : "Evaluation"} Session
                            </h2>
                            {teamName && (
                                <p className="text-sm text-gray-600">with {teamName}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meeting Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Technical Review Session"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Brief description of what will be discussed..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="h-4 w-4 inline mr-1" />
                                Date *
                            </label>
                            <input
                                type="date"
                                required
                                min={minDate}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Clock className="h-4 w-4 inline mr-1" />
                                Time *
                            </label>
                            <input
                                type="time"
                                required
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className={cn(
                                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                    hasConflict && "border-red-500 bg-red-50"
                                )}
                            />
                        </div>
                    </div>

                    {/* Conflict warning */}
                    {hasConflict && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-700">
                                This time conflicts with another meeting you have scheduled.
                                Please select a different time.
                            </p>
                        </div>
                    )}

                    {/* Show scheduled meetings for the day */}
                    {date && scheduledTimes.length > 0 && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Your meetings on {new Date(date).toLocaleDateString()}:
                            </p>
                            <div className="space-y-1">
                                {scheduledTimes.map(meeting => (
                                    <div key={meeting.id} className="text-sm text-gray-600 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                        {new Date(meeting.scheduledAt).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })} - {meeting.title}
                                        {meeting.teamName && <span className="text-gray-400">({meeting.teamName})</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {loadingTimes && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Checking your schedule...
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                        </label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={90}>1.5 hours</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes for the team
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Any instructions or topics to prepare..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || hasConflict}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition",
                                type === "MENTORING"
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-purple-600 text-white hover:bg-purple-700",
                                (loading || hasConflict) && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Scheduling...
                                </>
                            ) : (
                                <>
                                    <Video className="h-4 w-4" />
                                    Schedule & Create Meet
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        A Google Meet link will be created and shared with all team members via email and notification.
                    </p>
                </form>
            </div>
        </div>
    )
}
