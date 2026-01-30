"use client"

import { useState, useEffect, useTransition } from "react"
import { getOrganizationMembers, removeOrganizationMember, updateMemberRole, addOrganizationMember } from "@/lib/actions/organization"

// Role for members fetched from API (includes OWNER)
type MemberRole = "OWNER" | "ADMIN" | "MEMBER"
// Role that can be assigned via the form
type AssignableRole = "ADMIN" | "MEMBER"

interface Member {
    id: string
    role: MemberRole
    joinedAt: Date
    user: {
        id: string
        name: string | null
        email: string
        avatar: string | null
    }
}

interface MembersTabProps {
    organizationId: string
    organizationSlug: string
    isAdmin: boolean
    isOwner: boolean
}

export default function MembersTab({ organizationId, organizationSlug, isAdmin, isOwner }: MembersTabProps) {
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [showAddModal, setShowAddModal] = useState(false)
    const [newMemberEmail, setNewMemberEmail] = useState("")
    const [newMemberRole, setNewMemberRole] = useState<AssignableRole>("MEMBER")
    const [error, setError] = useState("")

    useEffect(() => {
        loadMembers()
    }, [organizationId])

    async function loadMembers() {
        setLoading(true)
        try {
            const result = await getOrganizationMembers(organizationId)
            if (result.success && result.members) {
                setMembers(result.members as Member[])
            }
        } catch (e) {
            console.error("Failed to load members:", e)
        } finally {
            setLoading(false)
        }
    }

    async function handleRemoveMember(memberId: string, memberName: string | null) {
        if (!confirm(`Are you sure you want to remove ${memberName || 'this member'} from the organization?`)) {
            return
        }

        startTransition(async () => {
            const result = await removeOrganizationMember(organizationId, memberId)
            if (result.success) {
                setMembers(members.filter(m => m.id !== memberId))
            } else {
                alert(result.message || "Failed to remove member")
            }
        })
    }

    async function handleUpdateRole(memberId: string, newRole: AssignableRole) {
        startTransition(async () => {
            const result = await updateMemberRole(organizationId, memberId, newRole)
            if (result.success) {
                setMembers(members.map(m => 
                    m.id === memberId ? { ...m, role: newRole } : m
                ))
            } else {
                alert(result.message || "Failed to update role")
            }
        })
    }

    async function handleAddMember(e: React.FormEvent) {
        e.preventDefault()
        setError("")

        startTransition(async () => {
            const result = await addOrganizationMember(organizationId, newMemberEmail, newMemberRole)
            if (result.success) {
                setShowAddModal(false)
                setNewMemberEmail("")
                setNewMemberRole("MEMBER")
                loadMembers()
            } else {
                setError(result.message || "Failed to add member")
            }
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Members ({members.length})
                </h3>
                {isAdmin && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                        Add Member
                    </button>
                )}
            </div>

            {/* Members list */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {members.map((member) => (
                        <li key={member.id} className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    {member.user.avatar ? (
                                        <img 
                                            src={member.user.avatar} 
                                            alt={member.user.name || ''} 
                                            className="h-10 w-10 rounded-full object-cover" 
                                        />
                                    ) : (
                                        <span className="text-sm font-medium text-indigo-600">
                                            {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {member.user.name || 'Unnamed User'}
                                    </p>
                                    <p className="text-sm text-gray-500">{member.user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Role badge or selector */}
                                {isOwner && member.role !== 'OWNER' ? (
                                    <select
                                        value={member.role}
                                        onChange={(e) => handleUpdateRole(member.id, e.target.value as AssignableRole)}
                                        disabled={isPending}
                                        className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="ADMIN">Admin</option>
                                        <option value="MEMBER">Member</option>
                                    </select>
                                ) : (
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                        member.role === 'OWNER' 
                                            ? 'bg-purple-100 text-purple-800' 
                                            : member.role === 'ADMIN'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {member.role}
                                    </span>
                                )}

                                {/* Remove button */}
                                {isAdmin && member.role !== 'OWNER' && (
                                    <button
                                        onClick={() => handleRemoveMember(member.id, member.user.name)}
                                        disabled={isPending}
                                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Member</h3>
                        
                        <form onSubmit={handleAddMember}>
                            {error && (
                                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    required
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="user@example.com"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    The user must already have an account on the platform.
                                </p>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    value={newMemberRole}
                                    onChange={(e) => setNewMemberRole(e.target.value as AssignableRole)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="MEMBER">Member</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                                >
                                    {isPending ? "Adding..." : "Add Member"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
