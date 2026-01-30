import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { formatDateTime, cn } from "@/lib/utils"
import { 
    Star, 
    MessageSquare, 
    Users, 
    UserPlus, 
    Mail,
    CheckCircle,
    XCircle,
    Clock,
    ArrowLeft,
} from "lucide-react"
import InviteRoleForm from "./invite-role-form"
import RoleActions from "./role-actions"
import ExportRolesButton from "./export-roles-button"

interface RolesPageProps {
    params: Promise<{ slug: string }>
}

export default async function ManageRolesPage({ params }: RolesPageProps) {
    const { slug } = await params
    const session = await auth()

    if (!session?.user?.id) {
        notFound()
    }

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        include: {
            roles: {
                orderBy: { invitedAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                    inviter: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
            organization: {
                select: { id: true },
            },
        },
    })

    if (!hackathon) {
        notFound()
    }

    // Check if user is an organizer
    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: hackathon.organization.id,
            },
        },
    })

    const isOrganizer = membership?.role === "OWNER" || membership?.role === "ADMIN"

    if (!isOrganizer) {
        notFound()
    }

    // Group roles by type
    const judges = hackathon.roles.filter(r => r.role === "JUDGE")
    const mentors = hackathon.roles.filter(r => r.role === "MENTOR")
    const others = hackathon.roles.filter(r => !["JUDGE", "MENTOR"].includes(r.role))

    const statusColors = {
        PENDING: "bg-yellow-100 text-yellow-700",
        ACCEPTED: "bg-green-100 text-green-700",
        DECLINED: "bg-red-100 text-red-700",
        REVOKED: "bg-gray-100 text-gray-700",
    }

    const statusIcons = {
        PENDING: Clock,
        ACCEPTED: CheckCircle,
        DECLINED: XCircle,
        REVOKED: XCircle,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Roles</h1>
                    <p className="text-gray-600 mt-1">Invite and manage judges, mentors, and other roles</p>
                </div>
            </div>

            {/* Invite Form */}
            <InviteRoleForm hackathonId={hackathon.id} hackathonSlug={hackathon.slug} />

            {/* Judges Section */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 bg-yellow-50 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <h2 className="font-semibold text-gray-900">Judges ({judges.length})</h2>
                    </div>
                    <ExportRolesButton roles={judges} roleType="judges" hackathonTitle={hackathon.title} />
                </div>
                {judges.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Star className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p>No judges invited yet</p>
                        <p className="text-sm mt-1">Use the form above to invite judges</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {judges.map((role) => {
                            const StatusIcon = statusIcons[role.status]
                            return (
                                <div key={role.id} className="p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                        <Star className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{role.user.name || "Unknown"}</div>
                                        <div className="text-sm text-gray-500">{role.user.email}</div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                                        statusColors[role.status]
                                    )}>
                                        <StatusIcon className="h-3 w-3" />
                                        {role.status}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Invited {formatDateTime(role.invitedAt)}
                                    </div>
                                    <RoleActions 
                                        roleId={role.id} 
                                        status={role.status} 
                                        hackathonSlug={hackathon.slug}
                                    />
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Mentors Section */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 bg-green-50 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        <h2 className="font-semibold text-gray-900">Mentors ({mentors.length})</h2>
                    </div>
                    <ExportRolesButton roles={mentors} roleType="mentors" hackathonTitle={hackathon.title} />
                </div>
                {mentors.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p>No mentors invited yet</p>
                        <p className="text-sm mt-1">Use the form above to invite mentors</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {mentors.map((role) => {
                            const StatusIcon = statusIcons[role.status]
                            return (
                                <div key={role.id} className="p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <MessageSquare className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{role.user.name || "Unknown"}</div>
                                        <div className="text-sm text-gray-500">{role.user.email}</div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                                        statusColors[role.status]
                                    )}>
                                        <StatusIcon className="h-3 w-3" />
                                        {role.status}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Invited {formatDateTime(role.invitedAt)}
                                    </div>
                                    <RoleActions 
                                        roleId={role.id} 
                                        status={role.status} 
                                        hackathonSlug={hackathon.slug}
                                    />
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Other Roles */}
            {others.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-4 bg-blue-50 border-b flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <h2 className="font-semibold text-gray-900">Other Roles ({others.length})</h2>
                    </div>
                    <div className="divide-y">
                        {others.map((role) => {
                            const StatusIcon = statusIcons[role.status]
                            return (
                                <div key={role.id} className="p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{role.user.name || "Unknown"}</div>
                                        <div className="text-sm text-gray-500">{role.user.email}</div>
                                    </div>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                        {role.role}
                                    </span>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                                        statusColors[role.status]
                                    )}>
                                        <StatusIcon className="h-3 w-3" />
                                        {role.status}
                                    </div>
                                    <RoleActions 
                                        roleId={role.id} 
                                        status={role.status} 
                                        hackathonSlug={hackathon.slug}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
