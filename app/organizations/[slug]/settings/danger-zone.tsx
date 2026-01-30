"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { leaveOrganization } from "@/lib/actions/organization"
import { AlertTriangle, ArrowRightLeft, Trash2, X, Loader2 } from "lucide-react"

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
        <div className="bg-white rounded-2xl border border-red-200 overflow-hidden animate-fade-in-up animation-delay-200">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-red-200">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
                        <p className="text-sm text-red-600/80">Irreversible and destructive actions</p>
                    </div>
                </div>
            </div>
            
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ArrowRightLeft className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Transfer Ownership</h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Transfer this organization to another admin.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled
                        className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Transfer
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50/30 hover:bg-red-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Delete Organization</h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Permanently delete this organization and all its data.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="rounded-xl border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all hover:scale-105"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
                        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Trash2 className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    Delete Organization
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false)
                                    setConfirmName("")
                                }}
                                className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                                <p className="text-sm text-red-700">
                                    <strong className="block mb-1">⚠️ This action cannot be undone.</strong>
                                    This will permanently delete the{" "}
                                    <span className="font-semibold">{organizationName}</span> organization, 
                                    all its members, and all associated data.
                                </p>
                            </div>
                            
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Please type <span className="font-semibold text-gray-900">{organizationName}</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={confirmName}
                                    onChange={(e) => setConfirmName(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
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
                                    className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={confirmName !== organizationName || isPending}
                                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4" />
                                            Delete Organization
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
