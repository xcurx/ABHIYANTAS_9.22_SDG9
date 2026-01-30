"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateOrganization } from "@/lib/actions/organization"

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
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h2>

            {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            <div className="space-y-6">
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                {/* Slug (readonly) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization URL
                    </label>
                    <div className="flex items-center rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                        <span>/organizations/{organization.slug}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        The URL slug will update automatically when you change the name.
                    </p>
                </div>

                {/* Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Type *
                    </label>
                    <div className="flex flex-wrap gap-4">
                        {organizationTypes.map((orgType) => (
                            <label key={orgType.value} className="flex items-center">
                                <input
                                    type="radio"
                                    name="type"
                                    value={orgType.value}
                                    checked={type === orgType.value}
                                    onChange={(e) => setType(e.target.value as OrganizationType)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">{orgType.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Tell us about your organization..."
                    />
                </div>

                {/* Website */}
                <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                    </label>
                    <input
                        type="url"
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="https://example.com"
                    />
                </div>

                {/* Industry & Size */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                            Industry
                        </label>
                        <input
                            type="text"
                            id="industry"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Technology, Healthcare, etc."
                        />
                    </div>
                    <div>
                        <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                            Size
                        </label>
                        <select
                            id="size"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                    </label>
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="City, Country"
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                    {isPending ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    )
}
