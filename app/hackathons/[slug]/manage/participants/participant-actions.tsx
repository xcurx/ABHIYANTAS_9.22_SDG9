"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Check, X, Loader2 } from "lucide-react"
import { updateRegistrationStatus } from "@/lib/actions/hackathon"

interface ParticipantActionsProps {
    registrationId: string
    currentStatus: string
}

export default function ParticipantActions({ registrationId, currentStatus }: ParticipantActionsProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showMenu, setShowMenu] = useState(false)

    async function handleStatusChange(newStatus: "APPROVED" | "REJECTED") {
        setShowMenu(false)
        startTransition(async () => {
            const result = await updateRegistrationStatus(registrationId, newStatus)
            if (result.success) {
                router.refresh()
            }
        })
    }

    if (currentStatus === "CANCELLED") {
        return <span className="text-sm text-gray-400">No actions</span>
    }

    return (
        <div className="relative">
            {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
                <div className="flex items-center gap-1">
                    {currentStatus === "PENDING" && (
                        <>
                            <button
                                onClick={() => handleStatusChange("APPROVED")}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                title="Approve"
                            >
                                <Check className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleStatusChange("REJECTED")}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Reject"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </>
                    )}
                    {currentStatus === "APPROVED" && (
                        <button
                            onClick={() => handleStatusChange("REJECTED")}
                            className="text-sm text-red-600 hover:text-red-700"
                        >
                            Remove
                        </button>
                    )}
                    {currentStatus === "REJECTED" && (
                        <button
                            onClick={() => handleStatusChange("APPROVED")}
                            className="text-sm text-green-600 hover:text-green-700"
                        >
                            Approve
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
