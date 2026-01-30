import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getUserOrganizations } from "@/lib/actions/organization"
import { Navbar } from "@/components/layout/navbar"

export default async function DashboardPage() {
    const session = await auth()
    
    if (!session) {
        redirect("/sign-in")
    }

    const orgsResult = await getUserOrganizations()
    const organizations = orgsResult.success ? orgsResult.organizations : []
    
    const canCreateHackathon = organizations?.some(org => ["OWNER", "ADMIN"].includes(org.role)) ?? false

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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 max-w-5xl mx-auto">
                        <div className="text-center p-6 bg-white rounded-2xl border border-gray-200">
                            <div className="text-3xl md:text-4xl font-bold text-gray-900">0</div>
                            <div className="text-sm text-gray-600 mt-1">Active Hackathons</div>
                            <p className="text-xs text-gray-400 mt-2">Events you're participating in</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl border border-gray-200">
                            <div className="text-3xl md:text-4xl font-bold text-gray-900">0</div>
                            <div className="text-sm text-gray-600 mt-1">Coding Contests</div>
                            <p className="text-xs text-gray-400 mt-2">Competitive programming challenges</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl border border-gray-200">
                            <div className="text-3xl md:text-4xl font-bold text-gray-900">{organizations?.length || 0}</div>
                            <div className="text-sm text-gray-600 mt-1">Organizations</div>
                            <p className="text-xs text-gray-400 mt-2">Teams & companies you belong to</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl border border-gray-200">
                            <div className="text-3xl md:text-4xl font-bold text-gray-900">0</div>
                            <div className="text-sm text-gray-600 mt-1">Achievements</div>
                            <p className="text-xs text-gray-400 mt-2">Badges & awards earned</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="h-24 bg-blue-600"></div>
                                <div className="px-6 pb-6 -mt-12">
                                    <div className="h-24 w-24 rounded-2xl bg-white border-4 border-white flex items-center justify-center overflow-hidden shadow-sm">
                                        {session.user.avatar ? (
                                            <img
                                                src={session.user.avatar}
                                                alt="Avatar"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-blue-600 flex items-center justify-center">
                                                <span className="text-3xl font-semibold text-white">
                                                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {session.user.name || "User"}
                                        </h2>
                                        <p className="text-gray-600 mt-1">{session.user.email}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                                {session.user.role?.replace("_", " ")}
                                            </span>
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                ✓ Verified
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-4">
                                            Member since January 2026. Ready to build amazing things with the community.
                                        </p>
                                    </div>
                                    <div className="mt-6 flex gap-3">
                                        <Link
                                            href="/dashboard/profile"
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit Profile
                                        </Link>
                                        <Link
                                            href="/dashboard/settings"
                                            className="inline-flex items-center justify-center rounded-full bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
                                <p className="text-sm text-gray-500 mb-4">Navigate to your most used features</p>
                                <div className="space-y-2">
                                    <Link
                                        href="/hackathons"
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Browse Hackathons</p>
                                            <p className="text-xs text-gray-500">Find events to participate in</p>
                                        </div>
                                        <svg className="h-5 w-5 text-gray-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                    <Link
                                        href="/coding-contests"
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Coding Contests</p>
                                            <p className="text-xs text-gray-500">Compete in programming challenges</p>
                                        </div>
                                        <svg className="h-5 w-5 text-gray-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                    <Link
                                        href="/organizations"
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-orange-50 transition-colors group"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                            <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Organizations</p>
                                            <p className="text-xs text-gray-500">Manage teams & companies</p>
                                        </div>
                                        <svg className="h-5 w-5 text-gray-300 group-hover:text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                    <Link
                                        href="/dashboard/submissions"
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-green-50 transition-colors group"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">My Submissions</p>
                                            <p className="text-xs text-gray-500">View your project submissions</p>
                                        </div>
                                        <svg className="h-5 w-5 text-gray-300 group-hover:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-2 space-y-6">
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
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {organizations.slice(0, 4).map((org: any) => (
                                            <Link
                                                key={org.id}
                                                href={`/organizations/${org.slug}`}
                                                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                                            >
                                                <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    {org.logo ? (
                                                        <img src={org.logo} alt={org.name} className="h-14 w-14 rounded-xl object-cover" />
                                                    ) : (
                                                        <span className="text-xl font-bold text-white">
                                                            {org.name.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-semibold text-gray-900 truncate">{org.name}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="capitalize">{org.role.toLowerCase()}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {org._count?.members || 0} members • {org._count?.hackathons || 0} hackathons
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <h4 className="font-medium text-gray-900 mb-1">No organizations yet</h4>
                                        <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                                            Join an existing organization or create your own to start hosting and participating in hackathons.
                                        </p>
                                        <div className="flex items-center justify-center gap-3">
                                            <Link
                                                href="/organizations"
                                                className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Browse Organizations
                                            </Link>
                                            <Link
                                                href="/organizations/new"
                                                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                                            >
                                                Create Organization
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Upcoming Events */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                                    <Link 
                                        href="/hackathons" 
                                        className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                                    >
                                        Browse all →
                                    </Link>
                                </div>
                                <p className="text-sm text-gray-500 mb-6">Hackathons and contests you've registered for</p>
                                
                                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">No upcoming events</h4>
                                    <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                                        You haven't registered for any hackathons yet. Explore available events and start your innovation journey!
                                    </p>
                                    <Link
                                        href="/hackathons"
                                        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Explore Hackathons
                                    </Link>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-6">Your latest actions and updates</p>
                                
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Account created successfully</p>
                                            <p className="text-xs text-gray-500 mt-1">Welcome to ELEVATE! Start by exploring hackathons or joining an organization.</p>
                                            <p className="text-xs text-gray-400 mt-2">Just now</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Organizer Panel */}
                            {(session.user.role === "SUPER_ADMIN" || session.user.role === "ORGANIZATION_ADMIN") && (
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
                                                As an organization admin, you can create and manage hackathons, review submissions, 
                                                configure judging criteria, and track participant engagement.
                                            </p>
                                            <Link
                                                href="/organizer"
                                                className="inline-flex items-center gap-2 mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                Go to Organizer Panel →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                                Full access to platform management including user moderation, organization verification, 
                                                system configuration, and analytics dashboard.
                                            </p>
                                            <Link
                                                href="/admin"
                                                className="inline-flex items-center gap-2 mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                            >
                                                Go to Admin Panel →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
