"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    User,
    FileText,
    Code,
    Link as LinkIcon,
    Users,
    Shirt,
    Utensils,
    Loader2,
    Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { registerForHackathonWithDetails } from "@/lib/actions/hackathon"

const skillOptions = [
    "Frontend Development",
    "Backend Development",
    "Full Stack",
    "Mobile Development",
    "UI/UX Design",
    "Machine Learning",
    "Data Science",
    "DevOps",
    "Blockchain",
    "IoT",
    "Cloud Computing",
    "Cybersecurity",
    "Game Development",
    "AR/VR",
    "Project Management",
]

const tshirtSizes = ["XS", "S", "M", "L", "XL", "XXL"]

interface Track {
    id: string
    name: string
    description: string | null
}

interface RegistrationFormProps {
    hackathonId: string
    slug: string
    requireApproval: boolean
    tracks: Track[]
    mode: string
}

export default function RegistrationForm({
    hackathonId,
    slug,
    requireApproval,
    tracks,
    mode,
}: RegistrationFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string[]>>({})

    const [formData, setFormData] = useState({
        motivation: "",
        experience: "",
        skills: [] as string[],
        portfolioUrl: "",
        dietaryRestrictions: "",
        tshirtSize: "",
        lookingForTeam: false,
        teamPreferences: "",
    })

    const toggleSkill = (skill: string) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter((s) => s !== skill)
                : [...prev.skills, skill],
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        const result = await registerForHackathonWithDetails(hackathonId, formData)

        setLoading(false)

        if (result.success) {
            router.push(`/hackathons/${slug}?registered=true`)
        } else {
            if (result.errors) {
                setErrors(result.errors)
            } else {
                setErrors({ form: [result.message || "Registration failed"] })
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {errors.form[0]}
                </div>
            )}

            {/* Motivation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Tell Us About Yourself
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Why do you want to participate in this hackathon? {requireApproval && "*"}
                        </label>
                        <textarea
                            value={formData.motivation}
                            onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                            placeholder="Share your motivation, what you hope to learn or build..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required={requireApproval}
                        />
                        {errors.motivation && (
                            <p className="mt-1 text-sm text-red-600">{errors.motivation[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Relevant Experience
                        </label>
                        <textarea
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            placeholder="Describe any relevant hackathon experience, projects, or skills..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5 text-indigo-600" />
                    Skills
                </h2>
                <p className="text-sm text-gray-600 mb-4">Select the skills you bring to the team</p>

                <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => (
                        <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                                formData.skills.includes(skill)
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            {skill}
                        </button>
                    ))}
                </div>
            </div>

            {/* Portfolio */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-indigo-600" />
                    Portfolio & Links
                </h2>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Portfolio, GitHub, or LinkedIn URL
                    </label>
                    <input
                        type="url"
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                        placeholder="https://github.com/yourusername"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Team Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Team Preferences
                </h2>

                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.lookingForTeam}
                            onChange={(e) =>
                                setFormData({ ...formData, lookingForTeam: e.target.checked })
                            }
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">I'm looking for a team</span>
                            <p className="text-sm text-gray-500">
                                Let other participants know you're available to team up
                            </p>
                        </div>
                    </label>

                    {formData.lookingForTeam && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                What kind of teammates are you looking for?
                            </label>
                            <textarea
                                value={formData.teamPreferences}
                                onChange={(e) =>
                                    setFormData({ ...formData, teamPreferences: e.target.value })
                                }
                                placeholder="Describe the skills or qualities you're looking for in teammates..."
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Info (for in-person events) */}
            {mode === "IN_PERSON" || mode === "HYBRID" ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shirt className="h-5 w-5 text-indigo-600" />
                        Event Preferences
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                T-Shirt Size
                            </label>
                            <select
                                value={formData.tshirtSize}
                                onChange={(e) =>
                                    setFormData({ ...formData, tshirtSize: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select size</option>
                                {tshirtSizes.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <Utensils className="h-4 w-4" />
                                Dietary Restrictions
                            </label>
                            <input
                                type="text"
                                value={formData.dietaryRestrictions}
                                onChange={(e) =>
                                    setFormData({ ...formData, dietaryRestrictions: e.target.value })
                                }
                                placeholder="e.g., Vegetarian, Vegan, Allergies..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
                <Link
                    href={`/hackathons/${slug}`}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4" />
                            {requireApproval ? "Submit Application" : "Register Now"}
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
