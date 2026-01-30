import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCodingContestById, getContestLeaderboard } from "@/lib/actions/coding-contest"

export default async function LeaderboardPage({
    params,
}: {
    params: Promise<{ contestId: string }>
}) {
    const session = await auth()
    const { contestId } = await params

    const contest = await getCodingContestById(contestId)

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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
                <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
                    <Link href={`/coding-contests/${contest.slug}`} className="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Contest
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">🏆 Leaderboard</h1>
                            <p className="text-gray-400">{contest.title}</p>
                        </div>
                        {isLive && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                <span className="text-red-400 text-sm">Live</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-white">{leaderboard.length}</p>
                        <p className="text-sm text-gray-400">Participants</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-white">{maxScore}</p>
                        <p className="text-sm text-gray-400">Max Score</p>
                    </div>
                    {currentUserRank && (
                        <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-purple-400">#{currentUserRank}</p>
                            <p className="text-sm text-gray-400">Your Rank</p>
                        </div>
                    )}
                </div>

                {/* Top 3 Podium */}
                {leaderboard.length >= 3 && (
                    <div className="flex items-end justify-center gap-4 mb-12">
                        {/* 2nd Place */}
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-3xl">
                                🥈
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 w-36">
                                <p className="font-semibold text-white truncate">{leaderboard[1].user.name}</p>
                                <p className="text-2xl font-bold text-gray-300">{leaderboard[1].totalScore}</p>
                                <p className="text-xs text-gray-500">points</p>
                            </div>
                            <div className="h-24 bg-gradient-to-t from-gray-700 to-gray-600 rounded-t-lg mt-2"></div>
                        </div>

                        {/* 1st Place */}
                        <div className="text-center -mt-8">
                            <div className="w-24 h-24 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-4xl animate-pulse">
                                🥇
                            </div>
                            <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 w-40">
                                <p className="font-semibold text-white truncate">{leaderboard[0].user.name}</p>
                                <p className="text-3xl font-bold text-yellow-400">{leaderboard[0].totalScore}</p>
                                <p className="text-xs text-gray-400">points</p>
                            </div>
                            <div className="h-32 bg-gradient-to-t from-yellow-700 to-yellow-600 rounded-t-lg mt-2"></div>
                        </div>

                        {/* 3rd Place */}
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center text-3xl">
                                🥉
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 w-36">
                                <p className="font-semibold text-white truncate">{leaderboard[2].user.name}</p>
                                <p className="text-2xl font-bold text-orange-400">{leaderboard[2].totalScore}</p>
                                <p className="text-xs text-gray-500">points</p>
                            </div>
                            <div className="h-16 bg-gradient-to-t from-orange-800 to-orange-700 rounded-t-lg mt-2"></div>
                        </div>
                    </div>
                )}

                {/* Full Leaderboard Table */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Rank</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Participant</th>
                                <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Score</th>
                                <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Questions Solved</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {leaderboard.map((participant, index) => {
                                const isCurrentUser = session?.user?.id === participant.user.id
                                const rank = index + 1
                                
                                return (
                                    <tr
                                        key={participant.id}
                                        className={`${isCurrentUser ? "bg-purple-600/10" : "hover:bg-white/5"} transition-colors`}
                                    >
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                                rank === 1
                                                    ? "bg-yellow-600/30 text-yellow-400"
                                                    : rank === 2
                                                    ? "bg-gray-600/30 text-gray-300"
                                                    : rank === 3
                                                    ? "bg-orange-600/30 text-orange-400"
                                                    : "bg-white/10 text-gray-400"
                                            }`}>
                                                {rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-medium">
                                                    {participant.user.name?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {participant.user.name}
                                                        {isCurrentUser && (
                                                            <span className="ml-2 text-xs text-purple-400">(You)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500">@{participant.user.email?.split("@")[0]}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xl font-bold text-white">{participant.totalScore}</span>
                                            <span className="text-sm text-gray-500">/{maxScore}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-white">{participant.questionsAttempted}</span>
                                            <span className="text-gray-500">/{contest.questions.length}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-400 text-sm">
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
                            <p className="text-gray-400">No participants yet</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
