import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { getOrganizationBySlug } from "@/lib/actions/organization"
import OrganizationTabs from "./organization-tabs"

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    const { slug } = await params
    
    if (!session) {
        redirect("/sign-in")
    }

    const organization = await getOrganizationBySlug(slug)

    if (!organization) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-start gap-6">
                        <Link href="/organizations" className="text-gray-400 hover:text-gray-600 mt-2">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                            {organization.logo ? (
                                <img src={organization.logo} alt={organization.name} className="h-16 w-16 rounded-lg object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-indigo-600">
                                    {organization.name.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                    {organization.name}
                                </h1>
                                {organization.isVerified && (
                                    <span className="inline-flex items-center text-green-600">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                                <span className="capitalize">{organization.type.toLowerCase().replace('_', ' ')}</span>
                                {organization.industry && (
                                    <>
                                        <span>•</span>
                                        <span>{organization.industry}</span>
                                    </>
                                )}
                                {organization.location && (
                                    <>
                                        <span>•</span>
                                        <span>{organization.location}</span>
                                    </>
                                )}
                                <span>•</span>
                                <span>{organization._count.members} members</span>
                            </div>
                            {organization.description && (
                                <p className="mt-2 text-gray-600 max-w-2xl">{organization.description}</p>
                            )}
                        </div>
                        {organization.isAdmin && (
                            <Link
                                href={`/organizations/${slug}/settings`}
                                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                            >
                                Settings
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <OrganizationTabs 
                    organization={organization} 
                    isAdmin={organization.isAdmin} 
                    isOwner={organization.isOwner}
                />
            </main>
        </div>
    )
}
