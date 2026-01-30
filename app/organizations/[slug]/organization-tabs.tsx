"use client"

import { useState } from "react"
import MembersTab from "./members-tab"
import OverviewTab from "./overview-tab"
import HackathonsTab from "./hackathons-tab"

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
                    <HackathonsTab 
                        organizationId={organization.id}
                        organizationSlug={organization.slug}
                        isAdmin={isAdmin}
                    />
                )}
            </div>
        </div>
    )
}
