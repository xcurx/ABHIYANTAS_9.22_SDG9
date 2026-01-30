import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getUserOrganizations } from "@/lib/actions/organization"
import { Navbar } from "@/components/layout/navbar"
import { getRecommendedHackathons } from "@/lib/actions/recommendation"
import { getUserSkills } from "@/lib/actions/skill"

// Static data for featured events
const featuredEvents = [
    {
        id: "1",
        title: "AI Innovation Challenge 2026",
        type: "hackathon",
        status: "Registration Open",
        statusColor: "bg-green-100 text-green-700",
        date: "Feb 15 - 17, 2026",
        participants: 1250,
        prizePool: "$50,000",
        image: "🤖",
        tags: ["AI/ML", "Innovation"],
    },
    {
        id: "2",
        title: "Web3 Builders Summit",
        type: "hackathon",
        status: "Starting Soon",
        statusColor: "bg-amber-100 text-amber-700",
        date: "Feb 20 - 22, 2026",
        participants: 890,
        prizePool: "$30,000",
        image: "🔗",
        tags: ["Blockchain", "Web3"],
    },
    {
        id: "3",
        title: "Algorithm Masters Weekly",
        type: "contest",
        status: "Live Now",
        statusColor: "bg-red-100 text-red-700 animate-pulse",
        date: "Every Saturday",
        participants: 2400,
        prizePool: "$5,000",
        image: "💻",
        tags: ["DSA", "Competitive"],
    },
]

// Static user stats
const userStats = {
    hackathonsParticipated: 3,
    contestsCompleted: 12,
    projectsSubmitted: 5,
    ranking: 156,
    totalPrizesWon: "$2,500",
    skillLevel: "Intermediate",
}

// Static participation history
const participationHistory = [
    {
        id: "1",
        name: "Green Tech Hackathon 2025",
        date: "Dec 2025",
        status: "Completed",
        position: "2nd Place 🥈",
        prize: "$2,000",
    },
    {
        id: "2",
        name: "Code Sprint #45",
        date: "Jan 2026",
        status: "Completed",
        position: "Top 10%",
        prize: "$500",
    },
    {
        id: "3",
        name: "Healthcare Innovation",
        date: "Jan 2026",
        status: "In Progress",
        position: "-",
        prize: "-",
    },
]

export default async function DashboardPage() {
    const session = await auth()
    
    if (!session) {
        redirect("/sign-in")
    }

    const orgsResult = await getUserOrganizations()
    const organizations = orgsResult.success ? orgsResult.organizations : []
    
    const canCreateHackathon = organizations?.some(org => ["OWNER", "ADMIN"].includes(org.role)) ?? false

    // Fetch recommendations and user skills
    const [recommendationsResult, skillsResult] = await Promise.all([
        getRecommendedHackathons(6),
        getUserSkills(session.user.id),
    ])
    
    const recommendations = recommendationsResult.recommendations
    const userSkills = skillsResult.success ? skillsResult.skills : []

    const signOutAction = async () => {
        "use server"
        await signOut({ redirectTo: "/sign-in" })
    }

    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

    return (
        <div className="min-h-screen bg-white">
            <Navbar user={session.user} signOutAction={signOutAction} />

            <main className="pt-28 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            <span className="text-gray-900">{greeting}, </span>
                            <span className="text-blue-600">{session.user.name?.split(" ")[0] || "there"}</span>
                            <span className="text-gray-900"> 👋</span>
                        </h1>
                        <p className="text-lg text-gray-600 mt-3 max-w-3xl mx-auto">
                            Welcome back to your ELEVATE dashboard. Track your hackathon participations, 
                            manage your organizations, and discover new opportunities to innovate.
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <Link
                                href="/hackathons"
                                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors border border-gray-200"
                            >
                                Explore Hackathons
                            </Link>
                            {canCreateHackathon && (
                                <Link
                                    href="/hackathons/new"
                                    className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                                >
                                    Create Hackathon
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12 max-w-6xl mx-auto">
                        <div className="text-center p-5 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{userStats.hackathonsParticipated}</div>
                            <div className="text-xs text-gray-500 mt-1">Hackathons Joined</div>
                        </div>
                        <div className="text-center p-5 bg-white rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all">
                            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
                                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{userStats.contestsCompleted}</div>
                            <div className="text-xs text-gray-500 mt-1">Contests Completed</div>
                        </div>
                        <div className="text-center p-5 bg-white rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all">
                            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{userStats.projectsSubmitted}</div>
                            <div className="text-xs text-gray-500 mt-1">Projects Submitted</div>
                        </div>
                        <div className="text-center p-5 bg-white rounded-2xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all">
                            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
                                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-amber-600">{userStats.totalPrizesWon}</div>
                            <div className="text-xs text-gray-500 mt-1">Total Prizes Won</div>
                        </div>
                        <div className="text-center p-5 bg-white rounded-2xl border border-gray-200 hover:border-rose-300 hover:shadow-md transition-all">
                            <div className="h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center mx-auto mb-3">
                                <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">#{userStats.ranking}</div>
                            <div className="text-xs text-gray-500 mt-1">Global Ranking</div>
                        </div>
                        <div className="text-center p-5 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{userStats.skillLevel}</div>
                            <div className="text-xs text-gray-500 mt-1">Skill Level</div>
                        </div>
                    </div>

                    {/* Recommended for You Section */}
                    {recommendations.length > 0 && (
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                                            <p className="text-gray-600 text-sm mt-0.5">
                                                {userSkills.length > 0 
                                                    ? `Based on your ${userSkills.slice(0, 3).map(s => s.name).join(", ")} skills`
                                                    : "Popular hackathons you might enjoy"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href="/hackathons"
                                    className="text-sm font-medium text-violet-600 hover:text-violet-500 flex items-center gap-1"
                                >
                                    View all
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            
                            {/* Add skills prompt if no skills */}
                            {userSkills.length === 0 && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-violet-800">Add skills to get personalized recommendations</p>
                                            <p className="text-xs text-violet-600 mt-0.5">Update your profile with your technical skills for better matches</p>
                                        </div>
                                        <Link
                                            href="/dashboard/profile"
                                            className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
                                        >
                                            Add Skills
                                        </Link>
                                    </div>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recommendations.map((hackathon) => (
                                    <Link
                                        key={hackathon.id}
                                        href={`/hackathons/${hackathon.slug}`}
                                        className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-violet-300 hover:shadow-lg transition-all relative"
                                    >
                                        {/* Match Score Badge */}
                                        {hackathon.matchScore > 0 && (
                                            <div className="absolute top-3 left-3 z-10">
                                                <span className="px-2.5 py-1 bg-violet-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                    </svg>
                                                    {hackathon.matchScore}% match
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="h-32 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center relative">
                                            {hackathon.thumbnail ? (
                                                <img src={hackathon.thumbnail} alt={hackathon.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-5xl group-hover:scale-110 transition-transform">🚀</span>
                                            )}
                                            <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full ${
                                                hackathon.status === "REGISTRATION_OPEN" 
                                                    ? "bg-green-100 text-green-700" 
                                                    : "bg-amber-100 text-amber-700"
                                            }`}>
                                                {hackathon.status === "REGISTRATION_OPEN" ? "Registration Open" : hackathon.status.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                {hackathon.matchedTags.slice(0, 2).map((tag) => (
                                                    <span key={tag} className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full font-medium">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {hackathon.tags.filter(t => !hackathon.matchedTags.includes(t.toLowerCase())).slice(0, 1).map((tag) => (
                                                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors line-clamp-1">
                                                {hackathon.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 mb-3">{hackathon.matchReason}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                <span className="flex items-center gap-1">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {new Date(hackathon.hackathonStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {hackathon.mode}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <span className="text-sm text-gray-600">
                                                    <span className="font-semibold text-gray-900">{hackathon._count.registrations}</span> registered
                                                </span>
                                                {hackathon.prizePool && (
                                                    <span className="text-sm font-bold text-green-600">${hackathon.prizePool.toLocaleString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Featured Events */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Featured Events</h2>
                                <p className="text-gray-600 mt-1">Don't miss these exciting opportunities</p>
                            </div>
                            <Link
                                href="/hackathons"
                                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                                View all →
                            </Link>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {featuredEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={event.type === "hackathon" ? "/hackathons" : "/coding-contests"}
                                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all"
                                >
                                    <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center relative">
                                        <span className="text-5xl group-hover:scale-110 transition-transform">{event.image}</span>
                                        <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full ${event.statusColor}`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {event.tags.map((tag) => (
                                                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                            <span className="flex items-center gap-1">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {event.date}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <span className="text-sm text-gray-600">
                                                <span className="font-semibold text-gray-900">{event.participants.toLocaleString()}</span> participants
                                            </span>
                                            <span className="text-sm font-bold text-green-600">{event.prizePool}</span>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions Row - Full Width */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link
                                href="/hackathons"
                                className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                            >
                                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900">Browse Hackathons</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Find events to join</p>
                                </div>
                            </Link>
                            <Link
                                href="/coding-contests"
                                className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
                            >
                                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900">Coding Contests</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Compete & improve</p>
                                </div>
                            </Link>
                            <Link
                                href="/organizations"
                                className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group"
                            >
                                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                    <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900">Organizations</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Teams & companies</p>
                                </div>
                            </Link>
                            <Link
                                href="/dashboard/profile"
                                className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
                            >
                                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900">My Profile</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Edit your details</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Main Content - Full Width Grid */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-12">
                        {/* My Organizations */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">My Organizations</h3>
                                <Link 
                                    href="/organizations" 
                                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    View all →
                                </Link>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Companies and teams you're a member of</p>
                            
                            {organizations && organizations.length > 0 ? (
                                <div className="grid gap-4">
                                    {organizations.slice(0, 3).map((org: any) => (
                                        <Link
                                            key={org.id}
                                            href={`/organizations/${org.slug}`}
                                            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                                        >
                                            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                {org.logo ? (
                                                    <img src={org.logo} alt={org.name} className="h-12 w-12 rounded-xl object-cover" />
                                                ) : (
                                                    <span className="text-lg font-bold text-white">
                                                        {org.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-gray-900 truncate">{org.name}</h4>
                                                <p className="text-sm text-gray-600 capitalize">{org.role.toLowerCase()}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">{org._count?.members || 0} members</span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">No organizations yet</h4>
                                    <p className="text-sm text-gray-500 mb-4">Join or create an organization</p>
                                    <Link
                                        href="/organizations/new"
                                        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                                    >
                                        Create Organization
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* My Participation */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">My Participation</h3>
                                <Link 
                                    href="/hackathons" 
                                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    Browse all →
                                </Link>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Your hackathon and contest history</p>
                            
                            {participationHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {participationHistory.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                item.status === "Completed" ? "bg-green-100" : "bg-blue-100"
                                            }`}>
                                                {item.status === "Completed" ? (
                                                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate text-sm">{item.name}</h4>
                                                <span className="text-xs text-gray-500">{item.date}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-gray-900">{item.position}</p>
                                                {item.prize !== "-" && (
                                                    <p className="text-xs text-green-600 font-medium">{item.prize}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">No participation yet</h4>
                                    <p className="text-sm text-gray-500 mb-4">Start by joining a hackathon!</p>
                                    <Link
                                        href="/hackathons"
                                        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                                    >
                                        Explore Hackathons
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Full Width Bottom Section */}
                    <div className="grid lg:grid-cols-3 gap-8 mb-12">
                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="h-20 bg-blue-600"></div>
                            <div className="px-6 pb-6 -mt-10">
                                <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white flex items-center justify-center overflow-hidden shadow-sm">
                                    {session.user.avatar ? (
                                        <img
                                            src={session.user.avatar}
                                            alt="Avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-blue-600 flex items-center justify-center">
                                            <span className="text-2xl font-semibold text-white">
                                                {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {session.user.name || "User"}
                                    </h2>
                                    <p className="text-gray-600 text-sm mt-1">{session.user.email}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                            {session.user.role?.replace("_", " ")}
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                            ✓ Verified
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Link
                                        href="/dashboard/profile"
                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                                    >
                                        Edit Profile
                                    </Link>
                                    <Link
                                        href="/dashboard/settings"
                                        className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                                    <span className="text-lg">🏆</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">You won 2nd place!</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Green Tech Hackathon 2025</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                                    <span className="text-lg">📝</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">Registered for Healthcare Innovation</p>
                                        <p className="text-xs text-gray-500 mt-0.5">5 days ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                                    <span className="text-lg">✅</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">Account verified</p>
                                        <p className="text-xs text-gray-500 mt-0.5">1 week ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills & Badges */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Badges</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Top Skills</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">React</span>
                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Node.js</span>
                                        <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Python</span>
                                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">ML</span>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-gray-100">
                                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Badges</h4>
                                    <div className="flex gap-2">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg shadow-sm">🥈</div>
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg shadow-sm">🚀</div>
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-lg shadow-sm">💻</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Panels - Full Width */}
                    {(session.user.role === "SUPER_ADMIN" || session.user.role === "ORGANIZATION_ADMIN") && (
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Organizer Panel */}
                            <div className="bg-blue-600 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white text-lg">Organizer Dashboard</h3>
                                        <p className="text-blue-100 text-sm mt-1">
                                            Create and manage hackathons, review submissions, and track engagement.
                                        </p>
                                        <Link
                                            href="/organizer"
                                            className="inline-flex items-center gap-2 mt-4 rounded-full bg-white px-5 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                            Go to Organizer Panel →
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Panel */}
                            {session.user.role === "SUPER_ADMIN" && (
                                <div className="bg-rose-600 rounded-2xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white text-lg">Platform Administration</h3>
                                            <p className="text-rose-100 text-sm mt-1">
                                                User moderation, organization verification, and system configuration.
                                            </p>
                                            <Link
                                                href="/admin"
                                                className="inline-flex items-center gap-2 mt-4 rounded-full bg-white px-5 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                            >
                                                Go to Admin Panel →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
