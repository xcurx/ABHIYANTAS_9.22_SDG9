"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { SkillProficiency } from "@/generated/prisma/enums"

export type ActionResult = {
    success: boolean
    message: string
    data?: unknown
}

// Slugify a skill name
function slugifySkill(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
}

// Get all available skills
export async function getAllSkills() {
    try {
        const skills = await prisma.skill.findMany({
            orderBy: [
                { category: "asc" },
                { name: "asc" },
            ],
        })
        return { success: true, skills }
    } catch (error) {
        console.error("Error fetching skills:", error)
        return { success: false, skills: [], message: "Failed to fetch skills" }
    }
}

// Search skills by name
export async function searchSkills(query: string) {
    try {
        const skills = await prisma.skill.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { category: { contains: query, mode: "insensitive" } },
                ],
            },
            orderBy: { name: "asc" },
            take: 20,
        })
        return { success: true, skills }
    } catch (error) {
        console.error("Error searching skills:", error)
        return { success: false, skills: [], message: "Failed to search skills" }
    }
}

// Get user's skills
export async function getUserSkills(userId?: string) {
    const session = await auth()
    const targetUserId = userId || session?.user?.id

    if (!targetUserId) {
        return { success: false, skills: [], message: "User not found" }
    }

    try {
        const userSkills = await prisma.userSkill.findMany({
            where: { userId: targetUserId },
            include: {
                skill: true,
            },
            orderBy: {
                skill: { name: "asc" },
            },
        })

        return {
            success: true,
            skills: userSkills.map(us => ({
                id: us.skill.id,
                name: us.skill.name,
                category: us.skill.category,
                proficiency: us.proficiency,
                userSkillId: us.id,
            })),
        }
    } catch (error) {
        console.error("Error fetching user skills:", error)
        return { success: false, skills: [], message: "Failed to fetch user skills" }
    }
}

// Add a skill to user profile (creates skill if it doesn't exist)
export async function addUserSkill(
    skillName: string,
    proficiency: SkillProficiency = "INTERMEDIATE",
    category?: string
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    const trimmedName = skillName.trim()
    if (!trimmedName) {
        return { success: false, message: "Skill name is required" }
    }

    try {
        // Find or create the skill
        let skill = await prisma.skill.findFirst({
            where: {
                OR: [
                    { name: { equals: trimmedName, mode: "insensitive" } },
                    { slug: slugifySkill(trimmedName) },
                ],
            },
        })

        if (!skill) {
            // Create the skill
            skill = await prisma.skill.create({
                data: {
                    name: trimmedName,
                    slug: slugifySkill(trimmedName),
                    category: category || guessSkillCategory(trimmedName),
                },
            })
        }

        // Check if user already has this skill
        const existingUserSkill = await prisma.userSkill.findUnique({
            where: {
                userId_skillId: {
                    userId: session.user.id,
                    skillId: skill.id,
                },
            },
        })

        if (existingUserSkill) {
            return { success: false, message: "You already have this skill" }
        }

        // Add skill to user
        await prisma.userSkill.create({
            data: {
                userId: session.user.id,
                skillId: skill.id,
                proficiency,
            },
        })

        revalidatePath("/dashboard/profile")
        return { success: true, message: "Skill added successfully" }
    } catch (error) {
        console.error("Error adding skill:", error)
        return { success: false, message: "Failed to add skill" }
    }
}

// Remove a skill from user profile
export async function removeUserSkill(skillId: string): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    try {
        await prisma.userSkill.deleteMany({
            where: {
                userId: session.user.id,
                skillId,
            },
        })

        revalidatePath("/dashboard/profile")
        return { success: true, message: "Skill removed successfully" }
    } catch (error) {
        console.error("Error removing skill:", error)
        return { success: false, message: "Failed to remove skill" }
    }
}

// Update skill proficiency
export async function updateSkillProficiency(
    skillId: string,
    proficiency: SkillProficiency
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    try {
        await prisma.userSkill.updateMany({
            where: {
                userId: session.user.id,
                skillId,
            },
            data: { proficiency },
        })

        revalidatePath("/dashboard/profile")
        return { success: true, message: "Skill proficiency updated" }
    } catch (error) {
        console.error("Error updating skill proficiency:", error)
        return { success: false, message: "Failed to update skill proficiency" }
    }
}

// Batch update user skills (replaces all user skills)
export async function updateUserSkills(
    skillNames: string[]
): Promise<ActionResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in" }
    }

    try {
        // Delete all existing user skills
        await prisma.userSkill.deleteMany({
            where: { userId: session.user.id },
        })

        // Add new skills
        for (const skillName of skillNames) {
            const trimmedName = skillName.trim()
            if (!trimmedName) continue

            // Find or create the skill
            let skill = await prisma.skill.findFirst({
                where: {
                    OR: [
                        { name: { equals: trimmedName, mode: "insensitive" } },
                        { slug: slugifySkill(trimmedName) },
                    ],
                },
            })

            if (!skill) {
                skill = await prisma.skill.create({
                    data: {
                        name: trimmedName,
                        slug: slugifySkill(trimmedName),
                        category: guessSkillCategory(trimmedName),
                    },
                })
            }

            await prisma.userSkill.create({
                data: {
                    userId: session.user.id,
                    skillId: skill.id,
                    proficiency: "INTERMEDIATE",
                },
            })
        }

        revalidatePath("/dashboard/profile")
        return { success: true, message: "Skills updated successfully" }
    } catch (error) {
        console.error("Error updating skills:", error)
        return { success: false, message: "Failed to update skills" }
    }
}

// Helper function to guess skill category based on name
function guessSkillCategory(skillName: string): string {
    const name = skillName.toLowerCase()

    const categories: Record<string, string[]> = {
        "Programming Language": [
            "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust",
            "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl", "lua",
            "haskell", "elixir", "clojure", "dart", "objective-c", "shell", "bash"
        ],
        "Frontend": [
            "react", "vue", "angular", "svelte", "next.js", "nextjs", "nuxt", "gatsby",
            "html", "css", "sass", "less", "tailwind", "bootstrap", "material-ui",
            "chakra", "styled-components", "webpack", "vite", "redux", "mobx"
        ],
        "Backend": [
            "node.js", "nodejs", "express", "fastify", "nest.js", "nestjs", "django",
            "flask", "fastapi", "spring", "rails", "laravel", "asp.net", "graphql",
            "rest", "api", "microservices"
        ],
        "Database": [
            "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch",
            "dynamodb", "firebase", "supabase", "prisma", "sql", "nosql", "sqlite",
            "oracle", "cassandra", "neo4j"
        ],
        "Cloud & DevOps": [
            "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
            "terraform", "ansible", "jenkins", "github actions", "ci/cd", "linux",
            "nginx", "vercel", "netlify", "heroku", "digitalocean"
        ],
        "AI & ML": [
            "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
            "scikit-learn", "nlp", "computer vision", "opencv", "neural networks",
            "ai", "artificial intelligence", "data science", "pandas", "numpy",
            "langchain", "llm", "chatgpt", "openai"
        ],
        "Mobile": [
            "react native", "flutter", "android", "ios", "swift", "kotlin",
            "xamarin", "ionic", "cordova", "expo"
        ],
        "Blockchain": [
            "solidity", "ethereum", "web3", "smart contracts", "defi", "nft",
            "blockchain", "crypto", "hardhat", "truffle"
        ],
        "Design": [
            "figma", "sketch", "adobe xd", "ui/ux", "user experience", "user interface",
            "photoshop", "illustrator", "design systems", "prototyping"
        ],
    }

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => name.includes(keyword))) {
            return category
        }
    }

    return "Other"
}

// Get popular skills (for suggestions)
export async function getPopularSkills(limit = 20) {
    try {
        const skills = await prisma.skill.findMany({
            include: {
                _count: {
                    select: { userSkills: true },
                },
            },
            orderBy: {
                userSkills: {
                    _count: "desc",
                },
            },
            take: limit,
        })

        return {
            success: true,
            skills: skills.map(s => ({
                id: s.id,
                name: s.name,
                category: s.category,
                userCount: s._count.userSkills,
            })),
        }
    } catch (error) {
        console.error("Error fetching popular skills:", error)
        return { success: false, skills: [], message: "Failed to fetch popular skills" }
    }
}

// Seed some common skills (admin only or during setup)
export async function seedCommonSkills(): Promise<ActionResult> {
    const commonSkills = [
        { name: "JavaScript", category: "Programming Language" },
        { name: "TypeScript", category: "Programming Language" },
        { name: "Python", category: "Programming Language" },
        { name: "Java", category: "Programming Language" },
        { name: "C++", category: "Programming Language" },
        { name: "Go", category: "Programming Language" },
        { name: "Rust", category: "Programming Language" },
        { name: "React", category: "Frontend" },
        { name: "Vue.js", category: "Frontend" },
        { name: "Angular", category: "Frontend" },
        { name: "Next.js", category: "Frontend" },
        { name: "Tailwind CSS", category: "Frontend" },
        { name: "Node.js", category: "Backend" },
        { name: "Express", category: "Backend" },
        { name: "Django", category: "Backend" },
        { name: "FastAPI", category: "Backend" },
        { name: "GraphQL", category: "Backend" },
        { name: "PostgreSQL", category: "Database" },
        { name: "MongoDB", category: "Database" },
        { name: "Redis", category: "Database" },
        { name: "AWS", category: "Cloud & DevOps" },
        { name: "Docker", category: "Cloud & DevOps" },
        { name: "Kubernetes", category: "Cloud & DevOps" },
        { name: "Machine Learning", category: "AI & ML" },
        { name: "TensorFlow", category: "AI & ML" },
        { name: "PyTorch", category: "AI & ML" },
        { name: "React Native", category: "Mobile" },
        { name: "Flutter", category: "Mobile" },
        { name: "Solidity", category: "Blockchain" },
        { name: "Web3", category: "Blockchain" },
        { name: "Figma", category: "Design" },
        { name: "UI/UX Design", category: "Design" },
    ]

    try {
        for (const skill of commonSkills) {
            await prisma.skill.upsert({
                where: { slug: slugifySkill(skill.name) },
                create: {
                    name: skill.name,
                    slug: slugifySkill(skill.name),
                    category: skill.category,
                },
                update: {}, // Don't update if exists
            })
        }

        return { success: true, message: `Seeded ${commonSkills.length} common skills` }
    } catch (error) {
        console.error("Error seeding skills:", error)
        return { success: false, message: "Failed to seed skills" }
    }
}
