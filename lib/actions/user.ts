"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type ActionResult = {
    success: boolean
    message: string
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
    const session = await auth()
    
    if (!session?.user?.id) {
        return {
            success: false,
            message: "You must be logged in to update your profile",
        }
    }

    const name = formData.get("name") as string
    const avatar = formData.get("avatar") as string

    if (!name || name.trim().length < 2) {
        return {
            success: false,
            message: "Name must be at least 2 characters",
        }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name.trim(),
                avatar: avatar?.trim() || null,
            },
        })

        revalidatePath("/dashboard")
        revalidatePath("/dashboard/profile")

        return {
            success: true,
            message: "Profile updated successfully!",
        }
    } catch (error) {
        console.error("Profile update error:", error)
        return {
            success: false,
            message: "Failed to update profile. Please try again.",
        }
    }
}
