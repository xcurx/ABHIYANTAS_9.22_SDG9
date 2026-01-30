import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { getOrganizationBySlug } from "@/lib/actions/organization"
import SettingsForm from "./settings-form"
import DangerZone from "./danger-zone"
import { ArrowLeft, Settings, Sparkles } from "lucide-react"

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
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                    <Link 
                        href={`/organizations/${slug}`} 
                        className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-6 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Organization
                    </Link>
                    <div className="flex items-center gap-4 animate-fade-in-up">
                        <div className="h-14 w-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <Settings className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-2">
                                <Sparkles className="h-3 w-3 text-yellow-300" />
                                <span className="text-xs font-medium text-white/90">{organization.name}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                                Organization Settings
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                <SettingsForm organization={organization} />
                
                {organization.isOwner && (
                    <DangerZone organizationId={organization.id} organizationName={organization.name} />
                )}
            </main>
        </div>
    )
}
