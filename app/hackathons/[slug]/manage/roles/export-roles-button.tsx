"use client"

import { Download } from "lucide-react"

interface Role {
    id: string
    role: string
    status: string
    invitedAt: Date
    respondedAt?: Date | null
    user: {
        id: string
        name: string | null
        email: string
        avatar: string | null
    }
    inviter: {
        name: string | null
    } | null
}

interface ExportRolesButtonProps {
    roles: Role[]
    roleType: "judges" | "mentors"
    hackathonTitle: string
}

export default function ExportRolesButton({ roles, roleType, hackathonTitle }: ExportRolesButtonProps) {
    const exportToCSV = () => {
        // Define CSV headers
        const headers = [
            "Name",
            "Email",
            "Role",
            "Status",
            "Invited At",
            "Responded At",
            "Invited By",
        ]

        // Convert roles to CSV rows
        const rows = roles.map((role) => [
            role.user.name || "",
            role.user.email,
            role.role,
            role.status,
            new Date(role.invitedAt).toISOString(),
            role.respondedAt ? new Date(role.respondedAt).toISOString() : "",
            role.inviter?.name || "",
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
            `${hackathonTitle.toLowerCase().replace(/\s+/g, "-")}-${roleType}.csv`
        )
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <button
            onClick={exportToCSV}
            disabled={roles.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
            <Download className="h-4 w-4" />
            Export
        </button>
    )
}
