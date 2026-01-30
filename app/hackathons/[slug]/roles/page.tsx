import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { formatDateTime, cn } from "@/lib/utils"
import { Star, MessageSquare, Clock, Building2 } from "lucide-react"
import RoleInvitationActions from "./role-invitation-actions"

interface RolesPageProps {
    params: Promise<{ slug: string }>
}

export default async function HackathonRolesPage({ params }: RolesPageProps) {
    const { slug } = await params
    const session = await auth()

    if (!session?.user?.id) {
        redirect(`/sign-in?callbackUrl=/hackathons/${slug}/roles`)
    }

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        include: {
            organization: {
                select: { name: true },
            },
            roles: {
                where: { userId: session.user.id },
                include: {
                    inviter: {
                        select: { name: true },
                    },
                },
            },
        },
    })

    if (!hackathon) {
        notFound()
    }

    const myRoles = hackathon.roles

    if (myRoles.length === 0) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-gray-400" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">No Role Invitations</h1>
                <p className="text-gray-600">
                    You don&apos;t have any role invitations for this hackathon.
                </p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Your Roles</h1>
                <p className="text-gray-600 mt-1">{hackathon.title}</p>
            </div>

            <div className="space-y-4">
                {myRoles.map((role) => {
                    const RoleIcon = role.role === "JUDGE" ? Star : 
                                     role.role === "MENTOR" ? MessageSquare : Building2
                    const roleColor = role.role === "JUDGE" ? "yellow" : 
                                      role.role === "MENTOR" ? "green" : "blue"

                    return (
                        <div 
                            key={role.id} 
                            className={cn(
                                "bg-white rounded-xl shadow-sm border p-6",
                                role.status === "PENDING" && `border-l-4 border-l-${roleColor}-500`
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full bg-${roleColor}-100 flex items-center justify-center flex-shrink-0`}>
                                    <RoleIcon className={`h-6 w-6 text-${roleColor}-600`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900 text-lg">
                                            {role.role.charAt(0) + role.role.slice(1).toLowerCase()} Invitation
                                        </h3>
                                        <span className={cn(
                                            "px-2 py-0.5 text-xs font-medium rounded-full",
                                            role.status === "PENDING" && "bg-yellow-100 text-yellow-700",
                                            role.status === "ACCEPTED" && "bg-green-100 text-green-700",
                                            role.status === "DECLINED" && "bg-red-100 text-red-700",
                                            role.status === "REVOKED" && "bg-gray-100 text-gray-700"
                                        )}>
                                            {role.status}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 mb-3">
                                        {role.role === "JUDGE" 
                                            ? "As a judge, you'll evaluate and score project submissions during the evaluation phase."
                                            : role.role === "MENTOR"
                                            ? "As a mentor, you'll provide guidance and support to participating teams."
                                            : `You've been invited as a ${role.role.toLowerCase()}.`
                                        }
                                    </p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        {role.inviter && (
                                            <span>Invited by {role.inviter.name || "Unknown"}</span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {formatDateTime(role.invitedAt)}
                                        </span>
                                    </div>

                                    {role.status === "PENDING" && (
                                        <RoleInvitationActions 
                                            roleId={role.id} 
                                            hackathonSlug={hackathon.slug}
                                            roleName={role.role}
                                        />
                                    )}

                                    {role.status === "ACCEPTED" && (
                                        <div className="mt-4 p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                                            ✓ You accepted this role on {role.acceptedAt ? formatDateTime(role.acceptedAt) : "N/A"}
                                        </div>
                                    )}

                                    {role.status === "DECLINED" && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-gray-600 text-sm">
                                            You declined this invitation
                                        </div>
                                    )}

                                    {role.status === "REVOKED" && (
                                        <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                                            This invitation has been revoked by the organizers
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
