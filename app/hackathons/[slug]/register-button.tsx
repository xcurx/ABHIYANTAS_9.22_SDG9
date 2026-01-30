"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { registerForHackathon, cancelRegistration } from "@/lib/actions/hackathon"

interface RegisterButtonProps {
    hackathonId: string
    canRegister: boolean
    isRegistered: boolean
    isLoggedIn: boolean
}

export default function RegisterButton({
    hackathonId,
    canRegister,
    isRegistered,
    isLoggedIn,
}: RegisterButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleRegister() {
        if (!isLoggedIn) {
            router.push(`/sign-in?callbackUrl=${window.location.pathname}`)
            return
        }

        setError(null)
        startTransition(async () => {
            const result = await registerForHackathon(hackathonId)
            if (!result.success) {
                setError(result.message || "Failed to register")
            } else {
                router.refresh()
            }
        })
    }

    async function handleCancel() {
        setError(null)
        startTransition(async () => {
            const result = await cancelRegistration(hackathonId)
            if (!result.success) {
                setError(result.message || "Failed to cancel registration")
            } else {
                router.refresh()
            }
        })
    }

    if (isRegistered) {
        return (
            <div>
                <button
                    onClick={handleCancel}
                    disabled={isPending}
                    className="w-full py-3 px-4 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                    {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                        </span>
                    ) : (
                        "Cancel Registration"
                    )}
                </button>
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            </div>
        )
    }

    if (!canRegister) {
        return (
            <button
                disabled
                className="w-full py-3 px-4 bg-gray-200 text-gray-500 font-medium rounded-lg cursor-not-allowed"
            >
                Registration Closed
            </button>
        )
    }

    return (
        <div>
            <button
                onClick={handleRegister}
                disabled={isPending}
                className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
                {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                    </span>
                ) : !isLoggedIn ? (
                    "Sign in to Register"
                ) : (
                    "Register Now"
                )}
            </button>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>
    )
}
