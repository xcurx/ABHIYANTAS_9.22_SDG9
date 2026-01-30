import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET() {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ count: 0 })
    }

    const count = await prisma.notification.count({
        where: {
            userId: session.user.id,
            isRead: false,
        },
    })

    return NextResponse.json({ count })
}
