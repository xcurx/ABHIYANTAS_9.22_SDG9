"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
    MoreHorizontal, 
    Check, 
    X, 
    Lock, 
    Trash2, 
    LogOut, 
    Crown,
    Loader2
} from "lucide-react"
import {
    respondToTeamInvitation,
    cancelTeamInvitation,
    lockTeam,
    leaveTeam,
    deleteTeam,
    removeTeamMember,
    transferLeadership,
} from "@/lib/actions/team"

interface TeamActionsProps {
    type: "invitation" | "team-settings" | "member" | "cancel-invitation" | "delete-team" | "leave-team"
    hackathonSlug: string
    teamId?: string
    memberId?: string
    memberName?: string
    invitationId?: string
    canLock?: boolean
}

export default function TeamActions({
    type,
    hackathonSlug,
    teamId,
    memberId,
    memberName,
    invitationId,
    canLock,
}: TeamActionsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [showConfirm, setShowConfirm] = useState<string | null>(null)

    const handleAction = async (action: string) => {
        setLoading(true)
        try {
            let result

            switch (action) {
                case "accept-invitation":
                    result = await respondToTeamInvitation(invitationId!, true)
                    break
                case "decline-invitation":
                    result = await respondToTeamInvitation(invitationId!, false)
                    break
                case "cancel-invitation":
                    result = await cancelTeamInvitation(invitationId!)
                    break
                case "lock-team":
                    result = await lockTeam(teamId!)
                    break
                case "leave-team":
                    result = await leaveTeam(teamId!)
                    break
                case "delete-team":
                    result = await deleteTeam(teamId!)
                    break
                case "remove-member":
                    result = await removeTeamMember(teamId!, memberId!)
                    break
                case "transfer-leadership":
                    result = await transferLeadership(teamId!, memberId!)
                    break
            }

            if (result?.success) {
                router.refresh()
            } else {
                alert(result?.message || "An error occurred")
            }
        } catch (error) {
            console.error("Team action error:", error)
            alert("An error occurred")
        } finally {
            setLoading(false)
            setShowMenu(false)
            setShowConfirm(null)
        }
    }

    // Invitation response buttons
    if (type === "invitation") {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleAction("accept-invitation")}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Accept
                </button>
                <button
                    onClick={() => handleAction("decline-invitation")}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm font-medium"
                >
                    <X className="h-4 w-4" />
                    Decline
                </button>
            </div>
        )
    }

    // Cancel invitation button
    if (type === "cancel-invitation") {
        return (
            <button
                onClick={() => handleAction("cancel-invitation")}
                disabled={loading}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium disabled:opacity-50"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel"}
            </button>
        )
    }

    // Team settings dropdown
    if (type === "team-settings") {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                >
                    <MoreHorizontal className="h-5 w-5" />
                </button>
                {showMenu && (
                    <>
                        <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                            {canLock && (
                                <button
                                    onClick={() => handleAction("lock-team")}
                                    disabled={loading}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <Lock className="h-4 w-4" />
                                    Lock Team
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        )
    }

    // Member actions dropdown
    if (type === "member") {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>
                {showMenu && (
                    <>
                        <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20">
                            <button
                                onClick={() => setShowConfirm("transfer")}
                                disabled={loading}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <Crown className="h-4 w-4" />
                                Make Leader
                            </button>
                            <button
                                onClick={() => setShowConfirm("remove")}
                                disabled={loading}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </button>
                        </div>
                    </>
                )}
                
                {/* Confirmation Modal */}
                {showConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                {showConfirm === "transfer" 
                                    ? "Transfer Leadership?" 
                                    : "Remove Member?"}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                {showConfirm === "transfer"
                                    ? `Are you sure you want to make ${memberName} the team leader?`
                                    : `Are you sure you want to remove ${memberName} from the team?`}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowConfirm(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleAction(showConfirm === "transfer" ? "transfer-leadership" : "remove-member")}
                                    disabled={loading}
                                    className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                                        showConfirm === "transfer" 
                                            ? "bg-indigo-600 hover:bg-indigo-700"
                                            : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Confirm"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Leave team button
    if (type === "leave-team") {
        if (showConfirm) {
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Leave Team?</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Are you sure you want to leave this team?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowConfirm(null)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction("leave-team")}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Leave"}
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <button
                onClick={() => setShowConfirm("leave")}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
                <LogOut className="h-4 w-4" />
                Leave Team
            </button>
        )
    }

    // Delete team button
    if (type === "delete-team") {
        if (showConfirm) {
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Delete Team?</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            This will remove all team members. This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowConfirm(null)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction("delete-team")}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <button
                onClick={() => setShowConfirm("delete")}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
                <Trash2 className="h-4 w-4" />
                Delete Team
            </button>
        )
    }

    return null
}
