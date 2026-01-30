"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowRight, UserPlus, XCircle } from "lucide-react"
import { cancelRegistration } from "@/lib/actions/hackathon"

interface RegisterButtonProps {
    hackathonId: string
    hackathonSlug: string
    canRegister: boolean
    isRegistered: boolean
    isLoggedIn: boolean
}

export default function RegisterButton({
    hackathonId,
    hackathonSlug,
    canRegister,
    isRegistered,
    isLoggedIn,
}: RegisterButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    
    // Debug log
    console.log("RegisterButton props:", { hackathonId, hackathonSlug, canRegister, isRegistered, isLoggedIn })

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

    // If not logged in, redirect to sign-in page
    if (!isLoggedIn) {
        return (
            <Link
                href={`/sign-in?callbackUrl=/hackathons/${hackathonSlug}/register`}
                className="w-full py-3.5 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group"
            >
                Sign in to Register
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
        )
    }

    // Redirect to registration form page
    const registerUrl = `/hackathons/${hackathonSlug}/register`
    console.log("Register URL:", registerUrl)
    
    if (!hackathonSlug) {
        console.error("ERROR: hackathonSlug is missing!")
        return (
            <button
                disabled
                className="w-full py-3.5 px-4 bg-red-100 text-red-700 font-semibold rounded-xl cursor-not-allowed border border-red-200"
            >
                Error: Missing slug
            </button>
        )
    }
    
    return (
        <Link
            href={registerUrl}
            className="w-full py-3.5 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group"
        >
            <UserPlus className="h-4 w-4" />
            Apply Now
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
    )
}
