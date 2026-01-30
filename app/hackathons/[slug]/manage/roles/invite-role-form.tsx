"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, Mail, Star, MessageSquare, Loader2 } from "lucide-react"
import { inviteHackathonRole } from "@/lib/actions/hackathon-role"

interface InviteRoleFormProps {
    hackathonId: string
    hackathonSlug: string
}

export default function InviteRoleForm({ hackathonId, hackathonSlug }: InviteRoleFormProps) {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<"JUDGE" | "MENTOR">("JUDGE")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setIsLoading(true)

        try {
            const result = await inviteHackathonRole({
                hackathonId,
                email: email.trim(),
                role,
            })

            if (result.error) {
                setError(result.error)
            } else {
                setSuccess(`Successfully invited ${email} as ${role.toLowerCase()}!`)
                setEmail("")
                router.refresh()
            }
        } catch {
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                Invite Judge or Mentor
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Email Input */}
                    <div className="md:col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email of the user to invite"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            The person must have an account on the platform
                        </p>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setRole("JUDGE")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${
                                    role === "JUDGE"
                                        ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                                disabled={isLoading}
                            >
                                <Star className="h-4 w-4" />
                                Judge
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("MENTOR")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${
                                    role === "MENTOR"
                                        ? "bg-green-50 border-green-300 text-green-700"
                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                                disabled={isLoading}
                            >
                                <MessageSquare className="h-4 w-4" />
                                Mentor
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending Invite...
                        </>
                    ) : (
                        <>
                            <UserPlus className="h-4 w-4" />
                            Send Invitation
                        </>
                    )}
                </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">About Roles</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 mt-0.5 text-yellow-600" />
                        <span><strong>Judges</strong> can score and evaluate submissions during evaluation stages</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 mt-0.5 text-green-600" />
                        <span><strong>Mentors</strong> can provide guidance and feedback to teams during mentoring sessions</span>
                    </li>
                </ul>
                <p className="text-xs text-blue-700 mt-3">
                    Note: Invited users will receive a notification and must accept the invitation to access their dashboard.
                </p>
            </div>
        </div>
    )
}
