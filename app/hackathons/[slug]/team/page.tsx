import { auth, signOut } from "@/auth"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { Navbar } from "@/components/layout/navbar"
import Link from "next/link"
import { 
    ChevronRight, 
    Users, 
    Crown, 
    UserPlus, 
    Settings, 
    Lock, 
    Unlock,
    Mail,
    Trash2,
    ArrowLeft,
    Sparkles,
    AlertCircle
} from "lucide-react"
import TeamActions from "./team-actions"
import CreateTeamForm from "./create-team-form"
import InviteMemberForm from "./invite-member-form"

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function TeamPage({ params }: PageProps) {
    const { slug } = await params
    const session = await auth()
    
    if (!session?.user?.id) {
        redirect("/sign-in")
    }
    
    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            minTeamSize: true,
            maxTeamSize: true,
            allowSoloParticipants: true,
            registrations: {
                where: { userId: session.user.id },
                select: { status: true },
            },
        },
    })
    
    if (!hackathon) {
        notFound()
    }
    
    const registration = hackathon.registrations[0]
    const isRegistered = registration?.status === "APPROVED"
    
    // Get user's team if they have one
    const teamMembership = await prisma.teamMember.findFirst({
        where: {
            userId: session.user.id,
            team: { hackathonId: hackathon.id },
        },
        include: {
            team: {
                include: {
                    leader: { select: { id: true, name: true, email: true, avatar: true } },
                    members: {
                        include: {
                            user: { select: { id: true, name: true, email: true, avatar: true } },
                        },
                        orderBy: { role: "asc" },
                    },
                    invitations: {
                        where: { status: "PENDING" },
                        include: {
                            invitee: { select: { name: true, email: true } },
                        },
                        orderBy: { createdAt: "desc" },
                    },
                },
            },
        },
    })
    
    const team = teamMembership?.team
    const isLeader = team?.leaderId === session.user.id
    
    // Get pending invitations for this user
    const pendingInvitations = await prisma.teamInvitation.findMany({
        where: {
            inviteeId: session.user.id,
            status: "PENDING",
            expiresAt: { gt: new Date() },
            team: { hackathonId: hackathon.id },
        },
        include: {
            team: {
                include: {
                    leader: { select: { name: true, email: true } },
                    _count: { select: { members: true } },
                },
            },
            inviter: { select: { name: true } },
        },
    })
    
    const signOutAction = async () => {
        "use server"
        await signOut({ redirectTo: "/" })
    }
    
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={session.user} signOutAction={signOutAction} />
            
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/hackathons" className="hover:text-indigo-600">Hackathons</Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href={`/hackathons/${slug}`} className="hover:text-indigo-600">{hackathon.title}</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-gray-900">Team</span>
                </div>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Users className="h-8 w-8 text-indigo-600" />
                            My Team
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Team size: {hackathon.minTeamSize} - {hackathon.maxTeamSize} members
                            {hackathon.allowSoloParticipants && " (Solo allowed)"}
                        </p>
                    </div>
                    <Link 
                        href={`/hackathons/${slug}`}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Hackathon
                    </Link>
                </div>
                
                {/* Not Registered Warning */}
                {!isRegistered && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-amber-900">Registration Required</h3>
                                <p className="text-amber-700 text-sm mt-1">
                                    You need to be registered and approved for this hackathon to create or join a team.
                                </p>
                                <Link 
                                    href={`/hackathons/${slug}/register`}
                                    className="inline-flex items-center gap-2 mt-3 text-amber-700 hover:text-amber-900 font-medium text-sm"
                                >
                                    Register Now →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
                        <h3 className="font-semibold text-indigo-900 flex items-center gap-2 mb-4">
                            <Mail className="h-5 w-5" />
                            Pending Invitations ({pendingInvitations.length})
                        </h3>
                        <div className="space-y-3">
                            {pendingInvitations.map((invitation) => (
                                <div 
                                    key={invitation.id}
                                    className="bg-white rounded-lg p-4 flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {invitation.team.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Invited by {invitation.inviter.name} • 
                                            {invitation.team._count.members} member(s)
                                        </p>
                                    </div>
                                    <TeamActions 
                                        type="invitation"
                                        invitationId={invitation.id}
                                        hackathonSlug={slug}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Current Team or Create Team */}
                {team ? (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Team Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                                        {team.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{team.name}</h2>
                                        <div className="flex items-center gap-3 mt-1">
                                            {team.isLocked ? (
                                                <span className="flex items-center gap-1 text-sm bg-white/20 px-2 py-0.5 rounded">
                                                    <Lock className="h-3 w-3" /> Locked
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-sm bg-white/20 px-2 py-0.5 rounded">
                                                    <Unlock className="h-3 w-3" /> Open
                                                </span>
                                            )}
                                            {team.isComplete ? (
                                                <span className="flex items-center gap-1 text-sm bg-green-500/30 px-2 py-0.5 rounded">
                                                    <Sparkles className="h-3 w-3" /> Complete
                                                </span>
                                            ) : (
                                                <span className="text-sm bg-amber-500/30 px-2 py-0.5 rounded">
                                                    Needs {hackathon.minTeamSize - team.members.length} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {isLeader && !team.isLocked && (
                                    <TeamActions 
                                        type="team-settings"
                                        teamId={team.id}
                                        hackathonSlug={slug}
                                        canLock={team.members.length >= hackathon.minTeamSize}
                                    />
                                )}
                            </div>
                            {team.description && (
                                <p className="mt-4 text-white/80">{team.description}</p>
                            )}
                            {team.projectIdea && (
                                <div className="mt-3 bg-white/10 rounded-lg px-4 py-2">
                                    <span className="text-sm text-white/60">Project Idea:</span>
                                    <p className="text-white/90">{team.projectIdea}</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Team Members */}
                        <div className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-500" />
                                Team Members ({team.members.length}/{hackathon.maxTeamSize})
                            </h3>
                            <div className="space-y-3">
                                {team.members.map((member) => (
                                    <div 
                                        key={member.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                                {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                                    {member.user.name || member.user.email}
                                                    {member.role === "LEADER" && (
                                                        <Crown className="h-4 w-4 text-amber-500" />
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500">{member.user.email}</p>
                                            </div>
                                        </div>
                                        {isLeader && member.userId !== session.user.id && !team.isLocked && (
                                            <TeamActions 
                                                type="member"
                                                teamId={team.id}
                                                memberId={member.userId}
                                                memberName={member.user.name || member.user.email}
                                                hackathonSlug={slug}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Pending Invitations (for leader) */}
                            {isLeader && team.invitations.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Pending Invitations
                                    </h4>
                                    <div className="space-y-2">
                                        {team.invitations.map((inv) => (
                                            <div 
                                                key={inv.id}
                                                className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <UserPlus className="h-4 w-4 text-amber-600" />
                                                    <span className="text-gray-900">
                                                        {inv.invitee?.name || inv.invitee?.email}
                                                    </span>
                                                </div>
                                                <TeamActions 
                                                    type="cancel-invitation"
                                                    invitationId={inv.id}
                                                    hackathonSlug={slug}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Invite Member Form */}
                            {isLeader && !team.isLocked && team.members.length < hackathon.maxTeamSize && (
                                <div className="mt-6 pt-6 border-t">
                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                        <UserPlus className="h-5 w-5 text-indigo-600" />
                                        Invite Team Member
                                    </h4>
                                    <InviteMemberForm teamId={team.id} hackathonSlug={slug} />
                                </div>
                            )}
                        </div>
                        
                        {/* Leave/Delete Team */}
                        {!team.isLocked && (
                            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                                {isLeader ? (
                                    <TeamActions 
                                        type="delete-team"
                                        teamId={team.id}
                                        hackathonSlug={slug}
                                    />
                                ) : (
                                    <TeamActions 
                                        type="leave-team"
                                        teamId={team.id}
                                        hackathonSlug={slug}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ) : isRegistered ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8">
                        <div className="text-center max-w-md mx-auto">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                You&apos;re not in a team yet
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Create a new team or wait for an invitation from another team leader.
                            </p>
                            <CreateTeamForm 
                                hackathonId={hackathon.id} 
                                hackathonSlug={slug}
                            />
                        </div>
                    </div>
                ) : null}
            </main>
        </div>
    )
}
