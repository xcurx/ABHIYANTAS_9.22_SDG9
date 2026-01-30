"use client"

import { useState, useEffect, useTransition } from "react"
import { getOrganizationMembers, removeOrganizationMember, updateMemberRole, addOrganizationMember } from "@/lib/actions/organization"
import { UserPlus, Trash2, Crown, Shield, User, Loader2, X, AlertCircle } from "lucide-react"

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

const roleConfig = {
    OWNER: { label: "Owner", icon: Crown, color: "bg-purple-100 text-purple-700 border-purple-200" },
    ADMIN: { label: "Admin", icon: Shield, color: "bg-blue-100 text-blue-700 border-blue-200" },
    MEMBER: { label: "Member", icon: User, color: "bg-gray-100 text-gray-700 border-gray-200" },
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
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="mt-3 text-sm text-gray-500">Loading members...</p>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Team Members
                    </h3>
                    <p className="text-sm text-gray-500">{members.length} member{members.length !== 1 ? "s" : ""} in this organization</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-all hover:scale-105 btn-animate"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Member
                    </button>
                )}
            </div>

            {/* Members list */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-100">
                    {members.map((member, index) => {
                        const config = roleConfig[member.role]
                        const IconComponent = config.icon
                        return (
                            <li 
                                key={member.id} 
                                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                                        {member.user.avatar ? (
                                            <img 
                                                src={member.user.avatar} 
                                                alt={member.user.name || ''} 
                                                className="h-12 w-12 rounded-xl object-cover" 
                                            />
                                        ) : (
                                            <span className="text-lg font-semibold text-white">
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
                                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
                                        >
                                            <option value="ADMIN">Admin</option>
                                            <option value="MEMBER">Member</option>
                                        </select>
                                    ) : (
                                        <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border ${config.color}`}>
                                            <IconComponent className="h-3.5 w-3.5" />
                                            {config.label}
                                        </span>
                                    )}

                                    {/* Remove button */}
                                    {isAdmin && member.role !== 'OWNER' && (
                                        <button
                                            onClick={() => handleRemoveMember(member.id, member.user.name)}
                                            disabled={isPending}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                                            title="Remove member"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">Add New Member</h3>
                                <button 
                                    onClick={() => setShowAddModal(false)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        
                        <form onSubmit={handleAddMember} className="p-6">
                            {error && (
                                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="user@example.com"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    The user must already have an account on the platform.
                                </p>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="role" className="block text-sm font-medium text-gray-900 mb-2">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    value={newMemberRole}
                                    onChange={(e) => setNewMemberRole(e.target.value as AssignableRole)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                                >
                                    <option value="MEMBER">Member</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-all"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4" />
                                            Add Member
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
