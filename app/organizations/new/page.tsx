"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createOrganization, type ActionResult } from "@/lib/actions/organization"

const organizationTypes = [
    { value: "COMPANY", label: "Company", description: "A business or startup", icon: "🏢" },
    { value: "UNIVERSITY", label: "University", description: "Educational institution", icon: "🎓" },
    { value: "NONPROFIT", label: "Non-Profit", description: "Non-profit organization", icon: "💚" },
    { value: "GOVERNMENT", label: "Government", description: "Government agency", icon: "🏛️" },
    { value: "OTHER", label: "Other", description: "Other type of organization", icon: "🔷" },
]

const organizationSizes = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "500+", label: "500+ employees" },
]

export default function NewOrganizationPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<ActionResult | null>(null)
    const [slug, setSlug] = useState("")
    const [selectedType, setSelectedType] = useState("")

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
        <div className="min-h-screen pattern-bg">
            {/* Premium Header */}
            <header className="relative overflow-hidden border-b border-slate-200/60">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-amber-50/30" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-100/40 via-orange-100/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                
                <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-5">
                        <Link href="/organizations" className="text-slate-400 hover:text-amber-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                                    New Organization
                                </span>
                                <h1 className="text-2xl font-bold gradient-text mt-1">Create Organization</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="glass-card rounded-3xl p-8">
                    {result && !result.success && (
                        <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 p-4 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-red-800">{result.message}</p>
                            </div>
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-8">
                        {/* Organization Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                                Organization Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                onChange={handleNameChange}
                                className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                placeholder="Acme Corporation"
                            />
                            {result?.errors?.name && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {result.errors.name[0]}
                                </p>
                            )}
                        </div>

                        {/* Slug */}
                        <div>
                            <label htmlFor="slug" className="block text-sm font-semibold text-slate-700 mb-2">
                                URL Slug
                            </label>
                            <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition-all">
                                <span className="inline-flex items-center px-4 bg-slate-100/50 text-slate-500 text-sm border-r border-slate-200">
                                    /organizations/
                                </span>
                                <input
                                    type="text"
                                    id="slug"
                                    name="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="flex-1 px-4 py-3.5 bg-slate-50/50 text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                    placeholder="acme-corporation"
                                />
                            </div>
                            {result?.errors?.slug && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {result.errors.slug[0]}
                                </p>
                            )}
                        </div>

                        {/* Organization Type */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Organization Type <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {organizationTypes.map((type) => (
                                    <label
                                        key={type.value}
                                        className={`relative flex cursor-pointer rounded-2xl p-4 transition-all duration-200 ${
                                            selectedType === type.value
                                                ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 shadow-lg shadow-amber-500/10"
                                                : "glass-card hover:shadow-lg hover:-translate-y-0.5 border-2 border-transparent"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="type"
                                            value={type.value}
                                            className="sr-only"
                                            required
                                            onChange={() => setSelectedType(type.value)}
                                        />
                                        <span className="flex flex-1 flex-col items-center text-center gap-2">
                                            <span className="text-2xl">{type.icon}</span>
                                            <span className={`text-sm font-semibold ${selectedType === type.value ? "text-amber-700" : "text-slate-700"}`}>
                                                {type.label}
                                            </span>
                                            <span className={`text-xs ${selectedType === type.value ? "text-amber-600" : "text-slate-500"}`}>
                                                {type.description}
                                            </span>
                                        </span>
                                        {selectedType === type.value && (
                                            <span className="absolute top-2 right-2 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Organization Size */}
                        <div>
                            <label htmlFor="size" className="block text-sm font-semibold text-slate-700 mb-2">
                                Organization Size
                            </label>
                            <div className="relative">
                                <select
                                    id="size"
                                    name="size"
                                    className="w-full appearance-none px-4 py-3.5 pr-12 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                                >
                                    <option value="">Select size</option>
                                    {organizationSizes.map((size) => (
                                        <option key={size.value} value={size.value}>
                                            {size.label}
                                        </option>
                                    ))}
                                </select>
                                <svg className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Website */}
                        <div>
                            <label htmlFor="website" className="block text-sm font-semibold text-slate-700 mb-2">
                                Website
                            </label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                placeholder="https://example.com"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                                placeholder="Tell us about your organization..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Link
                                href="/organizations"
                                className="px-6 py-3 text-slate-600 font-medium hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create Organization
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
