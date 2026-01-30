import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Bell, CheckCheck, Info, AlertTriangle, Megaphone, Clock, Check } from "lucide-react"
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions/announcement"
import { revalidatePath } from "next/cache"

export const metadata = {
    title: "Notifications - ELEVATE",
}

export default async function NotificationsPage() {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/sign-in")
    }

    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            announcement: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    priority: true,
                    hackathon: {
                        select: { slug: true, title: true }
                    }
                },
            },
        },
        take: 100,
    })

    const unreadCount = notifications.filter((n: { isRead: boolean }) => !n.isRead).length

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "URGENT":
            case "WARNING":
                return <AlertTriangle className="h-5 w-5 text-orange-500" />
            case "ANNOUNCEMENT":
                return <Megaphone className="h-5 w-5 text-indigo-500" />
            default:
                return <Info className="h-5 w-5 text-blue-500" />
        }
    }

    const formatTime = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return "Just now"
        if (minutes < 60) return `${minutes} minutes ago`
        if (hours < 24) return `${hours} hours ago`
        if (days < 7) return `${days} days ago`
        return new Date(date).toLocaleDateString()
    }

    async function markAllRead() {
        "use server"
        await markAllNotificationsAsRead()
        revalidatePath("/notifications")
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600 mt-1">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "All caught up!"}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <form action={markAllRead}>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all as read
                        </button>
                    </form>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Bell className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                        <p className="text-gray-600 mt-1">
                            You'll see notifications here when there are updates about your hackathons.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
                    {notifications.map((notification: NotificationItemProps["notification"]) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            getNotificationIcon={getNotificationIcon}
                            formatTime={formatTime}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

interface NotificationItemProps {
    notification: {
        id: string
        type: string
        title: string
        message: string
        isRead: boolean
        createdAt: Date
        announcement: {
            id: string
            title: string
            type: string
            priority: string
            hackathon: { slug: string; title: string } | null
        } | null
    }
    getNotificationIcon: (type: string) => React.ReactNode
    formatTime: (date: Date) => string
}

function NotificationItem({ notification, getNotificationIcon, formatTime }: NotificationItemProps) {
    async function markRead() {
        "use server"
        await markNotificationAsRead(notification.id)
        revalidatePath("/notifications")
    }

    return (
        <div className={`p-4 ${!notification.isRead ? "bg-indigo-50/50" : ""}`}>
            <div className="flex gap-4">
                <div className="flex-shrink-0 mt-0.5">
                    <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
                        {getNotificationIcon(notification.type)}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className={`text-sm text-gray-900 ${!notification.isRead ? "font-semibold" : ""}`}>
                                {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                            </p>
                            {notification.announcement?.hackathon && (
                                <a
                                    href={`/hackathons/${notification.announcement.hackathon.slug}`}
                                    className="inline-block mt-2 text-sm text-indigo-600 hover:underline"
                                >
                                    {notification.announcement.hackathon.title} →
                                </a>
                            )}
                        </div>
                        {!notification.isRead && (
                            <form action={markRead}>
                                <button
                                    type="submit"
                                    className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Mark as read"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                            </form>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{formatTime(notification.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
