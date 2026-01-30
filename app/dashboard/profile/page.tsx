import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ProfileForm from "./profile-form"
import prisma from "@/lib/prisma"

export default async function ProfilePage() {
    const session = await auth()
    
    if (!session) {
        redirect("/sign-in")
    }

    // Fetch full user data from database
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            createdAt: true,
        },
    })

    if (!user) {
        redirect("/sign-in")
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Edit Profile
                    </h1>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <ProfileForm user={user} />
                </div>
            </main>
        </div>
    )
}
