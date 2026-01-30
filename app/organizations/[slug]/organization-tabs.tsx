"use client"

import { useState } from "react"
import MembersTab from "./members-tab"
import OverviewTab from "./overview-tab"
import HackathonsTab from "./hackathons-tab"
import { LayoutDashboard, Users, Trophy } from "lucide-react"

type OrganizationType = "COMPANY" | "UNIVERSITY" | "NONPROFIT" | "GOVERNMENT" | "OTHER"

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

interface OrganizationTabsProps {
    organization: Organization
    isAdmin: boolean
    isOwner: boolean
    analytics: AnalyticsData | null
}

export default function OrganizationTabs({ organization, isAdmin, isOwner, analytics }: OrganizationTabsProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "members" | "hackathons">("overview")

    const tabs = [
        { id: "overview", name: "Overview", icon: LayoutDashboard },
        { id: "members", name: "Members", icon: Users },
        { id: "hackathons", name: "Hackathons", icon: Trophy },
    ] as const

    return (
        <div>
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 mb-8">
                <nav className="flex space-x-1">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 flex-1 justify-center rounded-xl py-3 px-4 text-sm font-medium transition-all
                                    ${activeTab === tab.id 
                                        ? "bg-blue-600 text-white shadow-sm" 
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    }
                                `}
                            >
                                <IconComponent className="h-4 w-4" />
                                {tab.name}
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Tab content */}
            <div className="animate-fade-in">
                {activeTab === "overview" && (
                    <OverviewTab organization={organization} analytics={analytics} />
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
