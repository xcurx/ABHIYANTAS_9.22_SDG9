"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, Filter, X } from "lucide-react"
import { useState, useTransition, Suspense } from "react"

const statusOptions = [
    { value: "", label: "All Status" },
    { value: "REGISTRATION_OPEN", label: "Registration Open" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "UPCOMING", label: "Upcoming" },
]

const typeOptions = [
    { value: "", label: "All Types" },
    { value: "OPEN", label: "Open" },
    { value: "INVITE_ONLY", label: "Invite Only" },
    { value: "ORGANIZATION_ONLY", label: "Organization Only" },
]

const modeOptions = [
    { value: "", label: "All Modes" },
    { value: "VIRTUAL", label: "Virtual" },
    { value: "IN_PERSON", label: "In Person" },
    { value: "HYBRID", label: "Hybrid" },
]

function HackathonFiltersInner() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [search, setSearch] = useState(searchParams.get("search") || "")

    const currentStatus = searchParams.get("status") || ""
    const currentType = searchParams.get("type") || ""
    const currentMode = searchParams.get("mode") || ""

    const hasFilters = currentStatus || currentType || currentMode || search

    function updateParams(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        params.delete("page") // Reset to page 1 when filtering

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`)
        })
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        updateParams("search", search)
    }

    function clearFilters() {
        setSearch("")
        startTransition(() => {
            router.push(pathname)
        })
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search hackathons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </form>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <select
                        value={currentStatus}
                        onChange={(e) => updateParams("status", e.target.value)}
                        disabled={isPending}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={currentType}
                        onChange={(e) => updateParams("type", e.target.value)}
                        disabled={isPending}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {typeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={currentMode}
                        onChange={(e) => updateParams("mode", e.target.value)}
                        disabled={isPending}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {modeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            disabled={isPending}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                            <X className="h-4 w-4" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Active Filters Tags */}
            {hasFilters && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {currentStatus && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            Status: {statusOptions.find((o) => o.value === currentStatus)?.label}
                            <button onClick={() => updateParams("status", "")} className="hover:text-indigo-900">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {currentType && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            Type: {typeOptions.find((o) => o.value === currentType)?.label}
                            <button onClick={() => updateParams("type", "")} className="hover:text-indigo-900">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {currentMode && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            Mode: {modeOptions.find((o) => o.value === currentMode)?.label}
                            <button onClick={() => updateParams("mode", "")} className="hover:text-indigo-900">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {search && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            Search: {search}
                            <button onClick={() => { setSearch(""); updateParams("search", "") }} className="hover:text-indigo-900">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}

            {isPending && (
                <div className="mt-2 text-sm text-gray-500">Loading...</div>
            )}
        </div>
    )
}

export default function HackathonFilters() {
    return (
        <Suspense fallback={<div className="h-16 bg-white rounded-lg animate-pulse" />}>
            <HackathonFiltersInner />
        </Suspense>
    )
}
