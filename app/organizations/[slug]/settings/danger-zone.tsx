"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { leaveOrganization } from "@/lib/actions/organization"

interface DangerZoneProps {
    organizationId: string
    organizationName: string
}

export default function DangerZone({ organizationId, organizationName }: DangerZoneProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [confirmName, setConfirmName] = useState("")

    async function handleDelete() {
        if (confirmName !== organizationName) {
            return
        }

        startTransition(async () => {
            // Note: In a real implementation, you'd create a deleteOrganization action
            // For now, the owner leaving deletes the org if they're the only member
            // Or you could implement a proper delete action
            alert("Organization deletion is not yet implemented. For now, remove all members first, then leave the organization.")
            setShowDeleteConfirm(false)
        })
    }

    return (
        <div className="bg-white rounded-lg shadow p-6 border border-red-200">
            <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">Transfer Ownership</h3>
                        <p className="text-sm text-gray-500">
                            Transfer this organization to another admin.
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Transfer
                    </button>
                </div>

                <div className="flex items-center justify-between py-3">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">Delete Organization</h3>
                        <p className="text-sm text-gray-500">
                            Permanently delete this organization and all its data.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Delete Organization
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            This action cannot be undone. This will permanently delete the{" "}
                            <strong>{organizationName}</strong> organization, all its members, 
                            and all associated data.
                        </p>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Please type <strong>{organizationName}</strong> to confirm
                            </label>
                            <input
                                type="text"
                                value={confirmName}
                                onChange={(e) => setConfirmName(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                placeholder="Organization name"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteConfirm(false)
                                    setConfirmName("")
                                }}
                                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={confirmName !== organizationName || isPending}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                            >
                                {isPending ? "Deleting..." : "Delete Organization"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
