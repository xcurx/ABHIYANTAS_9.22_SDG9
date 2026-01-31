import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

/**
 * GET /api/hackathons/[hackathonId]/meetings/scheduled-times
 * 
 * Returns all scheduled meetings for the current user (mentor/judge)
 * Used for conflict detection when scheduling new meetings
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
        const dateParam = searchParams.get("date") // Optional: filter by specific date

        // Verify user is a mentor or judge for this hackathon
        const role = await prisma.hackathonRole.findFirst({
            where: {
                hackathonId,
                userId: session.user.id,
                role: { in: ["MENTOR", "JUDGE"] },
                status: "ACCEPTED",
            },
        })

        if (!role) {
            return NextResponse.json(
                { error: "You are not a mentor or judge for this hackathon" },
                { status: 403 }
            )
        }

        // Build query filter
        const whereClause: {
            hostId: string
            status: { not: "CANCELLED" }
            scheduledAt?: { gte?: Date; lt?: Date }
        } = {
            hostId: session.user.id,
            status: { not: "CANCELLED" },
        }

        // If date is provided, filter by that date
        if (dateParam) {
            const date = new Date(dateParam)
            const startOfDay = new Date(date)
            startOfDay.setHours(0, 0, 0, 0)
            const endOfDay = new Date(date)
            endOfDay.setHours(23, 59, 59, 999)
            
            whereClause.scheduledAt = {
                gte: startOfDay,
                lt: endOfDay,
            }
        } else {
            // Default: only future meetings
            whereClause.scheduledAt = {
                gte: new Date(),
            }
        }

        const meetings = await prisma.meetingSession.findMany({
            where: whereClause,
            select: {
                id: true,
                scheduledAt: true,
                endTime: true,
                duration: true,
                title: true,
                type: true,
                team: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { scheduledAt: "asc" },
        })

        const scheduledTimes = meetings.map(meeting => ({
            id: meeting.id,
            scheduledAt: meeting.scheduledAt.toISOString(),
            endTime: meeting.endTime.toISOString(),
            duration: meeting.duration,
            title: meeting.title,
            type: meeting.type,
            teamName: meeting.team?.name,
        }))

        return NextResponse.json({ scheduledTimes })
    } catch (error) {
        console.error("[Scheduled Times API] Error:", error)
        return NextResponse.json(
            { error: "Failed to fetch scheduled times" },
            { status: 500 }
        )
    }
}
