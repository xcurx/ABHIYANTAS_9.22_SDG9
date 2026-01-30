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
                    className={`rounded-md p-4 ${
                        message.type === "success"
                            ? "bg-green-50 text-green-800"
                            : "bg-red-50 text-red-800"
                    }`}
                >
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            {/* Avatar */}
            <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt="Avatar"
                            className="h-20 w-20 object-cover"
                        />
                    ) : (
                        <span className="text-3xl font-bold text-indigo-600">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                        </span>
                    )}
                </div>
                <div>
                    <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                        Avatar URL
                    </label>
                    <input
                        type="url"
                        id="avatar"
                        name="avatar"
                        defaultValue={user.avatar || ""}
                        placeholder="https://example.com/avatar.jpg"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={user.name || ""}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            {/* Email (read-only) */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                </label>
                <input
                    type="email"
                    id="email"
                    value={user.email}
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Role (read-only) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <div className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                        {user.role}
                    </span>
                </div>
            </div>

            {/* Member Since */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="mt-1 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
                <Link
                    href="/dashboard"
                    className="text-sm font-medium text-gray-600 hover:text-gray-500"
                >
                    ← Back to Dashboard
                </Link>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    )
}
