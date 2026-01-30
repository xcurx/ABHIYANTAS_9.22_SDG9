"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
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
        params.delete("page")

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
        <div className="glass-card rounded-2xl p-5">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search hackathons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>
                </form>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <select
                            value={currentStatus}
                            onChange={(e) => updateParams("status", e.target.value)}
                            disabled={isPending}
                            className="appearance-none px-4 py-3 pr-10 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-100/50"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    <div className="relative">
                        <select
                            value={currentType}
                            onChange={(e) => updateParams("type", e.target.value)}
                            disabled={isPending}
                            className="appearance-none px-4 py-3 pr-10 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-100/50"
                        >
                            {typeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    <div className="relative">
                        <select
                            value={currentMode}
                            onChange={(e) => updateParams("mode", e.target.value)}
                            disabled={isPending}
                            className="appearance-none px-4 py-3 pr-10 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-100/50"
                        >
                            {modeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            disabled={isPending}
                            className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-2 rounded-xl hover:bg-indigo-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Active Filters Tags */}
            {hasFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {currentStatus && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 text-xs font-semibold rounded-full border border-indigo-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            {statusOptions.find((o) => o.value === currentStatus)?.label}
                            <button 
                                onClick={() => updateParams("status", "")} 
                                className="hover:text-indigo-800 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    )}
                    {currentType && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-600 text-xs font-semibold rounded-full border border-violet-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                            {typeOptions.find((o) => o.value === currentType)?.label}
                            <button 
                                onClick={() => updateParams("type", "")} 
                                className="hover:text-violet-800 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    )}
                    {currentMode && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {modeOptions.find((o) => o.value === currentMode)?.label}
                            <button 
                                onClick={() => updateParams("mode", "")} 
                                className="hover:text-emerald-800 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    )}
                    {search && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 text-xs font-semibold rounded-full border border-amber-100">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            "{search}"
                            <button 
                                onClick={() => { setSearch(""); updateParams("search", "") }} 
                                className="hover:text-amber-800 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    )}
                </div>
            )}

            {isPending && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Loading...
                </div>
            )}
        </div>
    )
}

export default function HackathonFilters() {
    return (
        <Suspense fallback={
            <div className="glass-card rounded-2xl h-16 animate-pulse" />
        }>
            <HackathonFiltersInner />
        </Suspense>
    )
}
