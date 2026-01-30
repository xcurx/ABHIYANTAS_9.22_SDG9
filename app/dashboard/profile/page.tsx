import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ProfileForm from "./profile-form"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Settings, Shield, Award, Calendar, MapPin, Mail, ExternalLink } from "lucide-react"

export default async function ProfilePage() {
    const session = await auth()
    
    if (!session) {
        redirect("/sign-in")
    }

    // Fetch full user data from database
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            createdAt: true,
        },
    })

    if (!user) {
        redirect("/sign-in")
    }

    // Mock data for enhanced profile (since we're not touching backend)
    const mockProfileData = {
        bio: "Passionate developer with a love for building innovative solutions. Always eager to learn new technologies and collaborate on exciting projects.",
        location: "San Francisco, CA",
        skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "GraphQL", "PostgreSQL"],
        github: "github.com/johndoe",
        linkedin: "linkedin.com/in/johndoe",
        twitter: "twitter.com/johndoe",
        portfolio: "johndoe.dev",
        hackathonsParticipated: 12,
        hackathonsWon: 3,
        projectsBuilt: 28,
        badges: [
            { name: "First Hackathon", icon: "🎉", color: "bg-green-100 text-green-700" },
            { name: "Winner", icon: "🏆", color: "bg-yellow-100 text-yellow-700" },
            { name: "Team Player", icon: "🤝", color: "bg-blue-100 text-blue-700" },
            { name: "Early Adopter", icon: "🚀", color: "bg-purple-100 text-purple-700" },
        ],
        recentActivity: [
            { type: "hackathon", name: "AI Innovation Challenge 2026", date: "2 days ago", status: "Registered" },
            { type: "project", name: "EcoTrack - Carbon Footprint App", date: "1 week ago", status: "Submitted" },
            { type: "achievement", name: "Earned 'Problem Solver' badge", date: "2 weeks ago", status: "Completed" },
        ],
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Cover */}
            <div className="relative">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                                </pattern>
                            </defs>
                            <rect width="100" height="100" fill="url(#grid)"/>
                        </svg>
                    </div>
                </div>
                
                {/* Profile Header Card */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative -mt-24">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Avatar Section */}
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        <div className="h-32 w-32 rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt="Avatar"
                                                    className="h-32 w-32 object-cover"
                                                />
                                            ) : (
                                                <span className="text-5xl font-bold text-blue-600">
                                                    {user.name?.charAt(0) || user.email.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-green-500 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center">
                                            <span className="text-white text-xs">✓</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div>
                                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                                {user.name || "Anonymous User"}
                                            </h1>
                                            <p className="text-gray-500 mt-1 flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                {user.email}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                                    <Shield className="h-3.5 w-3.5 mr-1.5" />
                                                    {user.role}
                                                </span>
                                                <span className="text-gray-400 flex items-center gap-1.5 text-sm">
                                                    <MapPin className="h-4 w-4" />
                                                    {mockProfileData.location}
                                                </span>
                                                <span className="text-gray-400 flex items-center gap-1.5 text-sm">
                                                    <Calendar className="h-4 w-4" />
                                                    Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <Link
                                                href="/dashboard/settings"
                                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Settings className="h-4 w-4" />
                                                Settings
                                            </Link>
                                        </div>
                                    </div>
                                    
                                    {/* Bio */}
                                    <p className="mt-4 text-gray-600 leading-relaxed">
                                        {mockProfileData.bio}
                                    </p>
                                    
                                    {/* Social Links */}
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        {mockProfileData.github && (
                                            <a href={`https://${mockProfileData.github}`} target="_blank" rel="noopener noreferrer" 
                                               className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                                GitHub
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                        {mockProfileData.linkedin && (
                                            <a href={`https://${mockProfileData.linkedin}`} target="_blank" rel="noopener noreferrer"
                                               className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                                LinkedIn
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                        {mockProfileData.twitter && (
                                            <a href={`https://${mockProfileData.twitter}`} target="_blank" rel="noopener noreferrer"
                                               className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                                Twitter
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                        {mockProfileData.portfolio && (
                                            <a href={`https://${mockProfileData.portfolio}`} target="_blank" rel="noopener noreferrer"
                                               className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                                                Portfolio
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Row - Full Width */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{mockProfileData.hackathonsParticipated}</div>
                        <div className="text-xs text-gray-500 mt-1">Hackathons</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{mockProfileData.hackathonsWon}</div>
                        <div className="text-xs text-gray-500 mt-1">Wins</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{mockProfileData.projectsBuilt}</div>
                        <div className="text-xs text-gray-500 mt-1">Projects</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center col-span-3 md:col-span-3">
                        <div className="flex items-center justify-center gap-3">
                            {mockProfileData.badges.map((badge, index) => (
                                <div key={index} className={`${badge.color} rounded-lg p-2 text-center`}>
                                    <span className="text-xl">{badge.icon}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">Badges Earned</div>
                    </div>
                </div>

                {/* Skills Section - Full Width */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <h3 className="font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                        {mockProfileData.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-default"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Main Grid - Full Width */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Edit Profile Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-900 mb-6">Edit Profile</h3>
                        <ProfileForm user={user} mockData={mockProfileData} />
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {mockProfileData.recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                    <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${
                                        activity.type === "hackathon" ? "bg-blue-100 text-blue-600" :
                                        activity.type === "project" ? "bg-green-100 text-green-600" :
                                        "bg-yellow-100 text-yellow-600"
                                    }`}>
                                        {activity.type === "hackathon" ? "🏆" : 
                                         activity.type === "project" ? "📁" : "🎖️"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900">{activity.name}</p>
                                        <p className="text-sm text-gray-500 mt-1">{activity.date}</p>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                        activity.status === "Registered" ? "bg-blue-100 text-blue-700" :
                                        activity.status === "Submitted" ? "bg-green-100 text-green-700" :
                                        "bg-yellow-100 text-yellow-700"
                                    }`}>
                                        {activity.status}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* More Activity Items */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h4 className="font-medium text-gray-900 mb-4">Participation History</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">Green Tech Hackathon 2025</p>
                                        <p className="text-xs text-gray-500">Dec 2025 • 2nd Place 🥈</p>
                                    </div>
                                    <span className="text-sm font-semibold text-green-600">$2,000</span>
                                </div>
                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">Code Sprint #45</p>
                                        <p className="text-xs text-gray-500">Jan 2026 • Top 10%</p>
                                    </div>
                                    <span className="text-sm font-semibold text-green-600">$500</span>
                                </div>
                                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">Healthcare Innovation</p>
                                        <p className="text-xs text-gray-500">Jan 2026 • In Progress</p>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
