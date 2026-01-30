import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import ProfileForm from "./profile-form"
import prisma from "@/lib/prisma"

export default async function ProfilePage() {
    const session = await auth()
    
    if (!session) {
        redirect("/sign-in")
    }

    // Fetch full user data from database
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            createdAt: true,
        },
    })

    if (!user) {
        redirect("/sign-in")
    }

    return (
        <div className="min-h-screen pattern-bg">
            {/* Premium Header */}
            <header className="relative overflow-hidden border-b border-slate-200/60">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-100/40 via-violet-100/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                
                <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-5">
                        <Link href="/dashboard" className="text-slate-400 hover:text-indigo-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                                    Account Settings
                                </span>
                                <h1 className="text-2xl font-bold gradient-text mt-1">Edit Profile</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Profile Preview Card */}
                <div className="glass-card rounded-3xl p-8 mb-8 overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-white">
                                        {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                                    </span>
                                )}
                            </div>
                            <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white border-2 border-slate-100 shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors">
                                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                        <div className="text-center sm:text-left flex-1">
                            <h2 className="text-xl font-bold text-slate-800">{user.name || "User"}</h2>
                            <p className="text-slate-500">{user.email}</p>
                            <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 border border-indigo-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    {user.role?.replace(/_/g, ' ')}
                                </span>
                                <span className="text-xs text-slate-400">
                                    Member since {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="glass-card rounded-3xl p-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        Personal Information
                    </h3>
                    <ProfileForm user={user} />
                </div>
            </main>
        </div>
    )
}
