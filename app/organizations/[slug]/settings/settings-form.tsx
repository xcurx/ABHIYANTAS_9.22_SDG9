"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateOrganization } from "@/lib/actions/organization"
import { 
    Building2, 
    Globe, 
    MapPin, 
    Briefcase, 
    Users, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Loader2,
    Save
} from "lucide-react"

type OrganizationType = "COMPANY" | "UNIVERSITY" | "NONPROFIT" | "GOVERNMENT" | "OTHER"

interface Organization {
    id: string
    name: string
    slug: string
    type: OrganizationType
    description: string | null
    logo: string | null
    website: string | null
    industry: string | null
    size: string | null
    location: string | null
}

interface SettingsFormProps {
    organization: Organization
}

const organizationTypes: { value: OrganizationType; label: string }[] = [
    { value: "COMPANY", label: "Company" },
    { value: "UNIVERSITY", label: "University" },
    { value: "NONPROFIT", label: "Non-Profit" },
    { value: "GOVERNMENT", label: "Government" },
    { value: "OTHER", label: "Other" },
]

const sizeOptions = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1001-5000",
    "5000+",
]

export default function SettingsForm({ organization }: SettingsFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const [name, setName] = useState(organization.name)
    const [type, setType] = useState<OrganizationType>(organization.type)
    const [description, setDescription] = useState(organization.description || "")
    const [website, setWebsite] = useState(organization.website || "")
    const [industry, setIndustry] = useState(organization.industry || "")
    const [size, setSize] = useState(organization.size || "")
    const [location, setLocation] = useState(organization.location || "")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setSuccess("")

        startTransition(async () => {
            const result = await updateOrganization(organization.id, {
                name,
                type,
                description: description || undefined,
                website: website || undefined,
                industry: industry || undefined,
                size: size || undefined,
                location: location || undefined,
            })

            if (result.success) {
                setSuccess("Organization updated successfully!")
                // Reload page to reflect changes
                router.refresh()
            } else {
                setError(result.message || "Failed to update organization")
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8 animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
                        <p className="text-sm text-gray-600">Update your organization information</p>
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 animate-fade-in-up">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 flex items-start gap-3 animate-fade-in-up">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-700">{success}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                            Organization Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    {/* Slug (readonly) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Organization URL
                        </label>
                        <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                            <span>/organizations/{organization.slug}</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            The URL slug cannot be changed after creation.
                        </p>
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            Organization Type <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {organizationTypes.map((orgType) => (
                                <label 
                                    key={orgType.value} 
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                                        type === orgType.value 
                                            ? "border-blue-500 bg-blue-50 text-blue-700" 
                                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="type"
                                        value={orgType.value}
                                        checked={type === orgType.value}
                                        onChange={(e) => setType(e.target.value as OrganizationType)}
                                        className="sr-only"
                                    />
                                    <span className="text-sm font-medium">{orgType.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                Description
                            </div>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                            placeholder="Tell us about your organization..."
                        />
                    </div>

                    {/* Website */}
                    <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-900 mb-2">
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-400" />
                                Website
                            </div>
                        </label>
                        <input
                            type="url"
                            id="website"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            placeholder="https://example.com"
                        />
                    </div>

                    {/* Industry & Size */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="industry" className="block text-sm font-medium text-gray-900 mb-2">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                    Industry
                                </div>
                            </label>
                            <input
                                type="text"
                                id="industry"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                placeholder="Technology, Healthcare, etc."
                            />
                        </div>
                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-900 mb-2">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    Size
                                </div>
                            </label>
                            <select
                                id="size"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                            >
                                <option value="">Select size</option>
                                {sizeOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt} employees</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-900 mb-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                Location
                            </div>
                        </label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            placeholder="City, Country"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-all hover:scale-105 btn-animate"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    )
}
