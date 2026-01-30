import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getUserOrganizations } from "@/lib/actions/organization"
import { Building2, Users, Verified, Sparkles, Plus, ChevronRight, MapPin, Search } from "lucide-react"

interface Organization {
    id: string
    name: string
    slug: string
    logo: string | null
    type: string
    description?: string | null
    isVerified?: boolean
    website?: string | null
    location?: string | null
    industry?: string | null
    role: string
    _count?: { members: number; hackathons: number }
}

export default async function OrganizationsPage() {
    const session = await auth()
    
    if (!session) {
        redirect("/sign-in")
    }

    const result = await getUserOrganizations()
    const organizations = (result.success && result.organizations ? result.organizations : []) as Organization[]

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                            <Sparkles className="h-4 w-4 text-yellow-300" />
                            <span className="text-sm font-medium text-white/90">Discover Amazing Teams</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                            Organizations
                        </h1>
                        <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
                            Connect with innovative companies, universities, and communities. 
                            Join forces to build something extraordinary together.
                        </p>
                        <div className="mt-8">
                            <Link
                                href="/organizations/new"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-lg hover:bg-blue-50 transition-all hover:scale-105 hover:shadow-xl btn-animate"
                            >
                                <Plus className="h-5 w-5" />
                                Create Organization
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto animate-fade-in-up animation-delay-200">
                        <div className="text-center">
                            <div className="flex justify-center">
                                <Building2 className="h-8 w-8 text-blue-200" />
                            </div>
                            <p className="mt-2 text-3xl font-bold text-white">{organizations.length}</p>
                            <p className="text-sm text-blue-200">Organizations</p>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center">
                                <Users className="h-8 w-8 text-blue-200" />
                            </div>
                            <p className="mt-2 text-3xl font-bold text-white">
                                {organizations.reduce((acc, org) => acc + (org._count?.members || 0), 0)}
                            </p>
                            <p className="text-sm text-blue-200">Total Members</p>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center">
                                <Verified className="h-8 w-8 text-blue-200" />
                            </div>
                            <p className="mt-2 text-3xl font-bold text-white">
                                {organizations.filter((org) => org.isVerified).length}
                            </p>
                            <p className="text-sm text-blue-200">Verified</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Results */}
                {organizations.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 animate-fade-in-up animation-delay-300">
                        <div className="mx-auto h-20 w-20 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                            <Building2 className="h-10 w-10 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No organizations yet
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Create an organization to host hackathons, manage teams, and collaborate with others.
                        </p>
                        <Link
                            href="/organizations/new"
                            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors btn-animate"
                        >
                            <Plus className="h-4 w-4" />
                            Create your first organization
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Results Count */}
                        <div className="flex items-center justify-between mb-6 animate-fade-in-up animation-delay-300">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-medium text-gray-900">{organizations.length}</span> organization{organizations.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        {/* Organization Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {organizations.map((org, index) => (
                                <Link
                                    key={org.id}
                                    href={`/organizations/${org.slug}`}
                                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up hover-lift"
                                    style={{ animationDelay: `${300 + index * 50}ms` }}
                                >
                                    {/* Card Header */}
                                    <div className="h-24 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
                                        <div className="absolute inset-0 bg-black/10" />
                                        {/* Organization Type Badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 capitalize">
                                                {org.type.toLowerCase().replace("_", " ")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Logo & Content */}
                                    <div className="px-5 pb-5 -mt-8 relative">
                                        <div className="h-16 w-16 rounded-xl bg-white border-4 border-white shadow-sm flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                                            {org.logo ? (
                                                <img src={org.logo} alt={org.name} className="h-full w-full object-cover rounded-lg" />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center rounded-lg">
                                                    <span className="text-2xl font-bold text-white">
                                                        {org.name.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            <div className="flex items-start justify-between">
                                                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                    {org.name}
                                                </h3>
                                                {org.isVerified && (
                                                    <Verified className="h-5 w-5 text-blue-500 flex-shrink-0 ml-2" />
                                                )}
                                            </div>

                                            {org.description && (
                                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{org.description}</p>
                                            )}

                                            {/* Meta Info */}
                                            <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                                                {org._count?.members && (
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3.5 w-3.5" />
                                                        <span>{org._count.members} members</span>
                                                    </div>
                                                )}
                                                {org._count?.hackathons !== undefined && org._count.hackathons > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Sparkles className="h-3.5 w-3.5" />
                                                        <span>{org._count.hackathons} hackathons</span>
                                                    </div>
                                                )}
                                                {org.location && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        <span className="truncate max-w-[120px]">{org.location}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 capitalize">
                                                    {org.role.toLowerCase().replace("_", " ")}
                                                </span>
                                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
