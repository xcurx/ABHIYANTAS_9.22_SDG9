import { redirect } from "next/navigation"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import HackathonWizard from "./hackathon-wizard"

export const metadata = {
    title: "Create Hackathon | ELEVATE",
    description: "Create a new hackathon event",
}

export default async function NewHackathonPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/sign-in?callbackUrl=/hackathons/new")
    }

    // Get user's organizations where they are admin or owner
    const memberships = await prisma.organizationMember.findMany({
        where: {
            userId: session.user.id,
            role: { in: ["OWNER", "ADMIN"] },
        },
        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },
        },
    })

    const organizations = memberships.map((m) => m.organization)

    return <HackathonWizard organizations={organizations} />
}
