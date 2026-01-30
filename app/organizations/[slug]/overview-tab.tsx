import { Building2, Globe, MapPin, Briefcase, Users, Calendar, Crown, Shield, User } from "lucide-react"
import OrganizationAnalytics from "./organization-analytics"

type OrganizationType = "COMPANY" | "UNIVERSITY" | "NONPROFIT" | "GOVERNMENT" | "OTHER"

interface Organization {
    id: string
    name: string
    slug: string
    type: OrganizationType
    description: string | null
    logo: string | null
    website: string | null
    industry: string | null
    size: string | null
    location: string | null
    isVerified: boolean
    createdAt: Date
    isAdmin: boolean
    isOwner: boolean
    userRole: "OWNER" | "ADMIN" | "MEMBER" | null
    _count: {
        members: number
        hackathons?: number
    }
}

interface AnalyticsData {
    totalHackathons: number
    totalParticipants: number
    totalTeams: number
    hackathonsByStatus: Record<string, number>
    registrationsByStatus: Record<string, number>
    participantsPerHackathon: {
        name: string
        fullName: string
        participants: number
        teams: number
    }[]
    hackathonsByMonth: {
        month: string
        count: number
    }[]
}

interface OverviewTabProps {
    organization: Organization
    analytics: AnalyticsData | null
}

export default function OverviewTab({ organization, analytics }: OverviewTabProps) {
    const roleConfig = {
        OWNER: { label: "Owner", icon: Crown, color: "bg-purple-100 text-purple-700 border-purple-200" },
        ADMIN: { label: "Admin", icon: Shield, color: "bg-blue-100 text-blue-700 border-blue-200" },
        MEMBER: { label: "Member", icon: User, color: "bg-gray-100 text-gray-700 border-gray-200" },
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main info */}
            <div className="lg:col-span-2 space-y-6">
                {/* About */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">About</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        {organization.description || "No description provided yet. Add a description to help others learn more about your organization."}
                    </p>
                </div>

                {/* Analytics Charts */}
                {analytics && <OrganizationAnalytics analytics={analytics} />}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Organization details */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 mb-5">Details</h3>
                    <dl className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                                <dt className="text-xs text-gray-500 uppercase tracking-wide">Type</dt>
                                <dd className="text-sm font-medium text-gray-900 capitalize mt-0.5">
                                    {organization.type.toLowerCase().replace('_', ' ')}
                                </dd>
                            </div>
                        </div>
                        {organization.industry && (
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500 uppercase tracking-wide">Industry</dt>
                                    <dd className="text-sm font-medium text-gray-900 mt-0.5">{organization.industry}</dd>
                                </div>
                            </div>
                        )}
                        {organization.size && (
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <Users className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500 uppercase tracking-wide">Size</dt>
                                    <dd className="text-sm font-medium text-gray-900 mt-0.5">{organization.size} employees</dd>
                                </div>
                            </div>
                        )}
                        {organization.location && (
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500 uppercase tracking-wide">Location</dt>
                                    <dd className="text-sm font-medium text-gray-900 mt-0.5">{organization.location}</dd>
                                </div>
                            </div>
                        )}
                        {organization.website && (
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <Globe className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500 uppercase tracking-wide">Website</dt>
                                    <dd className="text-sm font-medium text-blue-600 mt-0.5">
                                        <a href={organization.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {organization.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </dd>
                                </div>
                            </div>
                        )}
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                                <dt className="text-xs text-gray-500 uppercase tracking-wide">Created</dt>
                                <dd className="text-sm font-medium text-gray-900 mt-0.5">
                                    {new Date(organization.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </dd>
                            </div>
                        </div>
                    </dl>
                </div>

                {/* Your role */}
                {organization.userRole && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Role</h3>
                        <div className="flex items-center gap-3">
                            {(() => {
                                const config = roleConfig[organization.userRole]
                                const IconComponent = config.icon
                                return (
                                    <span className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border ${config.color}`}>
                                        <IconComponent className="h-4 w-4" />
                                        {config.label}
                                    </span>
                                )
                            })()}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            {organization.userRole === 'OWNER' && "You have full control over this organization."}
                            {organization.userRole === 'ADMIN' && "You can manage members and create hackathons."}
                            {organization.userRole === 'MEMBER' && "You are a member of this organization."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
