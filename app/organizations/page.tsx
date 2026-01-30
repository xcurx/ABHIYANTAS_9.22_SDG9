import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getUserOrganizations } from "@/lib/actions/organization"

interface Organization {
    id: string
    name: string
    slug: string
    logo: string | null
    type: string
    description?: string | null
    isVerified?: boolean
    role: string
    _count?: { members: number }
}

export default async function OrganizationsPage() {
    const session = await auth()
    
    if (!session) {
        redirect("/sign-in")
    }

    const result = await getUserOrganizations()
    const organizations = (result.success && result.organizations ? result.organizations : []) as Organization[]

    return (
        <div className="min-h-screen pattern-bg">
            {/* Premium Header */}
            <header className="relative overflow-hidden border-b border-slate-200/60">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-amber-50/30" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-amber-100/40 via-orange-100/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-100/40 via-violet-100/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                
                <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/30 float">
                                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-lg">
                                    {organizations.length}
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <Link href="/dashboard" className="text-slate-400 hover:text-amber-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </Link>
                                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                                        Teams & Organizations
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold gradient-text tracking-tight">
                                    Organizations
                                </h1>
                                <p className="text-slate-500 mt-1">
                                    Manage your organizations and teams
                                </p>
                            </div>
                        </div>
                        
                        <Link
                            href="/organizations/new"
                            className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <span className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                            </span>
                            Create Organization
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {organizations.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center">
                        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No organizations yet</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                            Create an organization to host hackathons, coding contests, and collaborate with your team.
                        </p>
                        <Link
                            href="/organizations/new"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create your first organization
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {organizations.map((org: Organization) => (
                            <Link
                                key={org.id}
                                href={`/organizations/${org.slug}`}
                                className="glass-card rounded-2xl p-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        {org.logo ? (
                                            <img src={org.logo} alt={org.name} className="w-14 h-14 rounded-2xl object-cover" />
                                        ) : (
                                            <span className="text-xl font-bold text-white">
                                                {org.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 truncate group-hover:text-amber-600 transition-colors">{org.name}</h3>
                                        <p className="text-sm text-slate-500 capitalize">{org.type.toLowerCase().replace('_', ' ')}</p>
                                    </div>
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                                
                                {org.description && (
                                    <p className="mt-4 text-sm text-slate-600 line-clamp-2">{org.description}</p>
                                )}
                                
                                <div className="mt-5 flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 border border-amber-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        {org.role.toLowerCase().replace('_', ' ')}
                                    </span>
                                    
                                    <div className="flex items-center gap-2">
                                        {org._count?.members && (
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                {org._count.members}
                                            </span>
                                        )}
                                        {org.isVerified && (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                        
                        {/* Add New Organization Card */}
                        <Link
                            href="/organizations/new"
                            className="glass-card rounded-2xl p-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-dashed border-amber-200 hover:border-amber-400 flex flex-col items-center justify-center min-h-[200px]"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-slate-600 group-hover:text-amber-600 transition-colors">Create New Organization</h3>
                            <p className="text-sm text-slate-400 mt-1">Add another team or company</p>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
