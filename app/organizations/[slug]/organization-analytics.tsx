"use client"

import { useRef } from "react"
import html2canvas from "html2canvas"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts"
import { BarChart3, PieChartIcon, TrendingUp, Users, Trophy, UsersRound, Download, ImageIcon, FileSpreadsheet } from "lucide-react"

interface AnalyticsData {
    totalHackathons: number
    totalParticipants: number
    totalTeams: number
    hackathonsByStatus: Record<string, number>
    registrationsByStatus: Record<string, number>
    participantsPerHackathon: {
        name: string
        fullName: string
        participants: number
        teams: number
    }[]
    hackathonsByMonth: {
        month: string
        count: number
    }[]
}

interface OrganizationAnalyticsProps {
    analytics: AnalyticsData
}

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "#9CA3AF",
    UPCOMING: "#3B82F6",
    OPEN: "#10B981",
    IN_PROGRESS: "#8B5CF6",
    JUDGING: "#F59E0B",
    COMPLETED: "#6366F1",
    CANCELLED: "#EF4444",
}

const REGISTRATION_COLORS: Record<string, string> = {
    PENDING: "#F59E0B",
    APPROVED: "#10B981",
    REJECTED: "#EF4444",
    WAITLISTED: "#8B5CF6",
    CANCELLED: "#9CA3AF",
}

const CHART_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"]

export default function OrganizationAnalytics({ analytics }: OrganizationAnalyticsProps) {
    const hackathonStatusChartRef = useRef<HTMLDivElement>(null)
    const registrationStatusChartRef = useRef<HTMLDivElement>(null)
    const participantsChartRef = useRef<HTMLDivElement>(null)
    const hackathonsOverTimeChartRef = useRef<HTMLDivElement>(null)

    const hackathonStatusData = Object.entries(analytics.hackathonsByStatus).map(([status, count]) => ({
        name: status.replace("_", " "),
        value: count,
        color: STATUS_COLORS[status] || "#9CA3AF",
    }))

    const registrationStatusData = Object.entries(analytics.registrationsByStatus).map(([status, count]) => ({
        name: status,
        value: count,
        color: REGISTRATION_COLORS[status] || "#9CA3AF",
    }))

    const exportChartAsImage = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
        if (!ref.current) return
        try {
            const canvas = await html2canvas(ref.current, {
                backgroundColor: "#ffffff",
                scale: 2,
            })
            const url = canvas.toDataURL("image/png")
            const link = document.createElement("a")
            link.download = `${filename}.png`
            link.href = url
            link.click()
        } catch (error) {
            console.error("Failed to export chart:", error)
        }
    }

    const exportDataAsCSV = (data: { name: string; value: number }[], filename: string) => {
        const headers = ["Name", "Value"]
        const rows = data.map((item) => [item.name, item.value.toString()])
        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.join(",")),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${filename}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    const exportParticipantsDataAsCSV = () => {
        const headers = ["Hackathon", "Participants", "Teams"]
        const rows = analytics.participantsPerHackathon.map((item) => [
            `"${item.fullName}"`,
            item.participants.toString(),
            item.teams.toString(),
        ])
        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.join(",")),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "participants-per-hackathon.csv"
        link.click()
        URL.revokeObjectURL(url)
    }

    const hasData = analytics.totalHackathons > 0

    if (!hasData) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Yet</h3>
                <p className="text-gray-500">
                    Analytics will appear here once you host your first hackathon.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Hackathons</p>
                            <p className="text-2xl font-bold text-indigo-600">{analytics.totalHackathons}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Participants</p>
                            <p className="text-2xl font-bold text-purple-600">{analytics.totalParticipants}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <UsersRound className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Teams</p>
                            <p className="text-2xl font-bold text-green-600">{analytics.totalTeams}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hackathon Status Pie Chart */}
                {hackathonStatusData.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                    <PieChartIcon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Hackathons by Status</h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => exportChartAsImage(hackathonStatusChartRef, "hackathons-by-status")}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Export as Image"
                                >
                                    <ImageIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => exportDataAsCSV(hackathonStatusData, "hackathons-by-status")}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Export as CSV"
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div ref={hackathonStatusChartRef} className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={hackathonStatusData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={45}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {hackathonStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                        formatter={(value, name) => [value, name]}
                                    />
                                    <Legend 
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        formatter={(value, entry) => {
                                            const item = hackathonStatusData.find(d => d.name === value)
                                            return `${value}: ${item?.value || 0}`
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Registration Status Pie Chart */}
                {registrationStatusData.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <PieChartIcon className="h-5 w-5 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Registrations by Status</h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => exportChartAsImage(registrationStatusChartRef, "registrations-by-status")}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Export as Image"
                                >
                                    <ImageIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => exportDataAsCSV(registrationStatusData, "registrations-by-status")}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Export as CSV"
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div ref={registrationStatusChartRef} className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={registrationStatusData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={45}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {registrationStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                        formatter={(value, name) => [value, name]}
                                    />
                                    <Legend 
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        formatter={(value, entry) => {
                                            const item = registrationStatusData.find(d => d.name === value)
                                            return `${value}: ${item?.value || 0}`
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Participants per Hackathon Bar Chart */}
            {analytics.participantsPerHackathon.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Participants & Teams per Hackathon</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => exportChartAsImage(participantsChartRef, "participants-per-hackathon")}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Export as Image"
                            >
                                <ImageIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={exportParticipantsDataAsCSV}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Export as CSV"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div ref={participantsChartRef} className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={analytics.participantsPerHackathon}
                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                    formatter={(value, name) => [value, name === "participants" ? "Participants" : "Teams"]}
                                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                                />
                                <Legend />
                                <Bar dataKey="participants" fill="#8B5CF6" name="Participants" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="teams" fill="#10B981" name="Teams" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Hackathons Over Time */}
            {analytics.hackathonsByMonth.length > 1 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Hackathons Over Time</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => exportChartAsImage(hackathonsOverTimeChartRef, "hackathons-over-time")}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Export as Image"
                            >
                                <ImageIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => exportDataAsCSV(
                                    analytics.hackathonsByMonth.map(m => ({ name: m.month, value: m.count })),
                                    "hackathons-over-time"
                                )}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Export as CSV"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div ref={hackathonsOverTimeChartRef} className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={analytics.hackathonsByMonth}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                    formatter={(value) => [value, "Hackathons"]}
                                />
                                <Bar dataKey="count" fill="#6366F1" name="Hackathons" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    )
}
