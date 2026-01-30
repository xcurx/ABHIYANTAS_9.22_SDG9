"use client"

import { useState } from "react"
import Link from "next/link"

interface Notification {
    id: string
    type: "hackathon" | "contest" | "organization" | "system" | "achievement"
    title: string
    message: string
    time: string
    read: boolean
    link?: string
}

// Static notification data
const initialNotifications: Notification[] = [
    {
        id: "1",
        type: "hackathon",
        title: "New Hackathon Starting Soon!",
        message: "AI Innovation Challenge 2026 starts in 2 days. Don't forget to prepare your team!",
        time: "2 hours ago",
        read: false,
        link: "/hackathons",
    },
    {
        id: "2",
        type: "achievement",
        title: "Achievement Unlocked! 🏆",
        message: "You've earned the 'Early Adopter' badge for joining ELEVATE!",
        time: "5 hours ago",
        read: false,
    },
    {
        id: "3",
        type: "organization",
        title: "Team Invite Received",
        message: "You've been invited to join 'Tech Innovators' organization.",
        time: "1 day ago",
        read: false,
        link: "/organizations",
    },
    {
        id: "4",
        type: "contest",
        title: "Coding Contest Results",
        message: "Results for 'Algorithm Masters Weekly' are now available!",
        time: "2 days ago",
        read: true,
        link: "/coding-contests",
    },
    {
        id: "5",
        type: "system",
        title: "Profile Incomplete",
        message: "Complete your profile to unlock more features and improve visibility.",
        time: "3 days ago",
        read: true,
        link: "/dashboard/profile",
    },
]

const typeIcons = {
    hackathon: (
        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    ),
    contest: (
        <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    ),
    organization: (
        <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    system: (
        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    achievement: (
        <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    ),
}

const typeBgColors = {
    hackathon: "bg-blue-100",
    contest: "bg-purple-100",
    organization: "bg-orange-100",
    system: "bg-gray-100",
    achievement: "bg-amber-100",
}

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
    const [filter, setFilter] = useState<"all" | "unread">("all")

    const unreadCount = notifications.filter((n) => !n.read).length
    const filteredNotifications = filter === "unread" 
        ? notifications.filter((n) => !n.read) 
        : notifications

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
    }

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    const clearAll = () => {
        setNotifications([])
    }

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Panel */}
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setFilter("all")}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                        filter === "all"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter("unread")}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                        filter === "unread"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                    }`}
                                >
                                    Unread
                                </button>
                                <div className="flex-1" />
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {filteredNotifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 font-medium">No notifications</p>
                                    <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-gray-50 transition-colors ${
                                                !notification.read ? "bg-blue-50/50" : ""
                                            }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`h-10 w-10 rounded-xl ${typeBgColors[notification.type]} flex items-center justify-center flex-shrink-0`}>
                                                    {typeIcons[notification.type]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.read && (
                                                            <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-xs text-gray-400">{notification.time}</span>
                                                        <div className="flex items-center gap-2">
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                                                                >
                                                                    Mark read
                                                                </button>
                                                            )}
                                                            {notification.link && (
                                                                <Link
                                                                    href={notification.link}
                                                                    onClick={() => {
                                                                        markAsRead(notification.id)
                                                                        setIsOpen(false)
                                                                    }}
                                                                    className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                                                                >
                                                                    View
                                                                </Link>
                                                            )}
                                                            <button
                                                                onClick={() => deleteNotification(notification.id)}
                                                                className="text-xs text-gray-400 hover:text-red-500"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                                <Link
                                    href="/dashboard/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    View all notifications
                                </Link>
                                <button
                                    onClick={clearAll}
                                    className="text-sm text-gray-500 hover:text-red-500 font-medium"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
