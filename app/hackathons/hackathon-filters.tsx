"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, Filter, X, SlidersHorizontal, ChevronDown } from "lucide-react"
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

const sortOptions = [
    { value: "", label: "Most Recent" },
    { value: "date_asc", label: "Starting Soon" },
    { value: "prize_desc", label: "Highest Prize" },
    { value: "participants", label: "Most Popular" },
]

function HackathonFiltersInner() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [showFilters, setShowFilters] = useState(false)

    const [search, setSearch] = useState(searchParams.get("search") || "")

    const currentStatus = searchParams.get("status") || ""
    const currentType = searchParams.get("type") || ""
    const currentMode = searchParams.get("mode") || ""
    const currentSort = searchParams.get("sort") || ""

    const hasFilters = currentStatus || currentType || currentMode || search
    const activeFilterCount = [currentStatus, currentType, currentMode].filter(Boolean).length

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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search hackathons by name, topic, or organization..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => { setSearch(""); updateParams("search", "") }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </form>

                {/* Filter Toggle (Mobile) */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Filters (Desktop always visible, Mobile toggle) */}
                <div className={`flex flex-wrap gap-3 ${showFilters ? 'flex' : 'hidden lg:flex'}`}>
                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={currentSort}
                            onChange={(e) => updateParams("sort", e.target.value)}
                            disabled={isPending}
                            className="appearance-none px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 cursor-pointer"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Status */}
                    <div className="relative">
                        <select
                            value={currentStatus}
                            onChange={(e) => updateParams("status", e.target.value)}
                            disabled={isPending}
                            className={`appearance-none px-4 py-3 pr-10 border rounded-xl text-sm font-medium bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                currentStatus 
                                    ? "border-blue-200 text-blue-700 bg-blue-50" 
                                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Type */}
                    <div className="relative">
                        <select
                            value={currentType}
                            onChange={(e) => updateParams("type", e.target.value)}
                            disabled={isPending}
                            className={`appearance-none px-4 py-3 pr-10 border rounded-xl text-sm font-medium bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                currentType 
                                    ? "border-blue-200 text-blue-700 bg-blue-50" 
                                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            {typeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Mode */}
                    <div className="relative">
                        <select
                            value={currentMode}
                            onChange={(e) => updateParams("mode", e.target.value)}
                            disabled={isPending}
                            className={`appearance-none px-4 py-3 pr-10 border rounded-xl text-sm font-medium bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                currentMode 
                                    ? "border-blue-200 text-blue-700 bg-blue-50" 
                                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            {modeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            disabled={isPending}
                            className="px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors"
                        >
                            <X className="h-4 w-4" />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Active Filters Tags */}
            {hasFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500 mr-2">Active filters:</span>
                    {currentStatus && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                            {statusOptions.find((o) => o.value === currentStatus)?.label}
                            <button onClick={() => updateParams("status", "")} className="hover:text-blue-900 transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {currentType && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                            {typeOptions.find((o) => o.value === currentType)?.label}
                            <button onClick={() => updateParams("type", "")} className="hover:text-blue-900 transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {currentMode && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                            {modeOptions.find((o) => o.value === currentMode)?.label}
                            <button onClick={() => updateParams("mode", "")} className="hover:text-blue-900 transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {search && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            &quot;{search}&quot;
                            <button onClick={() => { setSearch(""); updateParams("search", "") }} className="hover:text-gray-900 transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}

            {isPending && (
                <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                    <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Updating results...
                </div>
            )}
        </div>
    )
}

export default function HackathonFilters() {
    return (
        <Suspense fallback={<div className="h-20 bg-white rounded-2xl animate-pulse shadow-sm" />}>
            <HackathonFiltersInner />
        </Suspense>
    )
}
