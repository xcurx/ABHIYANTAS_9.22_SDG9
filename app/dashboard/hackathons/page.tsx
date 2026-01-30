import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Navbar } from "@/components/layout/navbar"
import { 
    Calendar, 
    MapPin, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Trophy,
    Users,
    ArrowRight,
    ChevronRight,
    Building2,
    Globe,
    Laptop
} from "lucide-react"

export default async function MyHackathonsPage() {
    const session = await auth()
    
    if (!session?.user?.id) {
        redirect("/sign-in?callbackUrl=/dashboard/hackathons")
    }

    // Fetch user's hackathon registrations
    const registrations = await prisma.hackathonRegistration.findMany({
        where: {
            userId: session.user.id,
        },
        select: {
            id: true,
            status: true,
            registeredAt: true,
            motivation: true,
            skills: true,
            hackathon: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    mode: true,
                    status: true,
                    hackathonStart: true,
                    hackathonEnd: true,
                    organization: {
                        select: {
                            name: true,
                            logo: true,
                        },
                    },
                    _count: {
                        select: {
                            registrations: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            registeredAt: "desc",
        },
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Approved
                    </span>
                )
            case "REJECTED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        <XCircle className="h-4 w-4" />
                        Rejected
                    </span>
                )
            case "PENDING":
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        <AlertCircle className="h-4 w-4" />
                        Pending Review
                    </span>
                )
        }
    }

    const getHackathonStatus = (hackathon: { 
        status: string
        hackathonStart: Date | null
        hackathonEnd: Date | null 
    }) => {
        const now = new Date()
        
        if (hackathon.status === "CANCELLED") {
            return { label: "Cancelled", color: "bg-gray-100 text-gray-700" }
        }
        
        if (hackathon.hackathonEnd && new Date(hackathon.hackathonEnd) < now) {
            return { label: "Completed", color: "bg-blue-100 text-blue-700" }
        }
        
        if (hackathon.hackathonStart && new Date(hackathon.hackathonStart) <= now && 
            hackathon.hackathonEnd && new Date(hackathon.hackathonEnd) >= now) {
            return { label: "In Progress", color: "bg-green-100 text-green-700" }
        }
        
        if (hackathon.status === "PUBLISHED") {
            return { label: "Upcoming", color: "bg-indigo-100 text-indigo-700" }
        }
        
        return { label: hackathon.status, color: "bg-gray-100 text-gray-700" }
    }

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case "ONLINE":
                return <Globe className="h-4 w-4" />
            case "IN_PERSON":
                return <MapPin className="h-4 w-4" />
            case "HYBRID":
                return <Laptop className="h-4 w-4" />
            default:
                return <Globe className="h-4 w-4" />
        }
    }

    const formatDate = (date: Date | null) => {
        if (!date) return "TBD"
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    // Group registrations by status
    const pendingRegistrations = registrations.filter(r => r.status === "PENDING")
    const approvedRegistrations = registrations.filter(r => r.status === "APPROVED")
    const rejectedRegistrations = registrations.filter(r => r.status === "REJECTED")

    const signOutAction = async () => {
        "use server"
        await signOut({ redirectTo: "/" })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={session.user} signOutAction={signOutAction} />
            
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-900">My Hackathons</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Hackathons</h1>
                            <p className="text-gray-600 mt-1">Track your hackathon applications and participations</p>
                        </div>
                        <Link
                            href="/hackathons"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
                        >
                            Explore Hackathons
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Trophy className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
                                <p className="text-sm text-gray-500">Total Applications</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{pendingRegistrations.length}</p>
                                <p className="text-sm text-gray-500">Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{approvedRegistrations.length}</p>
                                <p className="text-sm text-gray-500">Approved</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{rejectedRegistrations.length}</p>
                                <p className="text-sm text-gray-500">Rejected</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* No Registrations */}
                {registrations.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                            <Trophy className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No hackathons yet</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            You haven't applied to any hackathons yet. Explore available hackathons and start your journey!
                        </p>
                        <Link
                            href="/hackathons"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
                        >
                            Browse Hackathons
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {registrations.map((registration) => {
                            const hackathonStatus = getHackathonStatus(registration.hackathon)
                            
                            return (
                                <div
                                    key={registration.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            {/* Left: Hackathon Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    {/* Organization Logo */}
                                                    {registration.hackathon.organization.logo ? (
                                                        <img
                                                            src={registration.hackathon.organization.logo}
                                                            alt={registration.hackathon.organization.name}
                                                            className="h-10 w-10 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                            <Building2 className="h-5 w-5 text-indigo-600" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Link
                                                            href={`/hackathons/${registration.hackathon.slug}`}
                                                            className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
                                                        >
                                                            {registration.hackathon.title}
                                                        </Link>
                                                        <p className="text-sm text-gray-500">
                                                            by {registration.hackathon.organization.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Hackathon Details */}
                                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span>
                                                            {formatDate(registration.hackathon.hackathonStart)} - {formatDate(registration.hackathon.hackathonEnd)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {getModeIcon(registration.hackathon.mode)}
                                                        <span className="capitalize">{registration.hackathon.mode.toLowerCase().replace("_", " ")}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="h-4 w-4 text-gray-400" />
                                                        <span>{registration.hackathon._count.registrations} participants</span>
                                                    </div>
                                                </div>

                                                {/* Applied Date */}
                                                <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Applied {formatDate(registration.registeredAt)}</span>
                                                </div>
                                            </div>

                                            {/* Right: Status Badges */}
                                            <div className="flex flex-col items-end gap-2">
                                                {getStatusBadge(registration.status)}
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${hackathonStatus.color}`}>
                                                    {hackathonStatus.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Application Details (if expanded) */}
                                        {registration.motivation && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-sm text-gray-500 mb-1">Your motivation:</p>
                                                <p className="text-sm text-gray-700 line-clamp-2">{registration.motivation}</p>
                                            </div>
                                        )}

                                        {/* Skills */}
                                        {registration.skills && (registration.skills as string[]).length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {(registration.skills as string[]).slice(0, 5).map((skill: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {(registration.skills as string[]).length > 5 && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                                                        +{(registration.skills as string[]).length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Footer */}
                                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            {registration.status === "APPROVED" && registration.hackathon.status === "PUBLISHED" && (
                                                <span className="text-green-600 font-medium">You're in! Good luck! 🎉</span>
                                            )}
                                            {registration.status === "PENDING" && (
                                                <span>Your application is being reviewed</span>
                                            )}
                                            {registration.status === "REJECTED" && (
                                                <span className="text-gray-500">Better luck next time!</span>
                                            )}
                                        </div>
                                        <Link
                                            href={`/hackathons/${registration.hackathon.slug}`}
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                        >
                                            View Hackathon
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
