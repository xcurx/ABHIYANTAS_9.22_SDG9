"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight, UserPlus, XCircle } from "lucide-react"
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
                    className="w-full py-3.5 px-4 bg-red-50 text-red-700 font-semibold rounded-xl hover:bg-red-100 border border-red-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <XCircle className="h-4 w-4" />
                            Cancel Registration
                        </>
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
                className="w-full py-3.5 px-4 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed border border-gray-200"
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
                className="w-full py-3.5 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group"
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : !isLoggedIn ? (
                    <>
                        Sign in to Register
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                ) : (
                    <>
                        <UserPlus className="h-4 w-4" />
                        Register Now
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>
    )
}
