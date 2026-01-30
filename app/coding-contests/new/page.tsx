"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createCodingContest } from "@/lib/actions/coding-contest"
import type { CreateCodingContestInput } from "@/lib/validations/coding-contest"

type Step = 1 | 2 | 3 | 4

interface Organization {
    id: string
    name: string
    slug: string
}

interface NewContestPageProps {
    organizations: Organization[]
}

function NewContestForm({ organizations }: NewContestPageProps) {
    const router = useRouter()
    const [step, setStep] = useState<Step>(1)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string[]>>({})

    const [formData, setFormData] = useState<Partial<CreateCodingContestInput>>({
        title: "",
        slug: "",
        description: "",
        shortDescription: "",
        organizationId: organizations[0]?.id || "",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // Tomorrow + 1 hour
        duration: 60,
        visibility: "PUBLIC",
        allowLateJoin: false,
        shuffleQuestions: true,
        showLeaderboard: true,
        showScoresDuring: false,
        proctorEnabled: true,
        fullScreenRequired: true,
        tabSwitchLimit: 3,
        copyPasteDisabled: true,
        webcamRequired: false,
        negativeMarking: false,
        negativePercent: 25,
        partialScoring: true,
    })

    function generateSlug(title: string) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim()
    }

    function updateField<K extends keyof CreateCodingContestInput>(
        field: K,
        value: CreateCodingContestInput[K]
    ) {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (field === "title") {
            setFormData((prev) => ({ ...prev, slug: generateSlug(value as string) }))
        }
    }

    async function handleSubmit() {
        setIsLoading(true)
        setError(null)
        setErrors({})

        const result = await createCodingContest(formData as CreateCodingContestInput)

        if (result.success && result.data) {
            router.push(`/coding-contests/${result.data.slug}/manage`)
        } else {
            setError(result.message)
            if (result.errors) {
                setErrors(result.errors)
            }
        }

        setIsLoading(false)
    }

    function formatDateTimeLocal(date: Date) {
        const d = new Date(date)
        return d.toISOString().slice(0, 16)
    }

    const steps = [
        { num: 1, title: "Basic Info", icon: "📝" },
        { num: 2, title: "Schedule", icon: "📅" },
        { num: 3, title: "Settings", icon: "⚙️" },
        { num: 4, title: "Proctoring", icon: "🔒" },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
                    <Link href="/coding-contests" className="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Contests
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Create New Contest</h1>
                    <p className="text-gray-400 mt-1">Set up a competitive coding contest for your organization</p>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((s, i) => (
                            <div key={s.num} className="flex items-center">
                                <button
                                    onClick={() => setStep(s.num as Step)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                        step === s.num
                                            ? "bg-purple-600 text-white"
                                            : step > s.num
                                            ? "bg-green-600/20 text-green-400 border border-green-500/30"
                                            : "bg-white/5 text-gray-400"
                                    }`}
                                >
                                    <span className="text-lg">{s.icon}</span>
                                    <span className="hidden sm:inline font-medium">{s.title}</span>
                                    <span className="sm:hidden font-medium">{s.num}</span>
                                </button>
                                {i < steps.length - 1 && (
                                    <div className={`w-8 md:w-16 h-0.5 mx-2 ${step > s.num ? "bg-green-500" : "bg-white/10"}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
                            </div>

                            {/* Organization */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Organization *
                                </label>
                                <select
                                    value={formData.organizationId}
                                    onChange={(e) => updateField("organizationId", e.target.value)}
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                >
                                    {organizations.map((org) => (
                                        <option key={org.id} value={org.id} className="bg-slate-800">
                                            {org.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.organizationId && (
                                    <p className="mt-1 text-sm text-red-400">{errors.organizationId[0]}</p>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Contest Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                    placeholder="e.g., Weekly Coding Challenge #1"
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-400">{errors.title[0]}</p>
                                )}
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    URL Slug
                                </label>
                                <div className="flex rounded-lg overflow-hidden">
                                    <span className="inline-flex items-center bg-white/5 border border-r-0 border-white/20 px-4 text-gray-400 text-sm">
                                        /coding-contests/
                                    </span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => updateField("slug", e.target.value)}
                                        className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                    />
                                </div>
                                {errors.slug && (
                                    <p className="mt-1 text-sm text-red-400">{errors.slug[0]}</p>
                                )}
                            </div>

                            {/* Short Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Short Description
                                </label>
                                <input
                                    type="text"
                                    value={formData.shortDescription || ""}
                                    onChange={(e) => updateField("shortDescription", e.target.value)}
                                    placeholder="A brief tagline for the contest"
                                    maxLength={200}
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Full Description
                                </label>
                                <textarea
                                    value={formData.description || ""}
                                    onChange={(e) => updateField("description", e.target.value)}
                                    placeholder="Describe the contest, rules, prizes, etc. (Markdown supported)"
                                    rows={6}
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Schedule */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-4">Schedule & Timing</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Start Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Start Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formatDateTimeLocal(formData.startTime as Date)}
                                        onChange={(e) => updateField("startTime", new Date(e.target.value))}
                                        className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                    />
                                    {errors.startTime && (
                                        <p className="mt-1 text-sm text-red-400">{errors.startTime[0]}</p>
                                    )}
                                </div>

                                {/* End Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        End Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formatDateTimeLocal(formData.endTime as Date)}
                                        onChange={(e) => updateField("endTime", new Date(e.target.value))}
                                        className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                    />
                                    {errors.endTime && (
                                        <p className="mt-1 text-sm text-red-400">{errors.endTime[0]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Contest Duration (minutes) *
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    The time each participant has to complete the contest after starting
                                </p>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => updateField("duration", parseInt(e.target.value))}
                                    min={5}
                                    max={600}
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                />
                                {errors.duration && (
                                    <p className="mt-1 text-sm text-red-400">{errors.duration[0]}</p>
                                )}
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    Contest Visibility
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { value: "PUBLIC", label: "Public", icon: "🌍" },
                                        { value: "PRIVATE", label: "Private", icon: "🔒" },
                                        { value: "INVITE_ONLY", label: "Invite Only", icon: "📧" },
                                        { value: "ORGANIZATION_ONLY", label: "Org Only", icon: "🏢" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => updateField("visibility", opt.value as "PUBLIC" | "PRIVATE" | "INVITE_ONLY" | "ORGANIZATION_ONLY")}
                                            className={`p-4 rounded-lg border text-center transition-all ${
                                                formData.visibility === opt.value
                                                    ? "bg-purple-600/30 border-purple-500 text-white"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                                            }`}
                                        >
                                            <span className="text-2xl block mb-1">{opt.icon}</span>
                                            <span className="text-sm font-medium">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Max Participants */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Max Participants (optional)
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxParticipants || ""}
                                    onChange={(e) => updateField("maxParticipants", e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="Leave empty for unlimited"
                                    min={1}
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Settings */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-4">Contest Settings</h2>
                            </div>

                            {/* Toggle Options */}
                            <div className="space-y-4">
                                {[
                                    { key: "allowLateJoin", label: "Allow Late Join", desc: "Let participants start after contest begins" },
                                    { key: "shuffleQuestions", label: "Shuffle Questions", desc: "Randomize question order for each participant" },
                                    { key: "showLeaderboard", label: "Show Leaderboard", desc: "Display live leaderboard during contest" },
                                    { key: "showScoresDuring", label: "Show Scores During Contest", desc: "Let participants see their scores while competing" },
                                    { key: "partialScoring", label: "Partial Scoring", desc: "Award partial points for partially correct solutions" },
                                    { key: "negativeMarking", label: "Negative Marking", desc: "Deduct points for wrong answers" },
                                ].map((option) => (
                                    <div
                                        key={option.key}
                                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                                    >
                                        <div>
                                            <h4 className="font-medium text-white">{option.label}</h4>
                                            <p className="text-sm text-gray-400">{option.desc}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateField(
                                                    option.key as keyof CreateCodingContestInput,
                                                    !formData[option.key as keyof typeof formData]
                                                )
                                            }
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                formData[option.key as keyof typeof formData]
                                                    ? "bg-purple-600"
                                                    : "bg-gray-600"
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    formData[option.key as keyof typeof formData]
                                                        ? "translate-x-6"
                                                        : "translate-x-1"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Negative Marking Percentage */}
                            {formData.negativeMarking && (
                                <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                                    <label className="block text-sm font-medium text-yellow-400 mb-2">
                                        Negative Marking Percentage
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            value={formData.negativePercent}
                                            onChange={(e) => updateField("negativePercent", parseInt(e.target.value))}
                                            min={0}
                                            max={100}
                                            className="flex-1"
                                        />
                                        <span className="text-white font-mono">{formData.negativePercent}%</span>
                                    </div>
                                    <p className="text-xs text-yellow-400/80 mt-2">
                                        Wrong answers will deduct {formData.negativePercent}% of the question&apos;s points
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Proctoring */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-2">Proctoring Settings</h2>
                                <p className="text-gray-400 text-sm">
                                    Configure anti-cheating measures for the contest
                                </p>
                            </div>

                            {/* Master Toggle */}
                            <div className="p-4 rounded-lg bg-purple-600/20 border border-purple-500/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-white flex items-center gap-2">
                                            <span className="text-xl">🔒</span> Enable Proctoring
                                        </h4>
                                        <p className="text-sm text-gray-400">Turn on anti-cheating features</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateField("proctorEnabled", !formData.proctorEnabled)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            formData.proctorEnabled ? "bg-purple-600" : "bg-gray-600"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                formData.proctorEnabled ? "translate-x-6" : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {formData.proctorEnabled && (
                                <div className="space-y-4">
                                    {/* Proctoring Options */}
                                    {[
                                        { key: "fullScreenRequired", label: "Full Screen Mode", desc: "Force participants to use full screen", icon: "🖥️" },
                                        { key: "copyPasteDisabled", label: "Disable Copy/Paste", desc: "Prevent copying and pasting text", icon: "📋" },
                                        { key: "webcamRequired", label: "Webcam Required", desc: "Require webcam access (advanced)", icon: "📷" },
                                    ].map((option) => (
                                        <div
                                            key={option.key}
                                            className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{option.icon}</span>
                                                <div>
                                                    <h4 className="font-medium text-white">{option.label}</h4>
                                                    <p className="text-sm text-gray-400">{option.desc}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateField(
                                                        option.key as keyof CreateCodingContestInput,
                                                        !formData[option.key as keyof typeof formData]
                                                    )
                                                }
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    formData[option.key as keyof typeof formData]
                                                        ? "bg-purple-600"
                                                        : "bg-gray-600"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        formData[option.key as keyof typeof formData]
                                                            ? "translate-x-6"
                                                            : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Tab Switch Limit */}
                                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-xl">🔄</span>
                                            <div>
                                                <h4 className="font-medium text-white">Tab Switch Limit</h4>
                                                <p className="text-sm text-gray-400">
                                                    Number of times a participant can switch tabs before disqualification
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                value={formData.tabSwitchLimit}
                                                onChange={(e) => updateField("tabSwitchLimit", parseInt(e.target.value))}
                                                min={0}
                                                max={20}
                                                className="flex-1"
                                            />
                                            <span className="text-white font-mono bg-white/10 px-3 py-1 rounded">
                                                {formData.tabSwitchLimit}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Set to 0 to disqualify on first tab switch
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/10">
                        <button
                            type="button"
                            onClick={() => setStep((prev) => (prev - 1) as Step)}
                            disabled={step === 1}
                            className="px-6 py-3 rounded-lg text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Previous
                        </button>

                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={() => setStep((prev) => (prev + 1) as Step)}
                                className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors"
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating...
                                    </span>
                                ) : (
                                    "Create Contest 🚀"
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function NewContestPage() {
    // This will be replaced with actual data fetching
    return <NewContestPageWrapper />
}

// Wrapper to fetch organizations
import { getUserOrganizations } from "@/lib/actions/organization"
import { useEffect } from "react"

function NewContestPageWrapper() {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function fetchOrgs() {
            const result = await getUserOrganizations()
            if (result.success && result.organizations) {
                // Filter to only admin orgs
                const adminOrgs = result.organizations.filter(
                    (org: { role: string }) => org.role === "OWNER" || org.role === "ADMIN"
                )
                if (adminOrgs.length === 0) {
                    router.push("/organizations/new?redirect=coding-contests/new")
                } else {
                    setOrganizations(adminOrgs)
                }
            }
            setLoading(false)
        }
        fetchOrgs()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    return <NewContestForm organizations={organizations} />
}
