"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { updateUserSkills } from "./skill"

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
    const bio = formData.get("bio") as string
    const location = formData.get("location") as string
    const github = formData.get("github") as string
    const linkedin = formData.get("linkedin") as string
    const twitter = formData.get("twitter") as string
    const portfolio = formData.get("portfolio") as string
    const skillsJson = formData.get("skills") as string

    if (!name || name.trim().length < 2) {
        return {
            success: false,
            message: "Name must be at least 2 characters",
        }
    }

    try {
        // Update user profile
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name.trim(),
                avatar: avatar?.trim() || null,
                bio: bio?.trim() || null,
                location: location?.trim() || null,
                github: github?.trim() || null,
                linkedin: linkedin?.trim() || null,
                twitter: twitter?.trim() || null,
                portfolio: portfolio?.trim() || null,
            },
        })

        // Update skills if provided
        if (skillsJson) {
            try {
                const skills = JSON.parse(skillsJson) as string[]
                await updateUserSkills(skills)
            } catch {
                console.error("Failed to parse skills JSON")
            }
        }

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
