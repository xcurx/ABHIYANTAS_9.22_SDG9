"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { updateProfile } from "@/lib/actions/user"

type UserRole = "SUPER_ADMIN" | "ORGANIZATION_ADMIN" | "MENTOR" | "JUDGE" | "PARTICIPANT" | "SPONSOR"

type User = {
    id: string
    name: string | null
    email: string
    avatar: string | null
    role: UserRole
    createdAt: Date
}

export default function ProfileForm({ user }: { user: User }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setMessage(null)

        const result = await updateProfile(formData)
        
        if (result.success) {
            setMessage({ type: "success", text: result.message })
            router.refresh()
        } else {
            setMessage({ type: "error", text: result.message })
        }

        setIsLoading(false)
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {message && (
                <div
                    className={`rounded-2xl p-4 flex items-start gap-3 ${
                        message.type === "success"
                            ? "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100"
                            : "bg-gradient-to-r from-red-50 to-rose-50 border border-red-100"
                    }`}
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        message.type === "success"
                            ? "bg-emerald-100"
                            : "bg-red-100"
                    }`}>
                        {message.type === "success" ? (
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                    <p className={`font-medium pt-2 ${
                        message.type === "success" ? "text-emerald-800" : "text-red-800"
                    }`}>
                        {message.text}
                    </p>
                </div>
            )}

            {/* Avatar URL */}
            <div>
                <label htmlFor="avatar" className="block text-sm font-semibold text-slate-700 mb-2">
                    Avatar URL
                </label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <input
                        type="url"
                        id="avatar"
                        name="avatar"
                        defaultValue={user.avatar || ""}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>
                <p className="mt-2 text-xs text-slate-500">Enter a URL to an image for your profile picture</p>
            </div>

            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={user.name || ""}
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            {/* Email (read-only) */}
            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                </label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <input
                        type="email"
                        id="email"
                        value={user.email}
                        disabled
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">Email cannot be changed</p>
            </div>

            {/* Role (read-only) */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 border border-indigo-100">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {user.role.replace(/_/g, ' ')}
                </span>
            </div>

            {/* Member Since */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Member Since</label>
                <p className="text-slate-600 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <Link
                    href="/dashboard"
                    className="text-slate-600 font-medium hover:text-indigo-600 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Link>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
