"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Trash2, RefreshCw, Loader2 } from "lucide-react"
import { revokeHackathonRole, resendRoleInvitation } from "@/lib/actions/hackathon-role"

interface RoleActionsProps {
    roleId: string
    status: string
    hackathonSlug: string
}

export default function RoleActions({ roleId, status, hackathonSlug }: RoleActionsProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleRevoke = async () => {
        if (!confirm("Are you sure you want to revoke this invitation/role?")) {
            return
        }
        
        setIsLoading(true)
        try {
            await revokeHackathonRole(roleId)
            router.refresh()
        } catch (error) {
            console.error("Failed to revoke role:", error)
        } finally {
            setIsLoading(false)
            setIsOpen(false)
        }
    }

    const handleResend = async () => {
        setIsLoading(true)
        try {
            await resendRoleInvitation(roleId)
            router.refresh()
        } catch (error) {
            console.error("Failed to resend invitation:", error)
        } finally {
            setIsLoading(false)
            setIsOpen(false)
        }
    }

    if (status === "REVOKED") {
        return null
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-20">
                        {status === "PENDING" && (
                            <button
                                onClick={handleResend}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Resend Invitation
                            </button>
                        )}
                        <button
                            onClick={handleRevoke}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                            {status === "PENDING" ? "Cancel Invitation" : "Revoke Role"}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
