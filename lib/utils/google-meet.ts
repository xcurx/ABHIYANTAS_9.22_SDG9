/**
 * Google Meet Integration via Google Apps Script
 * 
 * This uses Google Apps Script as a proxy to create Google Calendar events
 * with Meet links, avoiding complex OAuth setup in the Next.js app.
 * 
 * Setup:
 * 1. Create a Google Apps Script project
 * 2. Deploy it as a web app
 * 3. Set GOOGLE_APPS_SCRIPT_WEB_APP_URL and GOOGLE_APPS_SCRIPT_TOKEN in .env
 */

export interface CreateMeetPayload {
    meetingId: string
    hostEmail: string
    hostName: string
    attendeeEmails: string[]
    attendeeNames: string[]
    title: string
    description?: string
    startIso: string
    endIso: string
    durationMinutes: number
    timezone: string
    hackathonTitle?: string
}

export interface CreateMeetResponse {
    meetLink: string
    eventId?: string
    htmlLink?: string
    error?: string
}

/**
 * Creates a Google Meet link via Google Apps Script
 * Falls back to a placeholder link if Apps Script is not configured
 */
export async function createGoogleMeet(payload: CreateMeetPayload): Promise<CreateMeetResponse> {
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL
    const scriptToken = process.env.GOOGLE_APPS_SCRIPT_TOKEN

    // Fallback if not configured - generate a placeholder link
    if (!scriptUrl) {
        console.warn("[Google Meet] Apps Script URL not configured, using fallback")
        // In development, you can use a fake meet link
        // In production, you should configure the Apps Script
        return {
            meetLink: `https://meet.google.com/lookup/${payload.meetingId.slice(0, 12)}`,
        }
    }

    try {
        const response = await fetch(scriptUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // Required fields
                hostEmail: payload.hostEmail,
                attendeeEmails: payload.attendeeEmails,
                title: payload.title,
                description: payload.description || `Meeting for ${payload.hackathonTitle || "Hackathon"}`,
                startDate: payload.startIso,
                endDate: payload.endIso,
                duration: String(payload.durationMinutes),
                timezone: payload.timezone,
                meetingId: payload.meetingId,
                
                // Auth token
                token: scriptToken,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Apps Script error (${response.status}): ${errorText}`)
        }

        const data = await response.json()

        // Check if Apps Script returned an error status
        if (data.status && data.status !== "success" && !String(data.status).includes("partial")) {
            throw new Error(data.message || "Apps Script responded with an error status.")
        }

        // Extract meet link from various possible response formats (matching SIH implementation)
        const meetLink = 
            data.meetLink || 
            data.hangoutLink || 
            data.conferenceLink ||
            data.meet?.meetLink ||
            data.meet?.hangoutLink

        if (!meetLink) {
            throw new Error("Apps Script response did not include a Meet link.")
        }

        return {
            meetLink,
            eventId: data.eventId || data.meet?.eventId,
            htmlLink: data.htmlLink || data.meet?.htmlLink,
        }
    } catch (error) {
        console.error("[Google Meet] Error creating meeting:", error)
        
        // Fallback to placeholder link on error
        return {
            meetLink: `https://meet.google.com/lookup/${payload.meetingId.slice(0, 12)}`,
            error: error instanceof Error ? error.message : "Failed to create meeting",
        }
    }
}

/**
 * Checks if a time slot conflicts with existing meetings
 */
export function hasTimeConflict(
    newStart: Date,
    newEnd: Date,
    existingMeetings: { scheduledAt: Date; endTime: Date }[]
): boolean {
    return existingMeetings.some(meeting => {
        const meetingStart = new Date(meeting.scheduledAt)
        const meetingEnd = new Date(meeting.endTime)
        
        // Check for overlap: newStart < existingEnd AND newEnd > existingStart
        return newStart < meetingEnd && newEnd > meetingStart
    })
}

/**
 * Gets available time slots for a given date, excluding existing meetings
 */
export function getAvailableTimeSlots(
    date: Date,
    existingMeetings: { scheduledAt: Date; endTime: Date }[],
    options: {
        startHour?: number      // Start of available hours (default 9am)
        endHour?: number        // End of available hours (default 6pm)
        slotDuration?: number   // Duration of each slot in minutes (default 30)
    } = {}
): { time: string; available: boolean }[] {
    const { startHour = 9, endHour = 18, slotDuration = 30 } = options
    const slots: { time: string; available: boolean }[] = []

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
            const slotStart = new Date(date)
            slotStart.setHours(hour, minute, 0, 0)
            
            const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000)
            
            const isAvailable = !hasTimeConflict(slotStart, slotEnd, existingMeetings)
            
            slots.push({
                time: slotStart.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                }),
                available: isAvailable,
            })
        }
    }

    return slots
}
