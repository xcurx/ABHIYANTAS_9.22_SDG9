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
    }
}

interface OverviewTabProps {
    organization: Organization
}

export default function OverviewTab({ organization }: OverviewTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main info */}
            <div className="lg:col-span-2 space-y-6">
                {/* About */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                    <p className="text-gray-600">
                        {organization.description || "No description provided."}
                    </p>
                </div>

                {/* Stats placeholder */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-indigo-600">0</div>
                            <div className="text-sm text-gray-500">Hackathons Hosted</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-indigo-600">{organization._count.members}</div>
                            <div className="text-sm text-gray-500">Members</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-indigo-600">0</div>
                            <div className="text-sm text-gray-500">Participants</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Organization details */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                    <dl className="space-y-3">
                        <div>
                            <dt className="text-sm text-gray-500">Type</dt>
                            <dd className="text-sm font-medium text-gray-900 capitalize">
                                {organization.type.toLowerCase().replace('_', ' ')}
                            </dd>
                        </div>
                        {organization.industry && (
                            <div>
                                <dt className="text-sm text-gray-500">Industry</dt>
                                <dd className="text-sm font-medium text-gray-900">{organization.industry}</dd>
                            </div>
                        )}
                        {organization.size && (
                            <div>
                                <dt className="text-sm text-gray-500">Size</dt>
                                <dd className="text-sm font-medium text-gray-900">{organization.size}</dd>
                            </div>
                        )}
                        {organization.location && (
                            <div>
                                <dt className="text-sm text-gray-500">Location</dt>
                                <dd className="text-sm font-medium text-gray-900">{organization.location}</dd>
                            </div>
                        )}
                        {organization.website && (
                            <div>
                                <dt className="text-sm text-gray-500">Website</dt>
                                <dd className="text-sm font-medium text-indigo-600">
                                    <a href={organization.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {organization.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-sm text-gray-500">Created</dt>
                            <dd className="text-sm font-medium text-gray-900">
                                {new Date(organization.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Your role */}
                {organization.userRole && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Role</h3>
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                organization.userRole === 'OWNER' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : organization.userRole === 'ADMIN'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                                {organization.userRole}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
