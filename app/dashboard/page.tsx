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
    
    // Check if user can create hackathons (is admin/owner of any organization)
    const canCreateHackathon = organizations?.some(org => ["OWNER", "ADMIN"].includes(org.role)) ?? false

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Welcome, {session.user.name || session.user.email}
                        </span>
                        <form
                            action={async () => {
                                "use server"
                                await signOut({ redirectTo: "/sign-in" })
                            }}
                        >
                            <button
                                type="submit"
                                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
                            >
                                Sign out
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* User Info Card */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                            {session.user.avatar ? (
                                <img
                                    src={session.user.avatar}
                                    alt="Avatar"
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-indigo-600">
                                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {session.user.name || "User"}
                            </h2>
                            <p className="text-gray-600">{session.user.email}</p>
                            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 mt-1">
                                {session.user.role}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <Link
                            href="/dashboard/profile"
                            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                        >
                            Edit Profile →
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        href="/hackathons"
                        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Browse Hackathons</h4>
                                <p className="text-sm text-gray-600">Find and join hackathons</p>
                            </div>
                        </div>
                    </Link>

                    {canCreateHackathon && (
                        <Link
                            href="/hackathons/new"
                            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow border-2 border-dashed border-indigo-200 hover:border-indigo-400"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Create Hackathon</h4>
                                    <p className="text-sm text-gray-600">Host your own hackathon</p>
                                </div>
                            </div>
                        </Link>
                    )}

                    <Link
                        href="/dashboard/teams"
                        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">My Teams</h4>
                                <p className="text-sm text-gray-600">Manage your teams</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/submissions"
                        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">My Submissions</h4>
                                <p className="text-sm text-gray-600">View your projects</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/organizations"
                        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Organizations</h4>
                                <p className="text-sm text-gray-600">Manage your organizations</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* My Organizations */}
                {organizations && organizations.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">My Organizations</h3>
                            <Link href="/organizations" className="text-sm text-indigo-600 hover:text-indigo-500">
                                View all →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {organizations.slice(0, 3).map((org: any) => (
                                <Link
                                    key={org.id}
                                    href={`/organizations/${org.slug}`}
                                    className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                            {org.logo ? (
                                                <img src={org.logo} alt={org.name} className="h-10 w-10 rounded-lg object-cover" />
                                            ) : (
                                                <span className="text-lg font-bold text-indigo-600">
                                                    {org.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">{org.name}</h4>
                                            <p className="text-xs text-gray-500 capitalize">
                                                {org.role.toLowerCase()} • {org._count?.members || 0} members
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Role-based sections */}
                {(session.user.role === "SUPER_ADMIN" || session.user.role === "ORGANIZATION_ADMIN") && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer Tools</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link
                                href="/organizer"
                                className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 hover:bg-indigo-100 transition-colors"
                            >
                                <h4 className="font-semibold text-indigo-900">Organizer Dashboard</h4>
                                <p className="text-sm text-indigo-700">Manage your hackathons</p>
                            </Link>
                        </div>
                    </div>
                )}

                {session.user.role === "SUPER_ADMIN" && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Tools</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link
                                href="/admin"
                                className="bg-red-50 border border-red-200 rounded-lg p-6 hover:bg-red-100 transition-colors"
                            >
                                <h4 className="font-semibold text-red-900">Admin Dashboard</h4>
                                <p className="text-sm text-red-700">Full platform management</p>
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
