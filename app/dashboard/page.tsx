import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getUserOrganizations } from "@/lib/actions/organization"

export default async function DashboardPage() {
    const session = await auth()
    
    if (!session) {
        redirect("/sign-in")
    }

    const orgsResult = await getUserOrganizations()
    const organizations = orgsResult.success ? orgsResult.organizations : []
    
    const canCreateHackathon = organizations?.some(org => ["OWNER", "ADMIN"].includes(org.role)) ?? false

    return (
        <div className="min-h-screen pattern-bg">
            {/* Premium Header */}
            <header className="relative overflow-hidden border-b border-slate-200/60">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-100/40 via-violet-100/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                
                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
                                <p className="text-slate-500 text-sm">Welcome back, {session.user.name?.split(' ')[0] || 'there'}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/profile"
                                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/80 border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-300"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                                    {session.user.avatar ? (
                                        <img src={session.user.avatar} alt="Avatar" className="w-8 h-8 rounded-lg object-cover" />
                                    ) : (
                                        <span className="text-sm font-bold text-white">
                                            {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-slate-700 hidden sm:block">Profile</span>
                            </Link>
                            
                            <form action={async () => { "use server"; await signOut({ redirectTo: "/sign-in" }) }}>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                                >
                                    Sign out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* User Profile Card */}
                <div className="glass-card rounded-3xl p-6 mb-8 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                {session.user.avatar ? (
                                    <img src={session.user.avatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-white">
                                        {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                                    </span>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-800">{session.user.name || "User"}</h2>
                            <p className="text-slate-500">{session.user.email}</p>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 border border-indigo-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    {session.user.role?.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/profile"
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Edit Profile
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <h3 className="text-lg font-bold text-slate-800 mb-5">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                    {/* Coding Contests */}
                    <Link
                        href="/coding-contests"
                        className="glass-card rounded-2xl p-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 mb-1">Coding Contests</h4>
                                <p className="text-sm text-slate-500">Compete in live coding challenges</p>
                            </div>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>

                    {/* Hackathons */}
                    <Link
                        href="/hackathons"
                        className="glass-card rounded-2xl p-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 mb-1">Hackathons</h4>
                                <p className="text-sm text-slate-500">Build innovative projects</p>
                            </div>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>

                    {/* Create Contest - shown to admins */}
                    {canCreateHackathon && (
                        <Link
                            href="/coding-contests/new"
                            className="glass-card rounded-2xl p-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-dashed border-indigo-200 hover:border-indigo-400"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 mb-1">Create Contest</h4>
                                    <p className="text-sm text-slate-500">Host a coding competition</p>
                                </div>
                                <svg className="w-5 h-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    )}

                    {/* Organizations */}
                    <Link
                        href="/organizations"
                        className="glass-card rounded-2xl p-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 mb-1">Organizations</h4>
                                <p className="text-sm text-slate-500">Manage your teams</p>
                            </div>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>

                    {/* Teams */}
                    <Link
                        href="/dashboard/teams"
                        className="glass-card rounded-2xl p-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 mb-1">My Teams</h4>
                                <p className="text-sm text-slate-500">Collaborate with others</p>
                            </div>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>

                    {/* Submissions */}
                    <Link
                        href="/dashboard/submissions"
                        className="glass-card rounded-2xl p-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 mb-1">My Submissions</h4>
                                <p className="text-sm text-slate-500">View your projects</p>
                            </div>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                </div>

                {/* My Organizations */}
                {organizations && organizations.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-slate-800">My Organizations</h3>
                            <Link href="/organizations" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors">
                                View all
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {organizations.slice(0, 3).map((org: any) => (
                                <Link
                                    key={org.id}
                                    href={`/organizations/${org.slug}`}
                                    className="glass-card rounded-2xl p-5 group hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                                            {org.logo ? (
                                                <img src={org.logo} alt={org.name} className="w-12 h-12 rounded-xl object-cover" />
                                            ) : (
                                                <span className="text-lg font-bold text-white">{org.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{org.name}</h4>
                                            <p className="text-xs text-slate-500">
                                                <span className="capitalize">{org.role.toLowerCase()}</span> • {org._count?.members || 0} members
                                            </p>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Role-based Admin Sections */}
                {(session.user.role === "SUPER_ADMIN" || session.user.role === "ORGANIZATION_ADMIN") && (
                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-slate-800 mb-5">Admin Tools</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Link
                                href="/organizer"
                                className="glass-card rounded-2xl p-6 group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 border border-indigo-100"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-indigo-900 mb-1">Organizer Dashboard</h4>
                                        <p className="text-sm text-indigo-600">Manage your hackathons & contests</p>
                                    </div>
                                </div>
                            </Link>
                            
                            {session.user.role === "SUPER_ADMIN" && (
                                <Link
                                    href="/admin"
                                    className="glass-card rounded-2xl p-6 group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-red-50/50 to-rose-50/50 border border-red-100"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-red-900 mb-1">System Admin</h4>
                                            <p className="text-sm text-red-600">Full platform management</p>
                                        </div>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
