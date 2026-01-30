import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { getOrganizationBySlug, getOrganizationAnalytics } from "@/lib/actions/organization"
import OrganizationTabs from "./organization-tabs"
import { ArrowLeft, Settings, Verified, MapPin, Briefcase, Users, Globe, Calendar, Sparkles } from "lucide-react"

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

    const analytics = await getOrganizationAnalytics(organization.id)

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <Link 
                        href="/organizations" 
                        className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-6 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Organizations
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-start gap-6 animate-fade-in-up">
                        {/* Logo */}
                        <div className="h-24 w-24 rounded-2xl bg-white shadow-lg flex items-center justify-center shrink-0 overflow-hidden">
                            {organization.logo ? (
                                <img src={organization.logo} alt={organization.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white">
                                        {organization.name.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                                    {organization.name}
                                </h1>
                                {organization.isVerified && (
                                    <div className="flex items-center gap-1 bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1">
                                        <Verified className="h-4 w-4 text-green-300" />
                                        <span className="text-sm font-medium text-green-100">Verified</span>
                                    </div>
                                )}
                            </div>

                            {/* Meta Info */}
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-blue-100">
                                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 capitalize">
                                    <Briefcase className="h-4 w-4" />
                                    {organization.type.toLowerCase().replace('_', ' ')}
                                </span>
                                {organization.industry && (
                                    <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                                        <Sparkles className="h-4 w-4" />
                                        {organization.industry}
                                    </span>
                                )}
                                {organization.location && (
                                    <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                                        <MapPin className="h-4 w-4" />
                                        {organization.location}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                                    <Users className="h-4 w-4" />
                                    {organization._count.members} members
                                </span>
                                {organization.website && (
                                    <a 
                                        href={organization.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 hover:bg-white/20 transition-colors"
                                    >
                                        <Globe className="h-4 w-4" />
                                        Website
                                    </a>
                                )}
                            </div>

                            {organization.description && (
                                <p className="mt-4 text-blue-100 max-w-2xl leading-relaxed">
                                    {organization.description}
                                </p>
                            )}
                        </div>

                        {/* Settings Button */}
                        {organization.isAdmin && (
                            <Link
                                href={`/organizations/${slug}/settings`}
                                className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-all"
                            >
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl animate-fade-in-up animation-delay-200">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-white">{organization._count.members}</p>
                            <p className="text-sm text-blue-200">Members</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-white">{organization._count.hackathons || 0}</p>
                            <p className="text-sm text-blue-200">Hackathons</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-white">{organization.size || "N/A"}</p>
                            <p className="text-sm text-blue-200">Team Size</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-white">{organization.isVerified ? "Yes" : "No"}</p>
                            <p className="text-sm text-blue-200">Verified</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up animation-delay-300">
                <OrganizationTabs 
                    organization={organization} 
                    isAdmin={organization.isAdmin} 
                    isOwner={organization.isOwner}
                    analytics={analytics}
                />
            </main>
        </div>
    )
}
