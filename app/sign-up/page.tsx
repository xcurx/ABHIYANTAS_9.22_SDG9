"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { registerUser, type ActionResult } from "@/lib/actions/auth"

export default function SignUpPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<ActionResult | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setResult(null)
        
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        
        const response = await registerUser(formData)
        setResult(response)
        
        if (response.success) {
            // Auto sign-in after registration (development mode)
            const signInResult = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })
            
            if (signInResult?.ok) {
                router.push("/dashboard")
                router.refresh()
            } else {
                // Fallback to sign-in page if auto-login fails
                router.push("/sign-in?registered=true")
            }
        }
        
        setIsLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join the Industry-Academia Innovation Hub
                    </p>
                </div>

                {result && (
                    <div
                        className={`rounded-md p-4 ${
                            result.success
                                ? "bg-green-50 text-green-800"
                                : "bg-red-50 text-red-800"
                        }`}
                    >
                        <p className="text-sm font-medium">{result.message}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" action={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="John Doe"
                            />
                            {result?.errors?.name && (
                                <p className="mt-1 text-sm text-red-600">{result.errors.name[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="you@example.com"
                            />
                            {result?.errors?.email && (
                                <p className="mt-1 text-sm text-red-600">{result.errors.email[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                            {result?.errors?.password && (
                                <p className="mt-1 text-sm text-red-600">{result.errors.password[0]}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Must be at least 8 characters with uppercase, lowercase, and number
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                            {result?.errors?.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{result.errors.confirmPassword[0]}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Creating account..." : "Create account"}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Already have an account? </span>
                        <Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
