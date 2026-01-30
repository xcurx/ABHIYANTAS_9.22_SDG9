"use client"

import { Download } from "lucide-react"

interface Registration {
    id: string
    status: string
    registeredAt: Date
    motivation?: string | null
    experience?: string | null
    skills?: string[]
    portfolioUrl?: string | null
    lookingForTeam?: boolean
    teamPreferences?: string | null
    tshirtSize?: string | null
    dietaryRestrictions?: string | null
    user: {
        id: string
        name: string | null
        email: string
        avatar: string | null
    }
}

interface ExportButtonProps {
    registrations: Registration[]
    hackathonTitle: string
}

export default function ExportButton({ registrations, hackathonTitle }: ExportButtonProps) {
    const exportToCSV = () => {
        // Define CSV headers
        const headers = [
            "Name",
            "Email",
            "Status",
            "Registered At",
            "Skills",
            "Looking For Team",
            "Team Preferences",
            "Motivation",
            "Experience",
            "Portfolio URL",
            "T-Shirt Size",
            "Dietary Restrictions",
        ]

        // Convert registrations to CSV rows
        const rows = registrations.map((reg) => [
            reg.user.name || "",
            reg.user.email,
            reg.status,
            new Date(reg.registeredAt).toISOString(),
            reg.skills?.join("; ") || "",
            reg.lookingForTeam ? "Yes" : "No",
            reg.teamPreferences || "",
            reg.motivation || "",
            reg.experience || "",
            reg.portfolioUrl || "",
            reg.tshirtSize || "",
            reg.dietaryRestrictions || "",
        ])

        // Escape CSV values (handle commas, quotes, newlines)
        const escapeCSV = (value: string) => {
            if (value.includes(",") || value.includes('"') || value.includes("\n")) {
                return `"${value.replace(/"/g, '""')}"`
            }
            return value
        }

        // Build CSV content
        const csvContent = [
            headers.map(escapeCSV).join(","),
            ...rows.map((row) => row.map(escapeCSV).join(",")),
        ].join("\n")

        // Create and download the file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute(
            "download",
            `${hackathonTitle.toLowerCase().replace(/\s+/g, "-")}-participants.csv`
        )
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <button
            onClick={exportToCSV}
            disabled={registrations.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
            <Download className="h-4 w-4" />
            Export CSV
        </button>
    )
}
