"use client"

import { Download } from "lucide-react"

interface Registration {
    id: string
    status: string
    registeredAt: Date
    motivation?: string | null
    skills?: string[]
    hackathon: {
        id: string
        title: string
        slug: string
        mode: string
        status: string
        hackathonStart: Date | null
        hackathonEnd: Date | null
        organization: {
            name: string
            logo: string | null
        }
        _count: {
            registrations: number
        }
    }
}

interface ExportHackathonsButtonProps {
    registrations: Registration[]
}

export default function ExportHackathonsButton({ registrations }: ExportHackathonsButtonProps) {
    const exportToCSV = () => {
        // Define CSV headers
        const headers = [
            "Hackathon Title",
            "Organization",
            "Mode",
            "Hackathon Status",
            "Application Status",
            "Start Date",
            "End Date",
            "Registered At",
            "Skills",
            "Motivation",
            "Total Participants",
        ]

        // Convert registrations to CSV rows
        const rows = registrations.map((reg) => [
            reg.hackathon.title,
            reg.hackathon.organization.name,
            reg.hackathon.mode,
            reg.hackathon.status,
            reg.status,
            reg.hackathon.hackathonStart ? new Date(reg.hackathon.hackathonStart).toISOString().split("T")[0] : "",
            reg.hackathon.hackathonEnd ? new Date(reg.hackathon.hackathonEnd).toISOString().split("T")[0] : "",
            new Date(reg.registeredAt).toISOString().split("T")[0],
            reg.skills?.join("; ") || "",
            reg.motivation || "",
            reg.hackathon._count.registrations.toString(),
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
        link.setAttribute("download", `my-hackathons-${new Date().toISOString().split("T")[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <button
            onClick={exportToCSV}
            disabled={registrations.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Download className="h-4 w-4" />
            Export CSV
        </button>
    )
}
