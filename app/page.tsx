import Link from "next/link"
import { auth } from "@/auth"

export default async function LandingPage() {
    const session = await auth()

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Navigation - Stripe style with blur */}
            <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/50 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">E</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900">ELEVATE</span>
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                            <Link href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-100 transition-all">
                                Features
                            </Link>
                            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-100 transition-all">
                                How it Works
                            </Link>
                            <Link href="#for-whom" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-100 transition-all">
                                Solutions
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            {session ? (
                                <Link
                                    href="/dashboard"
                                    className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
                                >
                                    Dashboard →
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/sign-in"
                                        className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-100 transition-all"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/sign-up"
                                        className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
                                    >
                                        Get Started →
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Stripe style with gradient mesh */}
            <section className="relative pt-32 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Gradient mesh background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-transparent blur-3xl" />
                    <div className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-400/10 to-transparent blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-400/20 via-purple-400/10 to-transparent blur-3xl" />
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
                </div>

                <div className="relative max-w-7xl mx-auto">
                    <div className="max-w-4xl">
                        {/* Badge */}
                        <div 
                            className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 mb-8 opacity-0 animate-[fadeInUp_0.6s_ease_0.1s_forwards]"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                            </span>
                            The platform for innovation
                        </div>

                        {/* Heading - Stripe style large text */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-8 opacity-0 animate-[fadeInUp_0.6s_ease_0.2s_forwards]">
                            Where Industry
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                Meets Academia
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl leading-relaxed mb-10 opacity-0 animate-[fadeInUp_0.6s_ease_0.3s_forwards]">
                            Host and participate in virtual hackathons that bridge the gap between 
                            corporate challenges and academic innovation.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-16 opacity-0 animate-[fadeInUp_0.6s_ease_0.4s_forwards]">
                            <Link
                                href="/sign-up"
                                className="group inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-all duration-300 shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:bg-blue-700 hover:-translate-y-0.5"
                            >
                                Start Building
                                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <Link
                                href="/hackathons"
                                className="group inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-gray-900 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Explore Hackathons
                                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        {/* Stats - Stripe style inline */}
                        <div className="flex flex-wrap gap-x-12 gap-y-4 opacity-0 animate-[fadeInUp_0.6s_ease_0.5s_forwards]">
                            {[
                                { value: "500+", label: "Hackathons" },
                                { value: "50,000+", label: "Participants" },
                                { value: "200+", label: "Companies" },
                                { value: "100+", label: "Universities" },
                            ].map((stat) => (
                                <div key={stat.label} className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                                    <span className="text-sm text-gray-500">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Floating cards - Stripe style - BIGGER */}
                <div className="absolute right-0 top-24 hidden lg:block opacity-0 animate-[slideInRight_1s_ease_0.4s_forwards]">
                    <div className="relative w-[420px] h-[450px]">
                        {/* Card 1 - Main featured */}
                        <div className="absolute top-0 right-0 w-80 bg-white rounded-2xl shadow-2xl shadow-blue-200/50 border border-gray-100 p-6 animate-[floatSlow_7s_ease-in-out_infinite] hover:scale-105 transition-transform">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-green-200">🏆</div>
                                <div>
                                    <div className="text-base font-semibold text-gray-900">AI Innovation Challenge</div>
                                    <div className="text-sm text-green-600 font-medium">Registration Open</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm mb-3">
                                <span className="text-gray-500">1,250 participants</span>
                                <span className="text-green-600 font-bold">₹50,000 Prize</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full w-2/3 animate-pulse"></div>
                            </div>
                        </div>
                        {/* Card 2 - Secondary */}
                        <div className="absolute top-44 -left-8 w-72 bg-white rounded-2xl shadow-2xl shadow-blue-200/50 border border-gray-100 p-5 animate-[float_6s_ease-in-out_infinite_0.5s] hover:scale-105 transition-transform">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-200">💻</div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Code Sprint Finals</div>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                        <span className="text-red-500 font-medium">Live Now</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-white"></div>
                                    <div className="w-6 h-6 rounded-full bg-green-200 border-2 border-white"></div>
                                    <div className="w-6 h-6 rounded-full bg-purple-200 border-2 border-white"></div>
                                </div>
                                <span>+847 watching</span>
                            </div>
                        </div>
                        {/* Card 3 - Notification */}
                        <div className="absolute top-80 right-8 w-64 bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-4 animate-[float_5s_ease-in-out_infinite_1.5s] hover:scale-105 transition-transform">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center animate-[pulse-glow_2s_ease-in-out_infinite]">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-gray-900">Project Submitted!</span>
                                    <div className="text-xs text-gray-400">Just now</div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 pl-13">Your team is now in review 🎉</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Logos Section - Rolling marquee animation */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <p className="text-center text-sm font-medium text-blue-600 mb-8 opacity-0 animate-[fadeInUp_0.6s_ease_0.1s_forwards]">
                        TRUSTED BY LEADING ORGANIZATIONS
                    </p>
                    <div className="relative">
                        {/* Gradient masks */}
                        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-blue-50 to-transparent z-10" />
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-blue-50 to-transparent z-10" />
                        {/* Scrolling container */}
                        <div className="flex animate-[scroll_25s_linear_infinite] hover:[animation-play-state:paused]">
                            {[...Array(2)].map((_, setIndex) => (
                                <div key={setIndex} className="flex items-center gap-16 px-8">
                                    {[
                                        { name: "Microsoft", icon: "🪟" },
                                        { name: "Google", icon: "🔍" },
                                        { name: "Amazon", icon: "📦" },
                                        { name: "Meta", icon: "🌐" },
                                        { name: "IBM", icon: "💻" },
                                        { name: "Stanford", icon: "🎓" },
                                        { name: "MIT", icon: "🏛️" },
                                        { name: "Apple", icon: "🍎" },
                                    ].map((company) => (
                                        <div 
                                            key={`${setIndex}-${company.name}`} 
                                            className="flex items-center gap-2 text-xl font-bold text-blue-400 hover:text-blue-700 transition-all duration-300 cursor-default whitespace-nowrap group"
                                        >
                                            <span className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">{company.icon}</span>
                                            <span>{company.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Stripe style cards */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-blue-50/30 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-2xl mb-16">
                        <p className="text-sm font-semibold text-blue-600 mb-3">FEATURES</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            Everything you need to innovate
                        </h2>
                        <p className="text-xl text-gray-600">
                            A complete platform for organizing, participating, and judging hackathons with powerful tools built-in.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                ),
                                title: "Customizable Stages",
                                description: "Design your hackathon pipeline with evaluation rounds, mentoring sessions, and checkpoints",
                                bgColor: "bg-blue-50",
                                iconColor: "text-blue-600"
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                ),
                                title: "Team Formation",
                                description: "Smart team matching based on skills, find teammates or form your dream team",
                                bgColor: "bg-green-50",
                                iconColor: "text-green-600"
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                ),
                                title: "Mentorship",
                                description: "Connect with industry experts for guidance and feedback during your journey",
                                bgColor: "bg-purple-50",
                                iconColor: "text-purple-600"
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                ),
                                title: "Fair Judging",
                                description: "Configurable criteria, weighted scoring, and multi-round evaluation system",
                                bgColor: "bg-amber-50",
                                iconColor: "text-amber-600"
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                ),
                                title: "Real-time Collaboration",
                                description: "Team chat, video conferencing, and shared workspace tools",
                                bgColor: "bg-cyan-50",
                                iconColor: "text-cyan-600"
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                ),
                                title: "Gamification",
                                description: "Badges, leaderboards, and achievements to keep participants engaged",
                                bgColor: "bg-rose-50",
                                iconColor: "text-rose-600"
                            },
                        ].map((feature) => (
                            <div 
                                key={feature.title} 
                                className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-xl transition-all duration-300"
                            >
                                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} ${feature.iconColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works - Stripe style timeline */}
            <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 via-indigo-50/50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <p className="text-sm font-semibold text-blue-600 mb-3">HOW IT WORKS</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Get started in minutes
                        </h2>
                        <p className="text-xl text-gray-600">
                            Simple steps to begin your innovation journey
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-12 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />
                        
                        {[
                            { step: "01", title: "Create Account", description: "Sign up in seconds with email or social login", icon: "👤" },
                            { step: "02", title: "Find Hackathon", description: "Browse events that match your interests and skills", icon: "🔍" },
                            { step: "03", title: "Build & Submit", description: "Collaborate with your team and submit your project", icon: "🚀" },
                            { step: "04", title: "Win & Connect", description: "Get recognized and connect with industry leaders", icon: "🏆" },
                        ].map((item, index) => (
                            <div key={item.step} className="relative text-center group">
                                {/* Icon container */}
                                <div className="relative inline-block mb-8">
                                    <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white border-2 border-blue-100 shadow-xl shadow-blue-100/50 group-hover:border-blue-300 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 z-10">
                                        <span className="text-4xl">{item.icon}</span>
                                    </div>
                                    {/* Step badge - positioned top-right of icon */}
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-lg z-20">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm max-w-[180px] mx-auto">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Whom Section - Stripe style cards */}
            <section id="for-whom" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-cyan-50/30 to-blue-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <p className="text-sm font-semibold text-blue-600 mb-3">SOLUTIONS</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Built for everyone
                        </h2>
                        <p className="text-xl text-gray-600">
                            Whether you are a student, company, or institution
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Students & Researchers",
                                description: "Gain hands-on experience solving real industry problems, build your portfolio, and connect with potential employers.",
                                icon: "🎓",
                                gradient: "from-blue-500 to-cyan-500",
                                benefits: ["Real-world experience", "Industry mentorship", "Career opportunities"]
                            },
                            {
                                title: "Companies & Startups",
                                description: "Source innovative solutions, discover top talent, and engage with the next generation of problem solvers.",
                                icon: "🏢",
                                gradient: "from-blue-600 to-indigo-600",
                                benefits: ["Fresh perspectives", "Talent pipeline", "Brand visibility"]
                            },
                            {
                                title: "Universities & Institutions",
                                description: "Provide practical learning experiences, strengthen industry partnerships, and showcase student capabilities.",
                                icon: "🏛️",
                                gradient: "from-indigo-500 to-purple-500",
                                benefits: ["Industry collaboration", "Student engagement", "Research opportunities"]
                            },
                        ].map((item) => (
                            <div 
                                key={item.title} 
                                className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                            >
                                {/* Gradient accent on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
                                
                                <div className="relative">
                                    <div className="text-4xl mb-6">{item.icon}</div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>
                                    <ul className="space-y-3">
                                        {item.benefits.map((benefit) => (
                                            <li key={benefit} className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Stripe style */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent_50%)]" />
                
                <div className="relative max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to innovate?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join thousands of innovators building the future through collaborative hackathons.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/sign-up"
                            className="group inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-blue-600 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
                        >
                            Create Free Account
                            <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link
                            href="/hackathons"
                            className="group inline-flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5"
                        >
                            Browse Hackathons
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer - Stripe style */}
            <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-5 gap-8 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">E</span>
                                </div>
                                <span className="font-bold text-lg text-white">ELEVATE</span>
                            </div>
                            <p className="text-sm max-w-xs leading-relaxed">
                                Bridging the gap between industry challenges and academic innovation through collaborative hackathons.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4 text-sm">Platform</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/hackathons" className="hover:text-white transition-colors">Browse Hackathons</Link></li>
                                <li><Link href="/coding-contests" className="hover:text-white transition-colors">Coding Contests</Link></li>
                                <li><Link href="/sign-up" className="hover:text-white transition-colors">Create Account</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4 text-sm">Resources</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm">© 2026 ELEVATE. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <Link href="#" className="hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                            </Link>
                            <Link href="#" className="hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            </Link>
                            <Link href="#" className="hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
