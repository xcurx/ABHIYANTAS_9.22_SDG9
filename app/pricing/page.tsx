"use client"

import Link from "next/link"
import { Check, Sparkles, Building2, Rocket, Crown, ArrowRight, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
    {
        name: "Free",
        price: 0,
        period: "month",
        description: "For trying the platform",
        color: "green",
        icon: Sparkles,
        features: [
            "Create 1 organization",
            "Host 1 hackathon",
            "Up to 50 participants",
            "Default ELEVATE branding",
            "Basic participant list",
            "Email notifications",
        ],
        cta: "Get Started Free",
        popular: false,
    },
    {
        name: "Growth",
        price: 500,
        period: "month",
        description: "Best value · Most Popular",
        color: "blue",
        icon: Rocket,
        features: [
            "Host up to 5 hackathons",
            "Up to 200 participants per hackathon",
            "Custom organization profile",
            "Basic analytics & shortlisting",
            "Priority email support",
            "Filters & sorting in submissions",
        ],
        cta: "Upgrade to Growth",
        popular: true,
    },
    {
        name: "Pro",
        price: 1000,
        period: "month",
        description: "For serious hiring & scale",
        color: "purple",
        icon: Crown,
        features: [
            "Unlimited hackathons",
            "Up to 500+ participants per hackathon",
            "Advanced analytics & reports",
            "Custom branding (logo, theme)",
            "Shortlisting & ranking tools",
            "Priority support",
        ],
        cta: "Upgrade to Pro",
        popular: false,
    },
]

const colorConfig = {
    green: {
        bg: "bg-green-50",
        border: "border-green-200",
        icon: "bg-green-100 text-green-600",
        badge: "bg-green-100 text-green-700",
        button: "bg-green-600 hover:bg-green-700 text-white",
        check: "text-green-600",
        ring: "ring-green-500",
    },
    blue: {
        bg: "bg-blue-50",
        border: "border-blue-300",
        icon: "bg-blue-100 text-blue-600",
        badge: "bg-blue-600 text-white",
        button: "bg-blue-600 hover:bg-blue-700 text-white",
        check: "text-blue-600",
        ring: "ring-blue-500",
    },
    purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        icon: "bg-purple-100 text-purple-600",
        badge: "bg-purple-100 text-purple-700",
        button: "bg-purple-600 hover:bg-purple-700 text-white",
        check: "text-purple-600",
        ring: "ring-purple-500",
    },
}

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"></div>
                <div className="absolute inset-0">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-30"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
                        <Zap className="h-4 w-4" />
                        Simple, transparent pricing
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Choose the perfect plan for your organization
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Start free, upgrade when you need more. No hidden fees, cancel anytime.
                    </p>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 -mt-10 pb-20">
                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const colors = colorConfig[plan.color as keyof typeof colorConfig]
                        const Icon = plan.icon
                        
                        return (
                            <div
                                key={plan.name}
                                className={cn(
                                    "relative bg-white rounded-2xl border-2 p-8 shadow-lg transition-all duration-300 hover:shadow-xl",
                                    plan.popular ? "border-blue-400 ring-2 ring-blue-200 scale-105 z-10" : colors.border
                                )}
                            >
                                {/* Popular Badge */}
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-lg">
                                            <Sparkles className="h-4 w-4" />
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                {/* Plan Header */}
                                <div className="text-center mb-8">
                                    <div className={cn("inline-flex items-center justify-center h-14 w-14 rounded-xl mb-4", colors.icon)}>
                                        <Icon className="h-7 w-7" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                                    <p className="text-sm text-gray-600">{plan.description}</p>
                                </div>

                                {/* Price */}
                                <div className="text-center mb-8">
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold text-gray-900">₹{plan.price.toLocaleString()}</span>
                                        <span className="text-gray-500">/ {plan.period}</span>
                                    </div>
                                    {plan.price === 0 && (
                                        <p className="text-sm text-green-600 font-medium mt-1">Free forever</p>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="space-y-4 mb-8">
                                    <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Includes</p>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className={cn("flex-shrink-0 mt-0.5", colors.check)}>
                                                    <Check className="h-5 w-5" />
                                                </div>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CTA Button */}
                                <button
                                    className={cn(
                                        "w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                                        colors.button
                                    )}
                                >
                                    {plan.cta}
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        )
                    })}
                </div>

                {/* FAQ / Additional Info */}
                <div className="mt-20 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                    <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 text-left">
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <h4 className="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade anytime?</h4>
                            <p className="text-gray-600 text-sm">Yes! You can change your plan at any time. Changes take effect immediately.</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
                            <p className="text-gray-600 text-sm">We accept all major credit cards, debit cards, UPI, and net banking.</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <h4 className="font-semibold text-gray-900 mb-2">Is there a refund policy?</h4>
                            <p className="text-gray-600 text-sm">Yes, we offer a 7-day money-back guarantee if you're not satisfied.</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <h4 className="font-semibold text-gray-900 mb-2">Need a custom enterprise plan?</h4>
                            <p className="text-gray-600 text-sm">Contact us for custom pricing for large organizations with specific needs.</p>
                        </div>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600 mb-4">Have questions? We're here to help.</p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                    >
                        Contact our sales team
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
