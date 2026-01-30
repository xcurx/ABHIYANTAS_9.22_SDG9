"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Loader2 } from "lucide-react"
import { respondToRoleInvitation } from "@/lib/actions/hackathon-role"

interface RoleInvitationActionsProps {
    roleId: string
    hackathonSlug: string
    roleName: string
}

export default function RoleInvitationActions({ 
    roleId, 
    hackathonSlug,
    roleName 
}: RoleInvitationActionsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<"accept" | "decline" | null>(null)

    const handleResponse = async (accept: boolean) => {
        setIsLoading(accept ? "accept" : "decline")
        try {
            const result = await respondToRoleInvitation(roleId, accept)
            if (result.success) {
                router.refresh()
                if (accept) {
                    // Redirect to appropriate dashboard
                    if (roleName === "JUDGE") {
                        router.push(`/hackathons/${hackathonSlug}/judge`)
                    } else if (roleName === "MENTOR") {
                        router.push(`/hackathons/${hackathonSlug}/mentor`)
                    }
                }
            }
        } catch (error) {
            console.error("Failed to respond to invitation:", error)
        } finally {
            setIsLoading(null)
        }
    }

    return (
        <div className="mt-4 flex gap-3">
            <button
                onClick={() => handleResponse(true)}
                disabled={isLoading !== null}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
            >
                {isLoading === "accept" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Check className="h-4 w-4" />
                )}
                Accept Invitation
            </button>
            <button
                onClick={() => handleResponse(false)}
                disabled={isLoading !== null}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
            >
                {isLoading === "decline" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <X className="h-4 w-4" />
                )}
                Decline
            </button>
        </div>
    )
}
