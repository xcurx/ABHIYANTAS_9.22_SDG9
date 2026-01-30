"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ExternalLink, Users } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import ParticipantActions from "./participant-actions"

interface Registration {
    id: string
    status: string
    registeredAt: Date
    motivation?: string | null
    experience?: string | null
    skills?: string[]
    portfolioUrl?: string | null
    lookingForTeam?: boolean
    teamPreferences?: string | null
    tshirtSize?: string | null
    dietaryRestrictions?: string | null
    user: {
        id: string
        name: string | null
        email: string
        avatar: string | null
    }
}

interface ParticipantDetailsProps {
    registration: Registration
}

export default function ParticipantDetails({ registration }: ParticipantDetailsProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const hasApplicationDetails = 
        registration.motivation || 
        registration.experience || 
        (registration.skills && registration.skills.length > 0) ||
        registration.portfolioUrl ||
        registration.teamPreferences

    return (
        <>
            <tr 
                className={`hover:bg-gray-50 ${hasApplicationDetails ? "cursor-pointer" : ""}`}
                onClick={() => hasApplicationDetails && setIsExpanded(!isExpanded)}
            >
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        {registration.user.avatar ? (
                            <img 
                                src={registration.user.avatar} 
                                alt={registration.user.name || ""} 
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                                {registration.user.name?.[0]?.toUpperCase() || "?"}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">
                                    {registration.user.name}
                                </p>
                                {registration.lookingForTeam && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                        <Users className="h-3 w-3" />
                                        Looking for team
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">
                                {registration.user.email}
                            </p>
                        </div>
                        {hasApplicationDetails && (
                            <button 
                                className="ml-auto text-gray-400 hover:text-gray-600"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsExpanded(!isExpanded)
                                }}
                            >
                                {isExpanded ? (
                                    <ChevronUp className="h-5 w-5" />
                                ) : (
                                    <ChevronDown className="h-5 w-5" />
                                )}
                            </button>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4">
                    {registration.skills && registration.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                            {registration.skills.slice(0, 3).map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                            {registration.skills.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                    +{registration.skills.length - 3}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-400 text-sm">—</span>
                    )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDateTime(registration.registeredAt)}
                </td>
                <td className="px-6 py-4">
                    <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            registration.status === "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : registration.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : registration.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {registration.status}
                    </span>
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <ParticipantActions
                        registrationId={registration.id}
                        currentStatus={registration.status}
                    />
                </td>
            </tr>
            
            {/* Expanded Details Row */}
            {isExpanded && hasApplicationDetails && (
                <tr className="bg-gray-50">
                    <td colSpan={5} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Motivation */}
                            {registration.motivation && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Motivation</h4>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded-lg border border-gray-200">
                                        {registration.motivation}
                                    </p>
                                </div>
                            )}
                            
                            {/* Experience */}
                            {registration.experience && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Relevant Experience</h4>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded-lg border border-gray-200">
                                        {registration.experience}
                                    </p>
                                </div>
                            )}
                            
                            {/* Skills (full list) */}
                            {registration.skills && registration.skills.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Skills</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {registration.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Portfolio */}
                            {registration.portfolioUrl && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Portfolio / Links</h4>
                                    <a
                                        href={registration.portfolioUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-500"
                                    >
                                        {registration.portfolioUrl}
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            )}
                            
                            {/* Team Preferences */}
                            {registration.teamPreferences && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Team Preferences</h4>
                                    <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                                        {registration.teamPreferences}
                                    </p>
                                </div>
                            )}
                            
                            {/* Additional Info */}
                            {(registration.tshirtSize || registration.dietaryRestrictions) && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Additional Info</h4>
                                    <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                                        {registration.tshirtSize && (
                                            <p><span className="font-medium">T-shirt Size:</span> {registration.tshirtSize}</p>
                                        )}
                                        {registration.dietaryRestrictions && (
                                            <p><span className="font-medium">Dietary Restrictions:</span> {registration.dietaryRestrictions}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    )
}
