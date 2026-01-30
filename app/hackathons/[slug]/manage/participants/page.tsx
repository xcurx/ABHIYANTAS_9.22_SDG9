import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { formatDateTime } from "@/lib/utils"
import ParticipantActions from "./participant-actions"

interface ParticipantsPageProps {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ status?: string }>
}

export default async function ParticipantsPage({ params, searchParams }: ParticipantsPageProps) {
    const { slug } = await params
    const { status } = await searchParams

    const hackathon = await prisma.hackathon.findUnique({
        where: { slug },
        include: {
            registrations: {
                where: status ? { status: status as any } : undefined,
                orderBy: { registeredAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    registrations: {
                        where: { status: "APPROVED" },
                    },
                },
            },
        },
    })

    if (!hackathon) {
        notFound()
    }

    const statusCounts = await prisma.hackathonRegistration.groupBy({
        by: ["status"],
        where: { hackathonId: hackathon.id },
        _count: true,
    })

    const counts = {
        all: statusCounts.reduce((acc: number, s) => acc + s._count, 0),
        PENDING: statusCounts.find((s) => s.status === "PENDING")?._count || 0,
        APPROVED: statusCounts.find((s) => s.status === "APPROVED")?._count || 0,
        REJECTED: statusCounts.find((s) => s.status === "REJECTED")?._count || 0,
        CANCELLED: statusCounts.find((s) => s.status === "CANCELLED")?._count || 0,
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-wrap gap-2">
                    <a
                        href={`/hackathons/${slug}/manage/participants`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            !status
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        All ({counts.all})
                    </a>
                    <a
                        href={`/hackathons/${slug}/manage/participants?status=PENDING`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Pending ({counts.PENDING})
                    </a>
                    <a
                        href={`/hackathons/${slug}/manage/participants?status=APPROVED`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            status === "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Approved ({counts.APPROVED})
                    </a>
                    <a
                        href={`/hackathons/${slug}/manage/participants?status=REJECTED`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Rejected ({counts.REJECTED})
                    </a>
                </div>
            </div>

            {/* Participants Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Participant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Registered At
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {hackathon.registrations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No participants found
                                    </td>
                                </tr>
                            ) : (
                                hackathon.registrations.map((registration) => (
                                    <tr key={registration.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                                                    {registration.user.name?.[0]?.toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {registration.user.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {registration.user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDateTime(registration.registeredAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                                    registration.status === "APPROVED"
                                                        ? "bg-green-100 text-green-700"
                                                        : registration.status === "PENDING"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : registration.status === "REJECTED"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {registration.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ParticipantActions
                                                registrationId={registration.id}
                                                currentStatus={registration.status}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
