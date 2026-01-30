import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCodingContestBySlug, getContestLeaderboard } from "@/lib/actions/coding-contest"
import { Trophy, Users, Target, ArrowLeft, Medal } from "lucide-react"

export default async function LeaderboardPage({
    params,
}: {
    params: Promise<{ contestId: string }>
}) {
    const session = await auth()
    const { contestId } = await params

    const contest = await getCodingContestBySlug(contestId)

    if (!contest) {
        notFound()
    }

    // Check if leaderboard should be visible
    const isLive = contest.status === "LIVE"
    const isEnded = contest.status === "ENDED"
    const canViewLeaderboard = isEnded || (isLive && contest.showScoresDuring)

    if (!canViewLeaderboard) {
        redirect(`/coding-contests/${contest.slug}`)
    }

    const leaderboard = await getContestLeaderboard(contest.id)

    // Find current user's rank
    const currentUserRank = session?.user?.id
        ? leaderboard.findIndex(p => p.user.id === session.user.id) + 1
        : null

    const maxScore = contest.questions.reduce((sum, q) => sum + q.points, 0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-blue-600 text-white sticky top-0 z-50">
                <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
                    <Link href={`/coding-contests/${contest.slug}`} className="text-blue-200 hover:text-white text-sm mb-2 inline-flex items-center gap-1 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Contest
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Trophy className="w-6 h-6" />
                                Leaderboard
                            </h1>
                            <p className="text-blue-200">{contest.title}</p>
                        </div>
                        {isLive && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30">
                                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                                <span className="text-red-100 text-sm">Live</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{leaderboard.length}</p>
                        <p className="text-sm text-gray-500">Participants</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Target className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{maxScore}</p>
                        <p className="text-sm text-gray-500">Max Score</p>
                    </div>
                    {currentUserRank && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Medal className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-3xl font-bold text-blue-600">#{currentUserRank}</p>
                            <p className="text-sm text-gray-500">Your Rank</p>
                        </div>
                    )}
                </div>

                {/* Top 3 Podium */}
                {leaderboard.length >= 3 && (
                    <div className="flex items-end justify-center gap-4 mb-12">
                        {/* 2nd Place */}
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gray-100 border-4 border-gray-300 flex items-center justify-center text-3xl">
                                🥈
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 w-36">
                                <p className="font-semibold text-gray-900 truncate">{leaderboard[1].user.name}</p>
                                <p className="text-2xl font-bold text-gray-700">{leaderboard[1].totalScore}</p>
                                <p className="text-xs text-gray-500">points</p>
                            </div>
                            <div className="h-24 bg-gray-200 rounded-t-lg mt-2"></div>
                        </div>

                        {/* 1st Place */}
                        <div className="text-center -mt-8">
                            <div className="w-24 h-24 mx-auto mb-2 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center text-4xl animate-pulse">
                                🥇
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-40">
                                <p className="font-semibold text-gray-900 truncate">{leaderboard[0].user.name}</p>
                                <p className="text-3xl font-bold text-amber-600">{leaderboard[0].totalScore}</p>
                                <p className="text-xs text-gray-500">points</p>
                            </div>
                            <div className="h-32 bg-amber-200 rounded-t-lg mt-2"></div>
                        </div>

                        {/* 3rd Place */}
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-orange-100 border-4 border-orange-300 flex items-center justify-center text-3xl">
                                🥉
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 w-36">
                                <p className="font-semibold text-gray-900 truncate">{leaderboard[2].user.name}</p>
                                <p className="text-2xl font-bold text-orange-600">{leaderboard[2].totalScore}</p>
                                <p className="text-xs text-gray-500">points</p>
                            </div>
                            <div className="h-16 bg-orange-200 rounded-t-lg mt-2"></div>
                        </div>
                    </div>
                )}

                {/* Full Leaderboard Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Rank</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Participant</th>
                                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Score</th>
                                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Questions Solved</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leaderboard.map((participant, index) => {
                                const isCurrentUser = session?.user?.id === participant.user.id
                                const rank = index + 1
                                
                                return (
                                    <tr
                                        key={participant.id}
                                        className={`${isCurrentUser ? "bg-blue-50" : "hover:bg-gray-50"} transition-colors`}
                                    >
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                                rank === 1
                                                    ? "bg-amber-100 text-amber-600"
                                                    : rank === 2
                                                    ? "bg-gray-100 text-gray-600"
                                                    : rank === 3
                                                    ? "bg-orange-100 text-orange-600"
                                                    : "bg-gray-100 text-gray-500"
                                            }`}>
                                                {rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                                    {participant.user.name?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {participant.user.name}
                                                        {isCurrentUser && (
                                                            <span className="ml-2 text-xs text-blue-600">(You)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500">@{participant.user.email?.split("@")[0]}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xl font-bold text-gray-900">{participant.totalScore}</span>
                                            <span className="text-sm text-gray-400">/{maxScore}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-gray-900">{participant.questionsAttempted}</span>
                                            <span className="text-gray-400">/{contest.questions.length}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500 text-sm">
                                            {participant.submittedAt
                                                ? new Date(participant.submittedAt).toLocaleTimeString()
                                                : participant.status === "IN_PROGRESS"
                                                ? "In Progress"
                                                : "-"
                                            }
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    {leaderboard.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No participants yet</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
