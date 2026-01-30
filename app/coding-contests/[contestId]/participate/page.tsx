import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { getCodingContestBySlug } from "@/lib/actions/coding-contest"
import { getContestQuestions } from "@/lib/actions/coding-question"
import prisma from "@/lib/prisma"
import ParticipateClient from "./participate-client"

export default async function ParticipatePage({
    params,
}: {
    params: Promise<{ contestId: string }>
}) {
    const session = await auth()
    const { contestId } = await params

    if (!session) {
        redirect(`/sign-in?callbackUrl=/coding-contests/${contestId}/participate`)
    }

    const contest = await getCodingContestBySlug(contestId)

    if (!contest) {
        notFound()
    }

    // Check if contest is live (by time, not just status)
    const now = new Date()
    const isLive = now >= new Date(contest.startTime) && now <= new Date(contest.endTime)
    
    if (!isLive && contest.status !== "LIVE") {
        redirect(`/coding-contests/${contest.slug}`)
    }
    
    // Update contest status to LIVE if it should be
    if (isLive && contest.status !== "LIVE") {
        await prisma.codingContest.update({
            where: { id: contest.id },
            data: { status: "LIVE" },
        })
    }

    // Check if user is registered
    const participant = await prisma.contestParticipant.findUnique({
        where: {
            contestId_userId: {
                contestId: contest.id,
                userId: session.user.id!,
            }
        },
        include: {
            submissions: true,
        }
    })

    if (!participant) {
        redirect(`/coding-contests/${contest.slug}?error=not-registered`)
    }

    if (participant.status === "DISQUALIFIED") {
        redirect(`/coding-contests/${contest.slug}?error=disqualified`)
    }

    if (participant.status === "SUBMITTED") {
        redirect(`/coding-contests/${contest.slug}/results`)
    }

    // Get questions
    const questions = await getContestQuestions(contest.id)

    // Get existing submissions
    const existingSubmissions = await prisma.questionSubmission.findMany({
        where: {
            participantId: participant.id,
        },
        include: {
            testResults: true,
        }
    })

    return (
        <ParticipateClient
            contest={{
                id: contest.id,
                title: contest.title,
                slug: contest.slug,
                duration: contest.duration,
                startTime: contest.startTime,
                endTime: contest.endTime,
                enableProctoring: contest.proctorEnabled,
                enableTabSwitchDetection: contest.proctorEnabled,
                maxTabSwitches: contest.tabSwitchLimit,
                enableCopyPasteDetection: contest.copyPasteDisabled,
                enableFullscreenMode: contest.fullScreenRequired,
                shuffleQuestions: contest.shuffleQuestions,
                showLeaderboardDuringContest: contest.showScoresDuring,
            }}
            participant={{
                id: participant.id,
                startedAt: participant.startedAt,
                tabSwitchCount: participant.tabSwitchCount,
            }}
            questions={questions.map(q => {
                // Parse MCQ options - stored as [{id, text, isCorrect}]
                // Pass id and text (not isCorrect to hide correct answer from client)
                let mcqOptions: { id: string; text: string }[] | null = null
                if (q.type === "MCQ" && q.options) {
                    const opts = q.options as { id: string; text: string; isCorrect: boolean }[]
                    mcqOptions = opts.map(opt => ({ id: opt.id, text: opt.text }))
                }
                
                return {
                    id: q.id,
                    title: q.title,
                    description: q.description,
                    type: q.type as "MCQ" | "CODING",
                    difficulty: q.difficulty as "EASY" | "MEDIUM" | "HARD",
                    points: q.points,
                    order: q.order,
                    mcqOptions,
                    allowedLanguages: (q.starterCode ? Object.keys(q.starterCode as Record<string, string>) : null),
                    starterCode: q.starterCode as Record<string, string> | null,
                    timeLimit: q.timeLimit,
                    memoryLimit: q.memoryLimit,
                    testCases: q.testCases?.filter(tc => !tc.isHidden).map(tc => ({
                        id: tc.id,
                        input: tc.input,
                        expectedOutput: tc.output,
                    })) || [],
                }
            })}
            existingSubmissions={existingSubmissions.map((s) => ({
                questionId: s.questionId,
                code: s.code,
                language: s.language,
                mcqAnswer: s.selectedOptions.length > 0 ? s.selectedOptions[0] : null, // Use option ID directly
                score: s.score,
                isCorrect: s.isCorrect,
            }))}
            userId={session.user.id!}
        />
    )
}
