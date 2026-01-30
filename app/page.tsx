import Link from "next/link"
import { auth } from "@/auth"

export default async function LandingPage() {
    const session = await auth()

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">E</span>
                            </div>
                            <span className="font-bold text-xl text-blue-600">ELEVATE</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-gray-100 px-3 py-1.5 rounded-lg">
                                Features
                            </Link>
                            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-gray-100 px-3 py-1.5 rounded-lg">
                                How it Works
                            </Link>
                            <Link href="#for-whom" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-gray-100 px-3 py-1.5 rounded-lg">
                                For Whom
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            {session ? (
                                <Link
                                    href="/dashboard"
                                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all duration-200"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/sign-in"
                                        className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-gray-100 px-3 py-1.5 rounded-lg"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/sign-up"
                                        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all duration-200"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 mb-8 animate-fade-in-up animate-on-load" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Virtual Hackathons Platform
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6 animate-fade-in-up animate-on-load" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                        Where Industry Meets
                        <span className="text-blue-600"> Academia</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 animate-fade-in-up animate-on-load" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                        Host and participate in virtual hackathons that bridge the gap between 
                        corporate challenges and academic innovation. Transform ideas into real-world solutions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-on-load" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                        <Link
                            href="/sign-up"
                            className="rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-300"
                        >
                            Start Your Journey
                        </Link>
                        <Link
                            href="/hackathons"
                            className="rounded-full bg-white px-8 py-4 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:-translate-y-1 hover:shadow-lg"
                        >
                            Explore Hackathons
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: "500+", label: "Hackathons Hosted" },
                            { value: "50K+", label: "Participants" },
                            { value: "200+", label: "Partner Companies" },
                            { value: "100+", label: "Universities" },
                        ].map((stat, index) => (
                            <div 
                                key={stat.label} 
                                className="text-center animate-fade-in-up animate-on-load"
                                style={{ animationDelay: `${0.5 + index * 0.1}s`, animationFillMode: 'forwards' }}
                            >
                                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Innovate
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            A complete platform for organizing, participating, and judging hackathons
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "🎯",
                                title: "Customizable Stages",
                                description: "Design your hackathon pipeline with evaluation rounds, mentoring sessions, and checkpoints"
                            },
                            {
                                icon: "👥",
                                title: "Team Formation",
                                description: "Smart team matching based on skills, find teammates or form your dream team"
                            },
                            {
                                icon: "🎓",
                                title: "Mentorship",
                                description: "Connect with industry experts for guidance and feedback during your journey"
                            },
                            {
                                icon: "📊",
                                title: "Fair Judging",
                                description: "Configurable criteria, weighted scoring, and multi-round evaluation system"
                            },
                            {
                                icon: "💬",
                                title: "Real-time Collaboration",
                                description: "Team chat, video conferencing, and shared workspace tools"
                            },
                            {
                                icon: "🏆",
                                title: "Gamification",
                                description: "Badges, leaderboards, and achievements to keep participants engaged"
                            },
                        ].map((feature, index) => (
                            <div 
                                key={feature.title} 
                                className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-gray-600">
                            Get started in just a few simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: "01", title: "Sign Up", description: "Create your account and complete your profile" },
                            { step: "02", title: "Find a Hackathon", description: "Browse and register for hackathons that match your interests" },
                            { step: "03", title: "Build & Submit", description: "Collaborate with your team and submit your project" },
                            { step: "04", title: "Win & Connect", description: "Get recognized, win prizes, and connect with industry" },
                        ].map((item, index) => (
                            <div key={item.step} className="text-center relative">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-xl font-bold mb-4 transition-transform duration-300 hover:scale-110">
                                    {item.step}
                                </div>
                                {index < 3 && (
                                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-blue-200"></div>
                                )}
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Whom Section */}
            <section id="for-whom" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Built for Everyone
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="border border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Students & Researchers</h3>
                            <p className="text-gray-600 mb-4">
                                Gain hands-on experience solving real industry problems, build your portfolio, and connect with potential employers.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Real-world project experience
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Mentorship from experts
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Networking opportunities
                                </li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Companies & Startups</h3>
                            <p className="text-gray-600 mb-4">
                                Source innovative solutions, discover top talent, and engage with the next generation of problem solvers.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Fresh perspectives on challenges
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Talent pipeline
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Brand visibility
                                </li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Universities & Institutions</h3>
                            <p className="text-gray-600 mb-4">
                                Provide practical learning experiences, strengthen industry partnerships, and showcase student capabilities.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Industry collaboration
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Student engagement
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Research opportunities
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Innovate?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10">
                        Join thousands of innovators building the future through collaborative hackathons.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/sign-up"
                            className="rounded-full bg-white px-8 py-4 text-base font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            Create Free Account
                        </Link>
                        <Link
                            href="/hackathons"
                            className="rounded-full bg-blue-500 px-8 py-4 text-base font-semibold text-white hover:bg-blue-400 transition-all duration-300 border border-blue-400 hover:-translate-y-1"
                        >
                            Browse Hackathons
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">E</span>
                                </div>
                                <span className="font-bold text-lg text-white">ELEVATE</span>
                            </div>
                            <p className="text-sm">
                                Bridging the gap between industry challenges and academic innovation.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/hackathons" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Browse Hackathons</Link></li>
                                <li><Link href="/sign-up" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Create Account</Link></li>
                                <li><Link href="#" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Host a Hackathon</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Documentation</Link></li>
                                <li><Link href="#" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">API</Link></li>
                                <li><Link href="#" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Support</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Terms of Service</Link></li>
                                <li><Link href="#" className="hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        <p>© 2026 ELEVATE. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
