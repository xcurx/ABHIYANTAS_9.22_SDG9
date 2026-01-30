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

    async function handleOAuthSignIn(provider: "google" | "github") {
        setIsLoading(true)
        await signIn(provider, { callbackUrl: "/dashboard" })
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                
                <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards', opacity: 0 }}>
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-lg">E</span>
                        </div>
                        <span className="font-bold text-2xl text-white">ELEVATE</span>
                    </Link>

                    {/* Main Heading */}
                    <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0 }}>
                        Start Building<br />
                        <span className="text-blue-200">Your Future Today</span>
                    </h1>
                    
                    <p className="text-blue-100 text-lg mb-10 max-w-md animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards', opacity: 0 }}>
                        Join thousands of innovators creating solutions that make a difference. Your next breakthrough starts here.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards', opacity: 0 }}>
                        <div>
                            <p className="text-3xl font-bold text-white">10K+</p>
                            <p className="text-blue-200 text-sm">Active Users</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">500+</p>
                            <p className="text-blue-200 text-sm">Hackathons</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">$1M+</p>
                            <p className="text-blue-200 text-sm">Prizes Won</p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards', opacity: 0 }}>
                        <div className="flex items-center gap-3 text-white">
                            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span>Create and manage hackathons</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <span>Build your dream team</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <span>Win prizes and recognition</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 text-center animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards', opacity: 0 }}>
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">E</span>
                            </div>
                            <span className="font-bold text-2xl text-blue-600">ELEVATE</span>
                        </Link>
                    </div>

                    <div className="animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0 }}>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Create your account
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Get started with ELEVATE in minutes
                        </p>
                    </div>

                    {result && !result.success && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-red-800">{result.message}</p>
                            </div>
                        </div>
                    )}

                    {/* OAuth Buttons */}
                    <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards', opacity: 0 }}>
                        <button
                            type="button"
                            onClick={() => handleOAuthSignIn("google")}
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>

                        <button
                            type="button"
                            onClick={() => handleOAuthSignIn("github")}
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                            </svg>
                            Continue with GitHub
                        </button>
                    </div>

                    <div className="relative my-8 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards', opacity: 0 }}>
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-4 text-gray-500">Or continue with email</span>
                        </div>
                    </div>

                    <form className="space-y-4 animate-fade-in-up" action={handleSubmit} style={{ animationDelay: '0.5s', animationFillMode: 'forwards', opacity: 0 }}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                placeholder="John Doe"
                            />
                            {result?.errors?.name && (
                                <p className="mt-1 text-sm text-red-600">{result.errors.name[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                placeholder="you@example.com"
                            />
                            {result?.errors?.email && (
                                <p className="mt-1 text-sm text-red-600">{result.errors.email[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                placeholder="••••••••"
                            />
                            {result?.errors?.password && (
                                <p className="mt-1 text-sm text-red-600">{result.errors.password[0]}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                At least 8 characters with uppercase, lowercase, and number
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                placeholder="••••••••"
                            />
                            {result?.errors?.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{result.errors.confirmPassword[0]}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : "Create account"}
                        </button>

                        <p className="text-center text-sm text-gray-600 mt-6">
                            Already have an account?{" "}
                            <Link href="/sign-in" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                Sign in
                            </Link>
                        </p>

                        <p className="text-center text-xs text-gray-500 mt-4">
                            By creating an account, you agree to our{" "}
                            <Link href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</Link>
                            {" "}and{" "}
                            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
