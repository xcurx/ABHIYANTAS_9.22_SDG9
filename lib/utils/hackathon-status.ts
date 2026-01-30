/**
 * Hackathon Status Utility Functions
 * These are pure functions that calculate status based on dates
 */

export type HackathonStatus = 
    | "DRAFT" 
    | "PUBLISHED" 
    | "REGISTRATION_OPEN" 
    | "REGISTRATION_CLOSED" 
    | "IN_PROGRESS" 
    | "JUDGING" 
    | "COMPLETED" 
    | "CANCELLED"

/**
 * Get the start of a day in UTC (00:00:00.000 UTC)
 */
function startOfDayUTC(date: Date): Date {
    const d = new Date(date)
    d.setUTCHours(0, 0, 0, 0)
    return d
}

/**
 * Get the end of a day in UTC (23:59:59.999 UTC)
 */
function endOfDayUTC(date: Date): Date {
    const d = new Date(date)
    d.setUTCHours(23, 59, 59, 999)
    return d
}

/**
 * Compare dates by calendar day only (ignoring time)
 * Returns: -1 if a < b, 0 if same day, 1 if a > b
 */
function compareDays(a: Date, b: Date): number {
    const aDate = new Date(a.getFullYear(), a.getMonth(), a.getDate())
    const bDate = new Date(b.getFullYear(), b.getMonth(), b.getDate())
    if (aDate < bDate) return -1
    if (aDate > bDate) return 1
    return 0
}

/**
 * Check if date a is on or before date b (by calendar day)
 */
function isOnOrBefore(a: Date, b: Date): boolean {
    return compareDays(a, b) <= 0
}

/**
 * Check if date a is on or after date b (by calendar day)
 */
function isOnOrAfter(a: Date, b: Date): boolean {
    return compareDays(a, b) >= 0
}

/**
 * Check if date a is strictly after date b (by calendar day)
 */
function isAfter(a: Date, b: Date): boolean {
    return compareDays(a, b) > 0
}

/**
 * Check if date a is strictly before date b (by calendar day)
 */
function isBefore(a: Date, b: Date): boolean {
    return compareDays(a, b) < 0
}

/**
 * Calculate the correct hackathon status based on dates
 * This is the single source of truth for status determination
 * 
 * Note: Comparisons are done by calendar day, not exact time
 * so if registration ends Feb 1, it's open all day on Feb 1
 */
export function calculateHackathonStatus(
    registrationStart: Date,
    registrationEnd: Date,
    hackathonStart: Date,
    hackathonEnd: Date,
    currentStatus: HackathonStatus = "DRAFT",
    resultsDate?: Date | null
): HackathonStatus {
    const now = new Date()

    // If cancelled or draft, don't auto-update
    if (currentStatus === "CANCELLED" || currentStatus === "DRAFT") {
        return currentStatus
    }

    // If hackathon has ended (today is after hackathon end date)
    if (isAfter(now, hackathonEnd)) {
        // If results date is set and we're past it, mark as completed
        if (resultsDate && isAfter(now, resultsDate)) {
            return "COMPLETED"
        }
        // Otherwise, mark as judging
        return "JUDGING"
    }

    // If hackathon is in progress (today is on or after start, and on or before end)
    if (isOnOrAfter(now, hackathonStart) && isOnOrBefore(now, hackathonEnd)) {
        return "IN_PROGRESS"
    }

    // If registration has ended but hackathon hasn't started
    // (today is after registration end AND before hackathon start)
    if (isAfter(now, registrationEnd) && isBefore(now, hackathonStart)) {
        return "REGISTRATION_CLOSED"
    }

    // If registration is open (today is on or after reg start AND on or before reg end)
    if (isOnOrAfter(now, registrationStart) && isOnOrBefore(now, registrationEnd)) {
        return "REGISTRATION_OPEN"
    }

    // If before registration starts (hackathon is published but registration not yet open)
    if (isBefore(now, registrationStart)) {
        return "PUBLISHED"
    }

    return currentStatus
}

/**
 * Get computed status for a single hackathon (without updating DB)
 * Useful for real-time display
 */
export function getComputedHackathonStatus(hackathon: {
    registrationStart: Date
    registrationEnd: Date
    hackathonStart: Date
    hackathonEnd: Date
    status: string
    resultsDate?: Date | null
}): HackathonStatus {
    return calculateHackathonStatus(
        hackathon.registrationStart,
        hackathon.registrationEnd,
        hackathon.hackathonStart,
        hackathon.hackathonEnd,
        hackathon.status as HackathonStatus,
        hackathon.resultsDate
    )
}
