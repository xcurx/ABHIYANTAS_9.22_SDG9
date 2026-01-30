import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { getOrganizationBySlug } from "@/lib/actions/organization"
import SettingsForm from "./settings-form"
import DangerZone from "./danger-zone"

export default async function OrganizationSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    const { slug } = await params
    
    if (!session) {
        redirect("/sign-in")
    }

    const organization = await getOrganizationBySlug(slug)

    if (!organization) {
        notFound()
    }

    // Only admins can access settings
    if (!organization.isAdmin) {
        redirect(`/organizations/${slug}`)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Link href={`/organizations/${slug}`} className="text-gray-400 hover:text-gray-600">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                Organization Settings
                            </h1>
                            <p className="text-sm text-gray-500">{organization.name}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <SettingsForm organization={organization} />
                
                {organization.isOwner && (
                    <DangerZone organizationId={organization.id} organizationName={organization.name} />
                )}
            </main>
        </div>
    )
}
