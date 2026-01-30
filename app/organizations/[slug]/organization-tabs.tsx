"use client"

import { useState } from "react"
import MembersTab from "./members-tab"
import OverviewTab from "./overview-tab"

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

interface OrganizationTabsProps {
    organization: Organization
    isAdmin: boolean
    isOwner: boolean
}

export default function OrganizationTabs({ organization, isAdmin, isOwner }: OrganizationTabsProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "members" | "hackathons">("overview")

    const tabs = [
        { id: "overview", name: "Overview" },
        { id: "members", name: "Members" },
        { id: "hackathons", name: "Hackathons" },
    ] as const

    return (
        <div>
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                                ${activeTab === tab.id 
                                    ? "border-indigo-500 text-indigo-600" 
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                }
                            `}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab content */}
            <div className="mt-6">
                {activeTab === "overview" && (
                    <OverviewTab organization={organization} />
                )}
                {activeTab === "members" && (
                    <MembersTab 
                        organizationId={organization.id} 
                        organizationSlug={organization.slug}
                        isAdmin={isAdmin} 
                        isOwner={isOwner} 
                    />
                )}
                {activeTab === "hackathons" && (
                    <div className="text-center py-12 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hackathons yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Hackathon management will be available in Module 3.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
