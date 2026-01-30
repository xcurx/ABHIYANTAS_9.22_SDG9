"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Loader2 } from "lucide-react"
import { createTeam } from "@/lib/actions/team"

interface CreateTeamFormProps {
    hackathonId: string
    hackathonSlug: string
}

export default function CreateTeamForm({ hackathonId, hackathonSlug }: CreateTeamFormProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        projectIdea: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const result = await createTeam(
                hackathonId,
                formData.name,
                formData.description || undefined,
                formData.projectIdea || undefined
            )

            if (result.success) {
                router.refresh()
            } else {
                setError(result.message)
            }
        } catch (err) {
            console.error(err)
            setError("Failed to create team")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
                <Users className="h-5 w-5" />
                Create a Team
            </button>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="text-left">
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Code Warriors"
                        required
                        minLength={2}
                        maxLength={50}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Tell potential teammates about your team..."
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Idea
                    </label>
                    <textarea
                        value={formData.projectIdea}
                        onChange={(e) => setFormData({ ...formData, projectIdea: e.target.value })}
                        placeholder="Brief description of your project idea (optional)"
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
            
            <div className="mt-6 flex gap-3">
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading || !formData.name.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Users className="h-4 w-4" />
                            Create Team
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
