import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getUserOrganizations } from "@/lib/actions/organization"

interface Organization {
    id: string
    name: string
    slug: string
    logo: string | null
    type: string
    description?: string | null
    isVerified?: boolean
    role: string
    _count?: { members: number }
}

export default async function OrganizationsPage() {
    const session = await auth()
    
    if (!session) {
        redirect("/sign-in")
    }

    const result = await getUserOrganizations()
    const organizations = (result.success && result.organizations ? result.organizations : []) as Organization[]

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Organizations
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage your organizations and teams
                        </p>
                    </div>
                    <Link
                        href="/organizations/new"
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                        Create Organization
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {organizations.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No organizations yet</h3>
                        <p className="text-gray-600 mb-6">
                            Create an organization to host hackathons or join an existing one.
                        </p>
                        <Link
                            href="/organizations/new"
                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                        >
                            Create your first organization
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {organizations.map((org: Organization) => (
                            <Link
                                key={org.id}
                                href={`/organizations/${org.slug}`}
                                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                        {org.logo ? (
                                            <img src={org.logo} alt={org.name} className="h-12 w-12 rounded-lg object-cover" />
                                        ) : (
                                            <span className="text-xl font-bold text-indigo-600">
                                                {org.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{org.name}</h3>
                                        <p className="text-sm text-gray-500">{org.type.toLowerCase().replace('_', ' ')}</p>
                                    </div>
                                </div>
                                {org.description && (
                                    <p className="mt-4 text-sm text-gray-600 line-clamp-2">{org.description}</p>
                                )}
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                                        {org.role}
                                    </span>
                                    {org.isVerified && (
                                        <span className="inline-flex items-center text-green-600 text-xs">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
