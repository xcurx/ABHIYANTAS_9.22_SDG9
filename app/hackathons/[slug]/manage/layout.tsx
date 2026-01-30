import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import {
    ArrowLeft,
    Users,
    Trophy,
    Settings,
    BarChart3,
    FileText,
    Calendar,
    Eye,
    Edit,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ManageTabs from "./manage-tabs"

interface ManageHackathonLayoutProps {
    params: Promise<{ slug: string }>
    children: React.ReactNode
}

export default async function ManageHackathonLayout({
    params,
    children,
}: ManageHackathonLayoutProps) {
    const { slug } = await params
    const session = await auth()

    if (!session?.user?.id) {
        redirect(`/sign-in?callbackUrl=/hackathons/${slug}/manage`)
    }

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            organizationId: true,
            organization: {
                select: {
                    members: {
                        where: { userId: session.user.id },
                        select: { role: true },
                    },
                },
            },
            _count: {
                select: {
                    registrations: true,
                    tracks: true,
                    prizes: true,
                    stages: true,
                },
            },
        },
    })

    if (!hackathon) {
        notFound()
    }

    // Check if user is an admin or owner of the organization
    const userMembership = hackathon.organization.members[0]
    if (!userMembership || !["OWNER", "ADMIN"].includes(userMembership.role)) {
        redirect(`/hackathons/${slug}`)
    }

    const statusColors: Record<string, string> = {
        DRAFT: "bg-gray-100 text-gray-800",
        PUBLISHED: "bg-blue-100 text-blue-800",
        REGISTRATION_OPEN: "bg-green-100 text-green-800",
        REGISTRATION_CLOSED: "bg-yellow-100 text-yellow-800",
        IN_PROGRESS: "bg-purple-100 text-purple-800",
        JUDGING: "bg-orange-100 text-orange-800",
        COMPLETED: "bg-gray-100 text-gray-800",
        CANCELLED: "bg-red-100 text-red-800",
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/hackathons/${hackathon.slug}`}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-semibold text-gray-900">{hackathon.title}</h1>
                                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[hackathon.status])}>
                                        {hackathon.status.replace("_", " ")}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">Manage your hackathon</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/hackathons/${hackathon.slug}`}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <Eye className="h-4 w-4" />
                                View Public Page
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-4 mt-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-indigo-600">{hackathon._count.registrations}</div>
                            <div className="text-xs text-gray-600">Registrations</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600">{hackathon._count.tracks}</div>
                            <div className="text-xs text-gray-600">Tracks</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-amber-600">{hackathon._count.prizes}</div>
                            <div className="text-xs text-gray-600">Prizes</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600">{hackathon._count.stages}</div>
                            <div className="text-xs text-gray-600">Stages</div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <ManageTabs slug={hackathon.slug} />
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {children}
            </div>
        </div>
    )
}
