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
    maxParticipants: z.coerce.number().int().positive().optional().nullable(),
    minTeamSize: z.coerce.number().int().min(1).default(1),
    maxTeamSize: z.coerce.number().int().min(1).default(4),
    registrationFee: z.coerce.number().nonnegative().default(0),
    currency: z.string().default("USD"),
    allowSoloParticipants: z.boolean().default(true),
    requireApproval: z.boolean().default(false),
    isPublic: z.boolean().default(true),
    prizePool: z.coerce.number().nonnegative().optional().nullable(),

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
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Organizations Found</h2>
                        <p className="text-gray-600 mb-6">
                            You need to be an admin or owner of an organization to create hackathons.
                        </p>
                        <Link
                            href="/organizations/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Create Organization
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/hackathons" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to hackathons
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Create a Hackathon</h1>
                    <p className="text-gray-600 mt-1">Set up your hackathon in a few simple steps</p>
                </div>

                {/* Organization Selection */}
                {organizations.length > 1 && (
                    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Organizing as
                        </label>
                        <select
                            value={selectedOrgId}
                            onChange={(e) => setSelectedOrgId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                        >
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                                            currentStep > step.id
                                                ? "bg-green-500 text-white"
                                                : currentStep === step.id
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-gray-200 text-gray-600"
                                        )}
                                    >
                                        {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                                    </div>
                                    <span className="text-xs mt-1 text-gray-600 hidden sm:block">{step.title}</span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={cn(
                                            "w-12 sm:w-20 h-1 mx-2",
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hackathon Title *
                                    </label>
                                    <input
                                        {...register("title")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g., AI Innovation Challenge 2025"
                                    />
                                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Short Description
                                    </label>
                                    <input
                                        {...register("shortDescription")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="A short catchy phrase for your hackathon"
                                    />
                                    {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description *
                                    </label>
                                    <textarea
                                        {...register("description")}
                                        rows={5}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Describe your hackathon, its goals, themes, and what participants can expect..."
                                    />
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Type *
                                        </label>
                                        <select
                                            {...register("type")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="OPEN">Open to All</option>
                                            <option value="INVITE_ONLY">Invite Only</option>
                                            <option value="ORGANIZATION_ONLY">Organization Members Only</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mode *
                                        </label>
                                        <select
                                            {...register("mode")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="VIRTUAL">Virtual</option>
                                            <option value="IN_PERSON">In Person</option>
                                            <option value="HYBRID">Hybrid</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Schedule */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Schedule</h2>

                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h3 className="font-medium text-blue-900 mb-3">Registration Period</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Registration Opens *
                                            </label>
                                            <input
                                                {...register("registrationStart")}
                                                type="datetime-local"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {errors.registrationStart && <p className="text-red-500 text-sm mt-1">{errors.registrationStart.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Registration Closes *
                                            </label>
                                            <input
                                                {...register("registrationEnd")}
                                                type="datetime-local"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {errors.registrationEnd && <p className="text-red-500 text-sm mt-1">{errors.registrationEnd.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-4">
                                    <h3 className="font-medium text-purple-900 mb-3">Hackathon Duration</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Date *
                                            </label>
                                            <input
                                                {...register("hackathonStart")}
                                                type="datetime-local"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {errors.hackathonStart && <p className="text-red-500 text-sm mt-1">{errors.hackathonStart.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                End Date *
                                            </label>
                                            <input
                                                {...register("hackathonEnd")}
                                                type="datetime-local"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {errors.hackathonEnd && <p className="text-red-500 text-sm mt-1">{errors.hackathonEnd.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Settings */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Team & Participation Settings</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Minimum Team Size
                                        </label>
                                        <input
                                            {...register("minTeamSize")}
                                            type="number"
                                            min={1}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Maximum Team Size
                                        </label>
                                        <input
                                            {...register("maxTeamSize")}
                                            type="number"
                                            min={1}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Maximum Participants (leave empty for unlimited)
                                    </label>
                                    <input
                                        {...register("maxParticipants")}
                                        type="number"
                                        min={1}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Unlimited"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Prize Pool ($)
                                    </label>
                                    <input
                                        {...register("prizePool")}
                                        type="number"
                                        min={0}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-4 pt-4">
                                    <label className="flex items-center gap-3">
                                        <input
                                            {...register("allowSoloParticipants")}
                                            type="checkbox"
                                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">Allow individual participation (teams of 1)</span>
                                    </label>

                                    <label className="flex items-center gap-3">
                                        <input
                                            {...register("requireApproval")}
                                            type="checkbox"
                                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">Require approval for registrations</span>
                                    </label>

                                    <label className="flex items-center gap-3">
                                        <input
                                            {...register("isPublic")}
                                            type="checkbox"
                                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">List publicly (visible in hackathon directory)</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Tracks */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">Tracks</h2>
                                        <p className="text-sm text-gray-600">Define categories or themes for submissions</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addTrack}
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Track
                                    </button>
                                </div>

                                {tracks.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <p className="text-gray-600">No tracks added yet</p>
                                        <p className="text-sm text-gray-500 mt-1">Tracks are optional but help organize submissions</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {tracks.map((track, index) => (
                                            <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                                                <GripVertical className="h-5 w-5 text-gray-400 mt-2 cursor-move" />
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <input
                                                            {...register(`tracks.${index}.name`)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            placeholder="Track Name"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <input
                                                            {...register(`tracks.${index}.color`)}
                                                            type="color"
                                                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                                        />
                                                        <input
                                                            {...register(`tracks.${index}.prizeAmount`)}
                                                            type="number"
                                                            min={0}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            placeholder="Prize Amount"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <textarea
                                                            {...register(`tracks.${index}.description`)}
                                                            rows={2}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            placeholder="Track description..."
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTrack(index)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
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
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">Prizes</h2>
                                        <p className="text-sm text-gray-600">Define rewards for winners</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addPrize}
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Prize
                                    </button>
                                </div>

                                {prizes.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <p className="text-gray-600">No prizes added yet</p>
                                        <p className="text-sm text-gray-500 mt-1">Add prizes to attract participants</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {prizes.map((prize, index) => (
                                            <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                                                <GripVertical className="h-5 w-5 text-gray-400 mt-2 cursor-move" />
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div>
                                                        <input
                                                            {...register(`prizes.${index}.title`)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            placeholder="Prize Title (e.g., 1st Place)"
                                                        />
                                                    </div>
                                                    <div>
                                                        <input
                                                            {...register(`prizes.${index}.amount`)}
                                                            type="number"
                                                            min={0}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            placeholder="Amount ($)"
                                                        />
                                                    </div>
                                                    <div>
                                                        <input
                                                            {...register(`prizes.${index}.position`)}
                                                            type="number"
                                                            min={1}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            placeholder="Position"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-3">
                                                        <textarea
                                                            {...register(`prizes.${index}.description`)}
                                                            rows={2}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            placeholder="Prize description..."
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removePrize(index)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
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
                                <h2 className="text-xl font-semibold text-gray-900">Review & Create</h2>
                                <p className="text-gray-600">Review your hackathon details before creating</p>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Basic Info</h3>
                                        <dl className="grid grid-cols-2 gap-2 text-sm">
                                            <dt className="text-gray-600">Title:</dt>
                                            <dd className="font-medium">{watch("title") || "-"}</dd>
                                            <dt className="text-gray-600">Type:</dt>
                                            <dd>{watch("type")}</dd>
                                            <dt className="text-gray-600">Mode:</dt>
                                            <dd>{watch("mode")}</dd>
                                        </dl>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Schedule</h3>
                                        <dl className="grid grid-cols-2 gap-2 text-sm">
                                            <dt className="text-gray-600">Registration:</dt>
                                            <dd>{watch("registrationStart") || "-"} to {watch("registrationEnd") || "-"}</dd>
                                            <dt className="text-gray-600">Event:</dt>
                                            <dd>{watch("hackathonStart") || "-"} to {watch("hackathonEnd") || "-"}</dd>
                                        </dl>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Settings</h3>
                                        <dl className="grid grid-cols-2 gap-2 text-sm">
                                            <dt className="text-gray-600">Team Size:</dt>
                                            <dd>{watch("minTeamSize")} - {watch("maxTeamSize")} members</dd>
                                            <dt className="text-gray-600">Max Participants:</dt>
                                            <dd>{watch("maxParticipants") || "Unlimited"}</dd>
                                            <dt className="text-gray-600">Prize Pool:</dt>
                                            <dd>${watch("prizePool") || 0}</dd>
                                        </dl>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Tracks & Prizes</h3>
                                        <p className="text-sm text-gray-600">
                                            {tracks.length} track(s), {prizes.length} prize(s)
                                        </p>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                    currentStep === 1
                                        ? "text-gray-400 cursor-not-allowed"
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
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                                >
                                    Next
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:opacity-50"
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
