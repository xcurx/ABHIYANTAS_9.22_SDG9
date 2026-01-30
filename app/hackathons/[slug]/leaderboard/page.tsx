import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import {
    ArrowLeft,
    Trophy,
    Medal,
    Users,
    Star,
    TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderboardPageProps {
    params: Promise<{ slug: string }>
}

export default async function LeaderboardPage({ params }: LeaderboardPageProps) {
    const { slug } = await params
    const session = await auth()

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        include: {
            stages: {
                where: { type: { in: ["EVALUATION", "PRESENTATION"] } },
                orderBy: { order: "asc" },
            },
            teams: {
                include: {
                    leader: { select: { name: true } },
                    members: {
                        include: { user: { select: { name: true } } },
                    },
                    submissions: {
                        where: { score: { not: null } },
                        include: { stage: true },
                    },
                },
            },
        },
    })

    if (!hackathon) {
        notFound()
    }

    // Calculate total scores for each team
    const teamScores = hackathon.teams.map((team) => {
        const totalScore = team.submissions.reduce((sum, sub) => sum + (sub.score || 0), 0)
        const avgScore = team.submissions.length > 0 
            ? totalScore / team.submissions.length 
            : 0
        
        return {
            id: team.id,
            name: team.name,
            leader: team.leader.name,
            memberCount: team.members.length,
            totalScore,
            avgScore: Math.round(avgScore * 10) / 10,
            submissionCount: team.submissions.length,
            stageScores: team.submissions.map(sub => ({
                stageName: sub.stage.name,
                score: sub.score,
            })),
        }
    })

    // Sort by average score (or total score)
    teamScores.sort((a, b) => b.avgScore - a.avgScore)

    // Add ranks
    const rankedTeams = teamScores.map((team, index) => ({
        ...team,
        rank: index + 1,
    }))

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/hackathons/${slug}`}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to {hackathon.title}
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-xl">
                            <Trophy className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
                            <p className="text-gray-600">{hackathon.title}</p>
                        </div>
                    </div>
                </div>

                {/* Top 3 Podium */}
                {rankedTeams.length >= 3 && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {/* 2nd Place */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6 text-center mt-8">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Medal className="h-8 w-8 text-gray-500" />
                            </div>
                            <div className="text-2xl font-bold text-gray-400">2nd</div>
                            <div className="font-semibold text-gray-900 mt-2">{rankedTeams[1]?.name}</div>
                            <div className="text-lg font-bold text-gray-700 mt-1">
                                {rankedTeams[1]?.avgScore} pts
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="bg-gradient-to-b from-yellow-50 to-amber-100 rounded-2xl shadow-lg border-2 border-yellow-300 p-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                                <Trophy className="h-10 w-10 text-white" />
                            </div>
                            <div className="text-3xl font-bold text-yellow-600">1st</div>
                            <div className="font-bold text-gray-900 text-lg mt-2">{rankedTeams[0]?.name}</div>
                            <div className="text-xl font-bold text-yellow-700 mt-1">
                                {rankedTeams[0]?.avgScore} pts
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6 text-center mt-12">
                            <div className="w-14 h-14 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Medal className="h-7 w-7 text-orange-600" />
                            </div>
                            <div className="text-xl font-bold text-orange-500">3rd</div>
                            <div className="font-semibold text-gray-900 mt-2">{rankedTeams[2]?.name}</div>
                            <div className="text-lg font-bold text-gray-700 mt-1">
                                {rankedTeams[2]?.avgScore} pts
                            </div>
                        </div>
                    </div>
                )}

                {/* Full Leaderboard Table */}
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            All Teams
                        </h2>
                    </div>
                    
                    {rankedTeams.length === 0 ? (
                        <div className="p-12 text-center">
                            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">No scores yet</h3>
                            <p className="text-gray-600 mt-2">Teams will appear here once they receive scores.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {rankedTeams.map((team) => (
                                <div 
                                    key={team.id}
                                    className={cn(
                                        "flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors",
                                        team.rank === 1 && "bg-yellow-50",
                                        team.rank === 2 && "bg-gray-50",
                                        team.rank === 3 && "bg-orange-50"
                                    )}
                                >
                                    {/* Rank */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                                        team.rank === 1 && "bg-yellow-400 text-white",
                                        team.rank === 2 && "bg-gray-300 text-gray-700",
                                        team.rank === 3 && "bg-orange-400 text-white",
                                        team.rank > 3 && "bg-gray-100 text-gray-600"
                                    )}>
                                        {team.rank}
                                    </div>

                                    {/* Team Info */}
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">{team.name}</div>
                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                            <Users className="h-3 w-3" />
                                            {team.memberCount} members • Led by {team.leader}
                                        </div>
                                    </div>

                                    {/* Stage Scores */}
                                    <div className="hidden md:flex items-center gap-2">
                                        {team.stageScores.slice(0, 3).map((stage, idx) => (
                                            <div 
                                                key={idx}
                                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                                                title={stage.stageName}
                                            >
                                                {stage.score}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Average Score */}
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-xl font-bold text-gray-900">
                                                {team.avgScore}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {team.submissionCount} submission{team.submissionCount !== 1 ? "s" : ""}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stages Legend */}
                {hackathon.stages.length > 0 && (
                    <div className="mt-6 bg-white rounded-2xl shadow-sm border p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Evaluation Stages</h3>
                        <div className="flex flex-wrap gap-2">
                            {hackathon.stages.map((stage) => (
                                <span 
                                    key={stage.id}
                                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm"
                                >
                                    {stage.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
