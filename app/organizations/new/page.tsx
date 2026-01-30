"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createOrganization, type ActionResult } from "@/lib/actions/organization"
import { 
    Building2, 
    ArrowLeft, 
    Globe, 
    Users, 
    MapPin, 
    Briefcase, 
    FileText, 
    Link as LinkIcon, 
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Loader2,
    GraduationCap,
    Heart,
    Landmark,
    MoreHorizontal,
    Building
} from "lucide-react"

const organizationTypes = [
    { value: "COMPANY", label: "Company", description: "A business, startup, or corporation", icon: Building },
    { value: "UNIVERSITY", label: "University", description: "Educational institution or school", icon: GraduationCap },
    { value: "NONPROFIT", label: "Non-Profit", description: "Non-profit organization or NGO", icon: Heart },
    { value: "GOVERNMENT", label: "Government", description: "Government agency or department", icon: Landmark },
    { value: "OTHER", label: "Other", description: "Community group or other type", icon: MoreHorizontal },
]

const organizationSizes = [
    { value: "1-10", label: "1-10", description: "Small team" },
    { value: "11-50", label: "11-50", description: "Growing team" },
    { value: "51-200", label: "51-200", description: "Medium-sized" },
    { value: "201-500", label: "201-500", description: "Large organization" },
    { value: "500+", label: "500+", description: "Enterprise" },
]

const industries = [
    "Technology",
    "Healthcare",
    "Education",
    "Finance",
    "E-commerce",
    "Manufacturing",
    "Media & Entertainment",
    "Real Estate",
    "Transportation",
    "Energy",
    "Agriculture",
    "Other"
]

export default function NewOrganizationPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<ActionResult | null>(null)
    const [slug, setSlug] = useState("")
    const [selectedType, setSelectedType] = useState("")
    const [selectedSize, setSelectedSize] = useState("")

    function generateSlug(name: string) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim()
    }

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const name = e.target.value
        setSlug(generateSlug(name))
    }

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setResult(null)

        // Add the generated slug to formData
        formData.set("slug", slug)

        const response = await createOrganization(formData)
        setResult(response)

        if (response.success && response.data) {
            const data = response.data as { slug: string }
            router.push(`/organizations/${data.slug}`)
        }

        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                    <Link 
                        href="/organizations" 
                        className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-6 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Organizations
                    </Link>
                    <div className="animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
                            <Sparkles className="h-4 w-4 text-yellow-300" />
                            <span className="text-sm font-medium text-white/90">Create Something Great</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                            Create Your Organization
                        </h1>
                        <p className="mt-3 text-lg text-blue-100 max-w-2xl">
                            Set up your organization to host hackathons, manage teams, and collaborate with innovators worldwide.
                        </p>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Error Alert */}
                {result && !result.success && (
                    <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 animate-fade-in-up">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">There was an error creating your organization</h3>
                                <p className="text-sm text-red-700 mt-1">{result.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form action={handleSubmit} className="space-y-6">
                    {/* Section 1: Basic Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up animation-delay-100">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                                    <p className="text-sm text-gray-600">Tell us about your organization</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Organization Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                                    Organization Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    onChange={handleNameChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="Enter your organization name"
                                />
                                {result?.errors?.name && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {result.errors.name[0]}
                                    </p>
                                )}
                            </div>

                            {/* URL Slug */}
                            <div>
                                <label htmlFor="slug" className="block text-sm font-medium text-gray-900 mb-2">
                                    URL Slug
                                </label>
                                <div className="flex rounded-xl border border-gray-300 overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                    <span className="inline-flex items-center bg-gray-50 px-4 text-gray-500 text-sm border-r border-gray-300">
                                        /organizations/
                                    </span>
                                    <input
                                        type="text"
                                        id="slug"
                                        name="slug"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none"
                                        placeholder="your-organization"
                                    />
                                </div>
                                {result?.errors?.slug && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {result.errors.slug[0]}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                    placeholder="Describe what your organization does, its mission, and goals..."
                                />
                                <p className="mt-2 text-xs text-gray-500">A good description helps attract the right members and participants.</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Organization Type */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up animation-delay-200">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <Briefcase className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Organization Type</h2>
                                    <p className="text-sm text-gray-600">Select the category that best describes you</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                {organizationTypes.map((type) => {
                                    const IconComponent = type.icon
                                    return (
                                        <label
                                            key={type.value}
                                            className={`relative flex flex-col items-center cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/50 ${
                                                selectedType === type.value
                                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                                                    : "border-gray-200 bg-white"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="type"
                                                value={type.value}
                                                className="sr-only"
                                                required
                                                onChange={(e) => setSelectedType(e.target.value)}
                                            />
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                                                selectedType === type.value ? "bg-blue-100" : "bg-gray-100"
                                            }`}>
                                                <IconComponent className={`h-6 w-6 ${
                                                    selectedType === type.value ? "text-blue-600" : "text-gray-500"
                                                }`} />
                                            </div>
                                            <span className={`text-sm font-medium text-center ${
                                                selectedType === type.value ? "text-blue-900" : "text-gray-900"
                                            }`}>
                                                {type.label}
                                            </span>
                                            <span className="text-xs text-gray-500 text-center mt-1 hidden sm:block">
                                                {type.description}
                                            </span>
                                            {selectedType === type.value && (
                                                <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                                            )}
                                        </label>
                                    )
                                })}
                            </div>
                            {result?.errors?.type && (
                                <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {result.errors.type[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up animation-delay-300">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>
                                    <p className="text-sm text-gray-600">Help others learn more about you</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
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
                                        name="website"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        placeholder="https://yourwebsite.com"
                                    />
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
                                        name="location"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        placeholder="San Francisco, CA"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {/* Industry */}
                                <div>
                                    <label htmlFor="industry" className="block text-sm font-medium text-gray-900 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-gray-400" />
                                            Industry
                                        </div>
                                    </label>
                                    <select
                                        id="industry"
                                        name="industry"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                                    >
                                        <option value="">Select an industry</option>
                                        {industries.map((industry) => (
                                            <option key={industry} value={industry}>
                                                {industry}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Size */}
                                <div>
                                    <label htmlFor="size" className="block text-sm font-medium text-gray-900 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-gray-400" />
                                            Organization Size
                                        </div>
                                    </label>
                                    <select
                                        id="size"
                                        name="size"
                                        value={selectedSize}
                                        onChange={(e) => setSelectedSize(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                                    >
                                        <option value="">Select size</option>
                                        {organizationSizes.map((size) => (
                                            <option key={size.value} value={size.value}>
                                                {size.label} employees
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between py-4 animate-fade-in-up animation-delay-400">
                        <Link
                            href="/organizations"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 hover:shadow-lg btn-animate"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Create Organization
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
