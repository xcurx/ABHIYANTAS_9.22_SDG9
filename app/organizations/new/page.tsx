"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createOrganization, type ActionResult } from "@/lib/actions/organization"

const organizationTypes = [
    { value: "COMPANY", label: "Company", description: "A business or startup" },
    { value: "UNIVERSITY", label: "University", description: "Educational institution" },
    { value: "NONPROFIT", label: "Non-Profit", description: "Non-profit organization" },
    { value: "GOVERNMENT", label: "Government", description: "Government agency" },
    { value: "OTHER", label: "Other", description: "Other type of organization" },
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
            <header className="bg-white shadow">
                <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Link href="/organizations" className="text-gray-400 hover:text-gray-600">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Create Organization
                        </h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    {result && !result.success && (
                        <div className="mb-6 rounded-md bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-800">{result.message}</p>
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-6">
                        {/* Organization Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Organization Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                onChange={handleNameChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="Acme Corporation"
                            />
                            {result?.errors?.name && (
                                <p className="mt-1 text-sm text-red-600">{result.errors.name[0]}</p>
                            )}
                        </div>

                        {/* Slug */}
                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                                URL Slug
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                                    /organizations/
                                </span>
                                <input
                                    type="text"
                                    id="slug"
                                    name="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="block w-full flex-1 rounded-none rounded-r-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    placeholder="acme-corporation"
                                />
                            </div>
                            {result?.errors?.slug && (
                                <p className="mt-1 text-sm text-red-600">{result.errors.slug[0]}</p>
                            )}
                        </div>

                        {/* Organization Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Organization Type *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {organizationTypes.map((type) => (
                                    <label
                                        key={type.value}
                                        className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none hover:border-indigo-300"
                                    >
                                        <input
                                            type="radio"
                                            name="type"
                                            value={type.value}
                                            className="sr-only"
                                            required
                                        />
                                        <span className="flex flex-1 flex-col">
                                            <span className="block text-sm font-medium text-gray-900">
                                                {type.label}
                                            </span>
                                            <span className="mt-1 text-xs text-gray-500">
                                                {type.description}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {result?.errors?.type && (
                                <p className="mt-1 text-sm text-red-600">{result.errors.type[0]}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="Tell us about your organization..."
                            />
                        </div>

                        {/* Website */}
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                Website
                            </label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="https://example.com"
                            />
                        </div>

                        {/* Industry */}
                        <div>
                            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                                Industry
                            </label>
                            <input
                                type="text"
                                id="industry"
                                name="industry"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="Technology, Healthcare, Education..."
                            />
                        </div>

                        {/* Size */}
                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                                Organization Size
                            </label>
                            <select
                                id="size"
                                name="size"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="">Select size</option>
                                {organizationSizes.map((size) => (
                                    <option key={size.value} value={size.value}>
                                        {size.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                Location
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="San Francisco, CA"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t">
                            <Link
                                href="/organizations"
                                className="text-sm font-medium text-gray-600 hover:text-gray-500"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Creating..." : "Create Organization"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
