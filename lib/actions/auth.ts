"use server"

import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { signUpSchema, signInSchema } from "@/lib/validations/auth"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export type ActionResult = {
    success: boolean
    message: string
    errors?: Record<string, string[]>
}

export async function registerUser(formData: FormData): Promise<ActionResult> {
    const rawData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    }

    // Validate input
    const validatedFields = signUpSchema.safeParse(rawData)
    
    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, email, password } = validatedFields.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (existingUser) {
        return {
            success: false,
            message: "An account with this email already exists",
            errors: { email: ["An account with this email already exists"] },
        }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user directly (no email verification for development)
    try {
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                emailVerified: new Date(), // Auto-verify for development
                role: "PARTICIPANT",
            },
        })

        return {
            success: true,
            message: "Account created successfully! Signing you in...",
        }
    } catch (error) {
        console.error("Registration error:", error)
        return {
            success: false,
            message: "Something went wrong. Please try again.",
        }
    }
}

export async function authenticateUser(formData: FormData): Promise<ActionResult> {
    const rawData = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    // Validate input
    const validatedFields = signInSchema.safeParse(rawData)
    
    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation failed",
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        await signIn("credentials", {
            email: rawData.email,
            password: rawData.password,
            redirect: false,
        })

        return {
            success: true,
            message: "Signed in successfully!",
        }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return {
                        success: false,
                        message: "Invalid email or password",
                    }
                default:
                    return {
                        success: false,
                        message: "Something went wrong. Please try again.",
                    }
            }
        }
        throw error
    }
}
