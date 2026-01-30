"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, Trash2, GripVertical, Building2 } from "lucide-react"
import Link from "next/link"
import { z } from "zod"
import { createHackathon } from "@/lib/actions/hackathon"
import { cn } from "@/lib/utils"

// Combined schema for the wizard
const hackathonWizardSchema = z.object({
    // Basic Info
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    shortDescription: z.string().max(200).optional(),
    description: z.string().min(50, "Description must be at least 50 characters"),
    type: z.enum(["OPEN", "INVITE_ONLY", "ORGANIZATION_ONLY"]),
    mode: z.enum(["VIRTUAL", "IN_PERSON", "HYBRID"]),

    // Schedule
    registrationStart: z.string().min(1, "Registration start date is required"),
    registrationEnd: z.string().min(1, "Registration end date is required"),
    hackathonStart: z.string().min(1, "Start date is required"),
    hackathonEnd: z.string().min(1, "End date is required"),

    // Config
    maxParticipants: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
        z.number().int().positive().optional()
    ),
    minTeamSize: z.coerce.number().int().min(1).default(1),
    maxTeamSize: z.coerce.number().int().min(1).default(4),
    registrationFee: z.coerce.number().nonnegative().default(0),
    currency: z.string().default("USD"),
    allowSoloParticipants: z.boolean().default(true),
    requireApproval: z.boolean().default(false),
    isPublic: z.boolean().default(true),
    prizePool: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
        z.number().nonnegative().optional()
    ),

    // Tracks
    tracks: z.array(z.object({
        name: z.string().min(2),
        description: z.string().optional(),
        color: z.string().default("#6366f1"),
        prizeAmount: z.coerce.number().nonnegative().optional().nullable(),
    })).default([]),

    // Prizes
    prizes: z.array(z.object({
        title: z.string().min(2),
        description: z.string().optional(),
        amount: z.coerce.number().nonnegative().optional().nullable(),
        position: z.coerce.number().int().positive(),
    })).default([]),
})

type WizardFormData = z.infer<typeof hackathonWizardSchema>

interface Organization {
    id: string
    name: string
    logo: string | null
}

const STEPS = [
    { id: 1, title: "Basic Info", description: "Name and description" },
    { id: 2, title: "Schedule", description: "Dates and timeline" },
    { id: 3, title: "Settings", description: "Team and participation" },
    { id: 4, title: "Tracks", description: "Categories and themes" },
    { id: 5, title: "Prizes", description: "Rewards and incentives" },
    { id: 6, title: "Review", description: "Final check" },
]

interface HackathonWizardProps {
    organizations: Organization[]
}

export default function HackathonWizard({ organizations }: HackathonWizardProps) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedOrgId, setSelectedOrgId] = useState<string>(organizations[0]?.id || "")

    const form = useForm<WizardFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(hackathonWizardSchema) as any,
        defaultValues: {
            type: "OPEN",
            mode: "VIRTUAL",
            minTeamSize: 1,
            maxTeamSize: 4,
            registrationFee: 0,
            currency: "USD",
            allowSoloParticipants: true,
            requireApproval: false,
            isPublic: true,
            tracks: [],
            prizes: [],
        },
        mode: "onChange",
    })

    const { register, handleSubmit, watch, setValue, formState: { errors } } = form
    const tracks = watch("tracks")
    const prizes = watch("prizes")

    // Debug: Log form errors when they exist
    console.log("Form errors:", errors)

    async function onSubmit(data: WizardFormData) {
        setIsSubmitting(true)
        setError(null)

        if (!selectedOrgId) {
            setError("Please select an organization")
            setIsSubmitting(false)
            return
        }

        try {
            const result = await createHackathon({
                ...data,
                slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                organizationId: selectedOrgId,
            })

            if (result.success && result.data) {
                router.push(`/hackathons/${(result.data as { slug: string }).slug}`)
            } else {
                setError(result.message || "Failed to create hackathon")
            }
        } catch {
            setError("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    function nextStep() {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    function addTrack() {
        setValue("tracks", [...tracks, { name: "", description: "", color: "#6366f1" }])
    }

    function removeTrack(index: number) {
        setValue("tracks", tracks.filter((_, i) => i !== index))
    }

    function addPrize() {
        setValue("prizes", [...prizes, { title: "", description: "", amount: 0, position: prizes.length + 1 }])
    }

    function removePrize(index: number) {
        setValue("prizes", prizes.filter((_, i) => i !== index))
    }

    if (organizations.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center animate-fade-in-up" style={{ animationFillMode: 'forwards', opacity: 0 }}>
                        <div className="h-20 w-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                            <Building2 className="h-10 w-10 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Organizations Found</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            You need to be an admin or owner of an organization to create hackathons. Create your organization first to get started.
                        </p>
                        <Link
                            href="/organizations/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-all duration-200"
                        >
                            <Plus className="h-5 w-5" />
                            Create Organization
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-blue-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full -translate-x-1/3 translate-y-1/3"></div>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
                    <Link href="/dashboard" className="inline-flex items-center text-sm text-blue-100 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards', opacity: 0 }}>Create a Hackathon</h1>
                    <p className="text-blue-100 mt-2 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0 }}>Set up your hackathon event in a few simple steps</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-6 pb-12">
                {/* Organization Selection */}
                {organizations.length > 1 && (
                    <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards', opacity: 0 }}>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Organizing as
                        </label>
                        <select
                            value={selectedOrgId}
                            onChange={(e) => setSelectedOrgId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        >
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards', opacity: 0 }}>
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(step.id)}
                                    className="flex flex-col items-center group"
                                >
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200",
                                            currentStep > step.id
                                                ? "bg-green-500 text-white"
                                                : currentStep === step.id
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                                        )}
                                    >
                                        {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                                    </div>
                                    <span className={cn(
                                        "text-xs mt-2 font-medium hidden sm:block transition-colors",
                                        currentStep === step.id ? "text-blue-600" : "text-gray-500"
                                    )}>{step.title}</span>
                                </button>
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={cn(
                                            "w-8 sm:w-16 h-1 mx-2 rounded-full transition-colors",
                                            currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                                        )}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards', opacity: 0 }}>
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <span className="text-xl">📝</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                                        <p className="text-sm text-gray-600">Tell us about your hackathon</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Hackathon Title *
                                    </label>
                                    <input
                                        {...register("title")}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                        placeholder="e.g., AI Innovation Challenge 2025"
                                    />
                                    {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Short Description
                                    </label>
                                    <input
                                        {...register("shortDescription")}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                        placeholder="A catchy one-liner that describes your hackathon"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">This appears in hackathon cards and previews</p>
                                    {errors.shortDescription && <p className="text-red-500 text-sm mt-2">{errors.shortDescription.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Full Description *
                                    </label>
                                    <textarea
                                        {...register("description")}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                                        placeholder="Describe your hackathon in detail. Include goals, themes, what participants can expect, and any important information..."
                                    />
                                    {errors.description && <p className="text-red-500 text-sm mt-2">{errors.description.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Hackathon Type *
                                        </label>
                                        <select
                                            {...register("type")}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                        >
                                            <option value="OPEN">🌍 Open to All</option>
                                            <option value="INVITE_ONLY">✉️ Invite Only</option>
                                            <option value="ORGANIZATION_ONLY">🏢 Organization Members Only</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-2">Who can register for this hackathon</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Event Mode *
                                        </label>
                                        <select
                                            {...register("mode")}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                        >
                                            <option value="VIRTUAL">🌐 Virtual</option>
                                            <option value="IN_PERSON">📍 In Person</option>
                                            <option value="HYBRID">🔄 Hybrid</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-2">How will participants join</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Schedule */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <span className="text-xl">📅</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Schedule</h2>
                                        <p className="text-sm text-gray-600">Set the timeline for your event</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                            <span className="text-white text-sm">📝</span>
                                        </div>
                                        <h3 className="font-semibold text-blue-900">Registration Period</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Registration Opens *
                                            </label>
                                            <input
                                                {...register("registrationStart")}
                                                type="datetime-local"
                                                className="w-full px-4 py-3 border border-blue-200 rounded-xl text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                            />
                                            {errors.registrationStart && <p className="text-red-500 text-sm mt-2">{errors.registrationStart.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Registration Closes *
                                            </label>
                                            <input
                                                {...register("registrationEnd")}
                                                type="datetime-local"
                                                className="w-full px-4 py-3 border border-blue-200 rounded-xl text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                            />
                                            {errors.registrationEnd && <p className="text-red-500 text-sm mt-2">{errors.registrationEnd.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                                            <span className="text-white text-sm">🚀</span>
                                        </div>
                                        <h3 className="font-semibold text-green-900">Hackathon Duration</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Date & Time *
                                            </label>
                                            <input
                                                {...register("hackathonStart")}
                                                type="datetime-local"
                                                className="w-full px-4 py-3 border border-green-200 rounded-xl text-gray-900 bg-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                                            />
                                            {errors.hackathonStart && <p className="text-red-500 text-sm mt-2">{errors.hackathonStart.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Date & Time *
                                            </label>
                                            <input
                                                {...register("hackathonEnd")}
                                                type="datetime-local"
                                                className="w-full px-4 py-3 border border-green-200 rounded-xl text-gray-900 bg-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                                            />
                                            {errors.hackathonEnd && <p className="text-red-500 text-sm mt-2">{errors.hackathonEnd.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Settings */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <span className="text-xl">⚙️</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Team & Participation Settings</h2>
                                        <p className="text-sm text-gray-600">Configure how participants can join</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Minimum Team Size
                                        </label>
                                        <input
                                            {...register("minTeamSize")}
                                            type="number"
                                            min={1}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Maximum Team Size
                                        </label>
                                        <input
                                            {...register("maxTeamSize")}
                                            type="number"
                                            min={1}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Maximum Total Participants
                                    </label>
                                    <input
                                        {...register("maxParticipants")}
                                        type="number"
                                        min={1}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                        placeholder="Leave empty for unlimited"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Set a cap on total registrations</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Total Prize Pool ($)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            {...register("prizePool")}
                                            type="number"
                                            min={0}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                            placeholder="0"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">The total value of all prizes combined</p>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-100">
                                    <h3 className="font-semibold text-gray-900">Additional Options</h3>
                                    
                                    <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input
                                            {...register("allowSoloParticipants")}
                                            type="checkbox"
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">Allow Solo Participants</span>
                                            <p className="text-xs text-gray-500">Individuals can participate without a team</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input
                                            {...register("requireApproval")}
                                            type="checkbox"
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">Require Registration Approval</span>
                                            <p className="text-xs text-gray-500">Manually approve each registration</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input
                                            {...register("isPublic")}
                                            type="checkbox"
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">List Publicly</span>
                                            <p className="text-xs text-gray-500">Show in the public hackathon directory</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Tracks */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <span className="text-xl">🎯</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Tracks</h2>
                                            <p className="text-sm text-gray-600">Define categories or themes for submissions</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addTrack}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 text-sm font-semibold transition-all duration-200"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Track
                                    </button>
                                </div>

                                {tracks.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl">🎯</span>
                                        </div>
                                        <p className="text-gray-600 font-medium">No tracks added yet</p>
                                        <p className="text-sm text-gray-500 mt-1">Tracks help organize submissions by category or theme</p>
                                        <button
                                            type="button"
                                            onClick={addTrack}
                                            className="mt-4 text-blue-600 font-medium text-sm hover:text-blue-500"
                                        >
                                            + Add your first track
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {tracks.map((track, index) => (
                                            <div key={index} className="flex gap-4 items-start p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                                                <div className="flex-1 space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Track Name</label>
                                                            <input
                                                                {...register(`tracks.${index}.name`)}
                                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                                                placeholder="e.g., AI/ML, Web3, Social Impact"
                                                            />
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <div className="flex-shrink-0">
                                                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Color</label>
                                                                <input
                                                                    {...register(`tracks.${index}.color`)}
                                                                    type="color"
                                                                    className="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Prize Amount ($)</label>
                                                                <input
                                                                    {...register(`tracks.${index}.prizeAmount`)}
                                                                    type="number"
                                                                    min={0}
                                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                                                        <textarea
                                                            {...register(`tracks.${index}.description`)}
                                                            rows={2}
                                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                                                            placeholder="What projects should be submitted to this track?"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTrack(index)}
                                                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 5: Prizes */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                            <span className="text-xl">🏆</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Prizes</h2>
                                            <p className="text-sm text-gray-600">Define rewards for winners</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addPrize}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 text-sm font-semibold transition-all duration-200"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Prize
                                    </button>
                                </div>

                                {prizes.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl">🏆</span>
                                        </div>
                                        <p className="text-gray-600 font-medium">No prizes added yet</p>
                                        <p className="text-sm text-gray-500 mt-1">Add prizes to attract more participants</p>
                                        <button
                                            type="button"
                                            onClick={addPrize}
                                            className="mt-4 text-blue-600 font-medium text-sm hover:text-blue-500"
                                        >
                                            + Add your first prize
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {prizes.map((prize, index) => (
                                            <div key={index} className="flex gap-4 items-start p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                                                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold">
                                                    #{index + 1}
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Prize Title</label>
                                                            <input
                                                                {...register(`prizes.${index}.title`)}
                                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                                                placeholder="e.g., 1st Place, Best Design"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount ($)</label>
                                                            <input
                                                                {...register(`prizes.${index}.amount`)}
                                                                type="number"
                                                                min={0}
                                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Position</label>
                                                            <input
                                                                {...register(`prizes.${index}.position`)}
                                                                type="number"
                                                                min={1}
                                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                                                placeholder="1"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Description (optional)</label>
                                                        <textarea
                                                            {...register(`prizes.${index}.description`)}
                                                            rows={2}
                                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                                                            placeholder="What does the winner receive?"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removePrize(index)}
                                                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 6: Review */}
                        {currentStep === 6 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                                        <span className="text-xl">✅</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Review & Create</h2>
                                        <p className="text-sm text-gray-600">Review your hackathon details before creating</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-200 overflow-hidden">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-sm">📝</span>
                                            </div>
                                            <h3 className="font-semibold text-blue-900">Basic Info</h3>
                                        </div>
                                        <dl className="space-y-3 text-sm">
                                            <div className="flex justify-between gap-2">
                                                <dt className="text-gray-600 flex-shrink-0">Title:</dt>
                                                <dd className="font-medium text-gray-900 truncate max-w-[180px]" title={watch("title") || "-"}>{watch("title") || "-"}</dd>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <dt className="text-gray-600 flex-shrink-0">Type:</dt>
                                                <dd className="text-gray-900 capitalize truncate">{watch("type")?.toLowerCase().replace("_", " ")}</dd>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <dt className="text-gray-600 flex-shrink-0">Mode:</dt>
                                                <dd className="text-gray-900 capitalize truncate">{watch("mode")?.toLowerCase().replace("_", " ")}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div className="bg-green-50 rounded-2xl p-5 border-2 border-green-200 overflow-hidden">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-sm">📅</span>
                                            </div>
                                            <h3 className="font-semibold text-green-900">Schedule</h3>
                                        </div>
                                        <dl className="space-y-3 text-sm">
                                            <div>
                                                <dt className="text-gray-600 mb-1">Registration Period:</dt>
                                                <dd className="font-medium text-gray-900 text-xs bg-white rounded-lg p-2 truncate" title={`${watch("registrationStart") || "-"} → ${watch("registrationEnd") || "-"}`}>
                                                    {watch("registrationStart")?.slice(0, 10) || "-"} → {watch("registrationEnd")?.slice(0, 10) || "-"}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-gray-600 mb-1">Event Duration:</dt>
                                                <dd className="font-medium text-gray-900 text-xs bg-white rounded-lg p-2 truncate" title={`${watch("hackathonStart") || "-"} → ${watch("hackathonEnd") || "-"}`}>
                                                    {watch("hackathonStart")?.slice(0, 10) || "-"} → {watch("hackathonEnd")?.slice(0, 10) || "-"}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-200 overflow-hidden">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-sm">⚙️</span>
                                            </div>
                                            <h3 className="font-semibold text-purple-900">Settings</h3>
                                        </div>
                                        <dl className="space-y-3 text-sm">
                                            <div className="flex justify-between gap-2 items-center bg-white rounded-lg p-2">
                                                <dt className="text-gray-600 flex-shrink-0">Team Size:</dt>
                                                <dd className="font-medium text-gray-900">{watch("minTeamSize")} - {watch("maxTeamSize")}</dd>
                                            </div>
                                            <div className="flex justify-between gap-2 items-center bg-white rounded-lg p-2">
                                                <dt className="text-gray-600 flex-shrink-0">Max Participants:</dt>
                                                <dd className="font-medium text-gray-900">{watch("maxParticipants") || "∞"}</dd>
                                            </div>
                                            <div className="flex justify-between gap-2 items-center bg-white rounded-lg p-2">
                                                <dt className="text-gray-600 flex-shrink-0">Prize Pool:</dt>
                                                <dd className="font-bold text-green-600">${watch("prizePool") || 0}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-200 overflow-hidden">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-8 w-8 rounded-lg bg-amber-600 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-sm">🏆</span>
                                            </div>
                                            <h3 className="font-semibold text-amber-900">Tracks & Prizes</h3>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1 bg-white rounded-xl p-3 text-center border border-amber-200">
                                                <p className="text-2xl font-bold text-gray-900">{tracks.length}</p>
                                                <p className="text-xs text-gray-600">Tracks</p>
                                            </div>
                                            <div className="flex-1 bg-white rounded-xl p-3 text-center border border-amber-200">
                                                <p className="text-2xl font-bold text-gray-900">{prizes.length}</p>
                                                <p className="text-xs text-gray-600">Prizes</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                                        <span className="text-lg">⚠️</span>
                                        {error}
                                    </div>
                                )}

                                <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3 border border-blue-100">
                                    <span className="text-lg">💡</span>
                                    <p className="text-sm text-blue-800">
                                        You can edit these details after creating the hackathon. Your hackathon will be saved as a draft until you publish it.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={cn(
                                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                                    currentStep === 1
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-gray-700 hover:bg-gray-100"
                                )}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Previous
                            </button>

                            {currentStep < STEPS.length ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-600/25"
                                >
                                    Next Step
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-500 text-sm font-semibold disabled:opacity-50 transition-all duration-200 shadow-lg shadow-green-600/25"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Create Hackathon
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
