import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { createGoogleMeet, hasTimeConflict } from "@/lib/utils/google-meet"
import { sendEmail, meetingScheduledTemplate } from "@/lib/utils/email"

/**
 * POST /api/hackathons/[hackathonId]/meetings
 * 
 * Schedule a new meeting (mentoring session or evaluation)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ hackathonId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { hackathonId } = await params
        const body = await req.json()
        const {
            submissionId,
            teamId,
            title,
            description,
            type, // MENTORING or EVALUATION
            scheduledAt,
            duration = 30,
            timezone = "UTC",
            notes,
        } = body

        // Validate required fields
        if (!title || !scheduledAt || !type) {
            return NextResponse.json(
                { error: "Missing required fields: title, scheduledAt, type" },
                { status: 400 }
            )
        }

        if (!["MENTORING", "EVALUATION", "PRESENTATION"].includes(type)) {
            return NextResponse.json(
                { error: "Invalid meeting type" },
                { status: 400 }
            )
        }

        // Verify user is a mentor or judge for this hackathon
        const roleType = type === "MENTORING" ? "MENTOR" : "JUDGE"
        const role = await prisma.hackathonRole.findFirst({
            where: {
                hackathonId,
                userId: session.user.id,
                role: roleType,
                status: "ACCEPTED",
            },
        })

        if (!role) {
            return NextResponse.json(
                { error: `You are not a ${roleType.toLowerCase()} for this hackathon` },
                { status: 403 }
            )
        }

        // Get hackathon details
        const hackathon = await prisma.hackathon.findUnique({
            where: { id: hackathonId },
            select: { title: true, slug: true },
        })

        if (!hackathon) {
            return NextResponse.json(
                { error: "Hackathon not found" },
                { status: 404 }
            )
        }

        // Parse dates
        const startTime = new Date(scheduledAt)
        const endTime = new Date(startTime.getTime() + duration * 60000)

        // Check for scheduling conflicts
        const existingMeetings = await prisma.meetingSession.findMany({
            where: {
                hostId: session.user.id,
                status: { not: "CANCELLED" },
                scheduledAt: {
                    gte: new Date(startTime.getTime() - 24 * 60 * 60 * 1000), // Check within 24 hours
                    lte: new Date(startTime.getTime() + 24 * 60 * 60 * 1000),
                },
            },
            select: {
                scheduledAt: true,
                endTime: true,
            },
        })

        if (hasTimeConflict(startTime, endTime, existingMeetings)) {
            return NextResponse.json(
                { error: "This time slot conflicts with another meeting you have scheduled" },
                { status: 409 }
            )
        }

        // Get team and its members
        let team = null
        let teamMembers: { userId: string; user: { email: string; name: string | null } }[] = []
        
        if (teamId) {
            team = await prisma.team.findUnique({
                where: { id: teamId },
                include: {
                    leader: { select: { email: true, name: true } },
                    members: {
                        include: {
                            user: { select: { email: true, name: true } },
                        },
                    },
                },
            })

            if (team) {
                teamMembers = team.members
            }
        }

        // Get host info
        const host = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { email: true, name: true },
        })

        if (!host) {
            return NextResponse.json(
                { error: "Host not found" },
                { status: 404 }
            )
        }

        // Collect all attendee emails
        const attendeeEmails = teamMembers.map(m => m.user.email)
        const attendeeNames = teamMembers.map(m => m.user.name || "Team Member")

        // Create the meeting record first
        const meeting = await prisma.meetingSession.create({
            data: {
                hackathonId,
                submissionId,
                hostId: session.user.id,
                teamId,
                title,
                description,
                type,
                scheduledAt: startTime,
                duration,
                endTime,
                timezone,
                hostNotes: notes,
                status: "SCHEDULED",
            },
        })

        // Create Google Meet link
        const meetResult = await createGoogleMeet({
            meetingId: meeting.id,
            hostEmail: host.email,
            hostName: host.name || "Host",
            attendeeEmails,
            attendeeNames,
            title,
            description: description || `${type === "MENTORING" ? "Mentoring" : "Evaluation"} session for ${hackathon.title}`,
            startIso: startTime.toISOString(),
            endIso: endTime.toISOString(),
            durationMinutes: duration,
            timezone,
            hackathonTitle: hackathon.title,
        })

        // Update meeting with meet link
        const updatedMeeting = await prisma.meetingSession.update({
            where: { id: meeting.id },
            data: {
                meetLink: meetResult.meetLink,
                calendarEventId: meetResult.eventId,
            },
        })

        // If linked to a submission, update the submission
        if (submissionId) {
            await prisma.stageSubmission.update({
                where: { id: submissionId },
                data: {
                    status: "UNDER_REVIEW",
                    feedback: `Meeting scheduled for ${startTime.toLocaleString()}`,
                },
            })
        }

        // Create notifications and send emails to all team members
        const dateStr = startTime.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        const timeStr = startTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })

        // Create notification for each team member
        const notificationPromises = teamMembers.map(member =>
            prisma.notification.create({
                data: {
                    userId: member.userId,
                    type: "MEETING",
                    title: `${type === "MENTORING" ? "Mentoring" : "Evaluation"} Session Scheduled`,
                    message: `${host.name} has scheduled a ${type.toLowerCase()} session on ${dateStr} at ${timeStr}`,
                    link: `/hackathons/${hackathon.slug}/meetings/${meeting.id}`,
                },
            })
        )

        await Promise.all(notificationPromises)

        // Send emails to all team members
        const emailPromises = teamMembers.map(member =>
            sendEmail({
                to: [{ email: member.user.email, name: member.user.name || undefined }],
                subject: `${type === "MENTORING" ? "Mentoring" : "Evaluation"} Session Scheduled - ${hackathon.title}`,
                html: meetingScheduledTemplate({
                    recipientName: member.user.name || "Team Member",
                    meetingTitle: title,
                    hackathonName: hackathon.title,
                    hostName: host.name || "Host",
                    date: dateStr,
                    time: timeStr,
                    duration,
                    meetLink: meetResult.meetLink,
                    meetingType: type,
                    notes,
                }),
            })
        )

        await Promise.all(emailPromises)

        return NextResponse.json({
            success: true,
            meeting: updatedMeeting,
            meetLink: meetResult.meetLink,
        })
    } catch (error) {
        console.error("[Schedule Meeting API] Error:", error)
        return NextResponse.json(
            { error: "Failed to schedule meeting" },
            { status: 500 }
        )
    }
}

/**
 * GET /api/hackathons/[hackathonId]/meetings
 * 
 * Get all meetings for a hackathon (for the current user)
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ hackathonId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { hackathonId } = await params
        const searchParams = req.nextUrl.searchParams
        const role = searchParams.get("role") // "host" or "attendee"
        const status = searchParams.get("status") // "upcoming", "past", "all"

        // Build query
        const whereClause: {
            hackathonId: string
            hostId?: string
            teamId?: string
            status?: { not: "CANCELLED" } | { equals: "SCHEDULED" | "IN_PROGRESS" } | { in: ("COMPLETED" | "NO_SHOW")[] }
            scheduledAt?: { gte?: Date; lt?: Date }
        } = {
            hackathonId,
        }

        if (role === "host") {
            whereClause.hostId = session.user.id
        } else {
            // Get user's team in this hackathon
            const teamMember = await prisma.teamMember.findFirst({
                where: {
                    userId: session.user.id,
                    team: { hackathonId },
                },
                select: { teamId: true },
            })

            if (teamMember) {
                whereClause.teamId = teamMember.teamId
            }
        }

        // Filter by status
        if (status === "upcoming") {
            whereClause.status = { not: "CANCELLED" }
            whereClause.scheduledAt = { gte: new Date() }
        } else if (status === "past") {
            whereClause.scheduledAt = { lt: new Date() }
        }

        const meetings = await prisma.meetingSession.findMany({
            where: whereClause,
            include: {
                host: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
                team: {
                    select: { id: true, name: true },
                },
                submission: {
                    select: { id: true, title: true },
                },
            },
            orderBy: { scheduledAt: status === "past" ? "desc" : "asc" },
        })

        return NextResponse.json({ meetings })
    } catch (error) {
        console.error("[Get Meetings API] Error:", error)
        return NextResponse.json(
            { error: "Failed to fetch meetings" },
            { status: 500 }
        )
    }
}
