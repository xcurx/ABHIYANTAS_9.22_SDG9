"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Users, Trophy, FileText, Settings, Calendar } from "lucide-react"

const tabs = [
    { href: "", label: "Overview", icon: BarChart3 },
    { href: "/participants", label: "Participants", icon: Users },
    { href: "/tracks", label: "Tracks", icon: FileText },
    { href: "/prizes", label: "Prizes", icon: Trophy },
    { href: "/stages", label: "Timeline", icon: Calendar },
    { href: "/settings", label: "Settings", icon: Settings },
]

export default function ManageTabs({ slug }: { slug: string }) {
    const pathname = usePathname()
    const basePath = `/hackathons/${slug}/manage`

    return (
        <div className="border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4">
                <nav className="flex gap-1 overflow-x-auto py-2">
                    {tabs.map((tab) => {
                        const href = `${basePath}${tab.href}`
                        const isActive = tab.href === "" 
                            ? pathname === basePath
                            : pathname.startsWith(href)
                        const Icon = tab.icon

                        return (
                            <Link
                                key={tab.href}
                                href={href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
                                    isActive
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
