import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { ArrowLeft, Calendar, Users, MapPin, Globe, CheckCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import RegistrationForm from "./registration-form"

interface RegisterPageProps {
    params: Promise<{ slug: string }>
}

export default async function RegisterPage({ params }: RegisterPageProps) {
    const session = await auth()
    if (!session?.user?.id) {
        const { slug } = await params
        redirect(`/sign-in?callbackUrl=/hackathons/${slug}/register`)
    }

    const { slug } = await params

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        select: {
            id: true,
            title: true,
            slug: true,
            tagline: true,
            mode: true,
            status: true,
            startDate: true,
            endDate: true,
            registrationStart: true,
            registrationEnd: true,
            maxParticipants: true,
            requireApproval: true,
            minTeamSize: true,
            maxTeamSize: true,
            organization: {
                select: { name: true, logo: true },
            },
            tracks: true,
            _count: {
                select: { registrations: true },
            },
        },
    })

    if (!hackathon) {
        notFound()
    }

    // Check if already registered
    const existingRegistration = await prisma.hackathonRegistration.findUnique({
        where: {
            hackathonId_userId: {
                hackathonId: hackathon.id,
                userId: session.user.id,
            },
        },
    })

    if (existingRegistration) {
        redirect(`/hackathons/${slug}?registered=true`)
    }

    // Check if registration is open
    const now = new Date()
    const canRegister =
        (hackathon.status === "REGISTRATION_OPEN" || hackathon.status === "PUBLISHED") &&
        now >= hackathon.registrationStart &&
        now <= hackathon.registrationEnd

    if (!canRegister) {
        redirect(`/hackathons/${slug}?error=registration-closed`)
    }

    // Check max participants
    if (hackathon.maxParticipants && hackathon._count.registrations >= hackathon.maxParticipants) {
        redirect(`/hackathons/${slug}?error=registration-full`)
    }

    const modeIcons = {
        VIRTUAL: Globe,
        IN_PERSON: MapPin,
        HYBRID: Globe,
    }
    const ModeIcon = modeIcons[hackathon.mode]

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/hackathons/${slug}`}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to hackathon
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Register for {hackathon.title}</h1>
                    <p className="text-gray-600 mt-1">Complete your application to participate</p>
                </div>

                {/* Hackathon Summary Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-start gap-4">
                        {hackathon.organization.logo ? (
                            <img
                                src={hackathon.organization.logo}
                                alt={hackathon.organization.name}
                                className="w-12 h-12 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-bold text-lg">
                                    {hackathon.organization.name.charAt(0)}
                                </span>
                            </div>
                        )}
                        <div className="flex-1">
                            <h2 className="font-semibold text-gray-900">{hackathon.title}</h2>
                            <p className="text-sm text-gray-600">by {hackathon.organization.name}</p>
                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <ModeIcon className="h-4 w-4" />
                                    {hackathon.mode.replace("_", " ")}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    Team size: {hackathon.minTeamSize}-{hackathon.maxTeamSize}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registration Notice */}
                {hackathon.requireApproval && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-amber-800">Application Required</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    This hackathon requires approval. Your application will be reviewed by the organizers
                                    and you'll receive a notification once a decision is made.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Registration Form */}
                <RegistrationForm 
                    hackathonId={hackathon.id} 
                    slug={slug}
                    requireApproval={hackathon.requireApproval}
                    tracks={hackathon.tracks}
                    mode={hackathon.mode}
                />
            </div>
        </div>
    )
}
