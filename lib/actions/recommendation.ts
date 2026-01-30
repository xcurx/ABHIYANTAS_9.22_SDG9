"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export type RecommendedHackathon = {
    id: string
    title: string
    slug: string
    description: string
    shortDescription: string | null
    bannerImage: string | null
    thumbnail: string | null
    status: string
    hackathonStart: Date
    hackathonEnd: Date
    registrationStart: Date
    registrationEnd: Date
    prizePool: number | null
    maxParticipants: number | null
    themes: string[]
    tags: string[]
    mode: string
    organization: {
        id: string
        name: string
        logo: string | null
        slug: string
    }
    _count: {
        registrations: number
    }
    matchScore: number
    matchedTags: string[]
    matchReason: string
}

export type RecommendationResult = {
    success: boolean
    recommendations: RecommendedHackathon[]
    message?: string
    userSkillCount: number
}

/**
 * Lightweight skill-based hackathon recommendation engine
 * 
 * Algorithm:
 * 1. Get user's skills from database
 * 2. Fetch active hackathons with their tags/themes
 * 3. Calculate match score based on:
 *    - Tag overlap with user skills (primary factor)
 *    - Theme relevance (secondary factor)
 *    - Recency and popularity boost
 * 4. Sort by match score and return top recommendations
 * 
 * Complexity: O(n * m) where n = hackathons, m = user skills
 * Very fast for typical use cases (< 1000 hackathons)
 */
export async function getRecommendedHackathons(limit = 6): Promise<RecommendationResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            success: false,
            recommendations: [],
            message: "You must be logged in to get recommendations",
            userSkillCount: 0,
        }
    }

    try {
        // Step 1: Get user's skills
        const userSkills = await prisma.userSkill.findMany({
            where: { userId: session.user.id },
            include: { skill: true },
        })

        const userSkillNames = new Set(
            userSkills.map(us => us.skill.name.toLowerCase())
        )
        const userSkillCategories = new Set(
            userSkills
                .map(us => us.skill.category?.toLowerCase())
                .filter((c): c is string => c !== null && c !== undefined)
        )

        // Step 2: Get user's already registered hackathons to exclude
        const userRegistrations = await prisma.hackathonRegistration.findMany({
            where: { userId: session.user.id },
            select: { hackathonId: true },
        })
        const registeredHackathonIds = new Set(userRegistrations.map(r => r.hackathonId))

        // Step 3: Fetch active hackathons
        const hackathons = await prisma.hackathon.findMany({
            where: {
                isPublic: true,
                status: {
                    in: ["PUBLISHED", "REGISTRATION_OPEN"],
                },
                registrationEnd: {
                    gte: new Date(), // Registration still open
                },
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        slug: true,
                    },
                },
                _count: {
                    select: { registrations: true },
                },
            },
            orderBy: { hackathonStart: "asc" },
        })

        // Step 4: Calculate match scores
        const scoredHackathons: RecommendedHackathon[] = []

        for (const hackathon of hackathons) {
            // Skip if already registered
            if (registeredHackathonIds.has(hackathon.id)) {
                continue
            }

            const { score, matchedTags, matchReason } = calculateMatchScore(
                hackathon,
                userSkillNames,
                userSkillCategories
            )

            scoredHackathons.push({
                id: hackathon.id,
                title: hackathon.title,
                slug: hackathon.slug,
                description: hackathon.description,
                shortDescription: hackathon.shortDescription,
                bannerImage: hackathon.bannerImage,
                thumbnail: hackathon.thumbnail,
                status: hackathon.status,
                hackathonStart: hackathon.hackathonStart,
                hackathonEnd: hackathon.hackathonEnd,
                registrationStart: hackathon.registrationStart,
                registrationEnd: hackathon.registrationEnd,
                prizePool: hackathon.prizePool,
                maxParticipants: hackathon.maxParticipants,
                themes: hackathon.themes,
                tags: hackathon.tags,
                mode: hackathon.mode,
                organization: hackathon.organization,
                _count: hackathon._count,
                matchScore: score,
                matchedTags,
                matchReason,
            })
        }

        // Step 5: Sort by match score (descending) and take top results
        scoredHackathons.sort((a, b) => {
            // Primary: match score
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore
            }
            // Secondary: hackathon start date (sooner = better)
            return new Date(a.hackathonStart).getTime() - new Date(b.hackathonStart).getTime()
        })

        const topRecommendations = scoredHackathons.slice(0, limit)

        // If user has no skills, return popular hackathons instead
        if (userSkillNames.size === 0) {
            // Sort by popularity for new users
            const popularHackathons = scoredHackathons
                .sort((a, b) => b._count.registrations - a._count.registrations)
                .slice(0, limit)
                .map(h => ({
                    ...h,
                    matchReason: "Popular hackathon",
                }))

            return {
                success: true,
                recommendations: popularHackathons,
                message: "Add skills to your profile for personalized recommendations!",
                userSkillCount: 0,
            }
        }

        return {
            success: true,
            recommendations: topRecommendations,
            userSkillCount: userSkillNames.size,
        }
    } catch (error) {
        console.error("Error getting recommendations:", error)
        return {
            success: false,
            recommendations: [],
            message: "Failed to get recommendations",
            userSkillCount: 0,
        }
    }
}

/**
 * Calculate match score for a hackathon based on user skills
 * Returns a score from 0-100
 */
function calculateMatchScore(
    hackathon: {
        tags: string[]
        themes: string[]
        prizePool: number | null
        _count: { registrations: number }
        isFeatured?: boolean
    },
    userSkillNames: Set<string>,
    userSkillCategories: Set<string>
): { score: number; matchedTags: string[]; matchReason: string } {
    let score = 0
    const matchedTags: string[] = []
    const reasons: string[] = []

    // Normalize hackathon tags and themes
    const hackathonTags = hackathon.tags.map(t => t.toLowerCase())
    const hackathonThemes = hackathon.themes.map(t => t.toLowerCase())

    // Tag matching (40 points max)
    for (const tag of hackathonTags) {
        // Direct skill match (10 points each, max 40)
        if (userSkillNames.has(tag)) {
            score += 10
            matchedTags.push(tag)
        } else {
            // Partial match - check if tag contains skill or vice versa
            for (const skill of userSkillNames) {
                if (tag.includes(skill) || skill.includes(tag)) {
                    score += 5
                    if (!matchedTags.includes(tag)) {
                        matchedTags.push(tag)
                    }
                    break
                }
            }
        }
    }
    score = Math.min(score, 40) // Cap at 40 points for tag matching

    // Theme matching with categories (30 points max)
    let themeScore = 0
    for (const theme of hackathonThemes) {
        // Check if theme matches skill categories
        if (userSkillCategories.has(theme)) {
            themeScore += 15
        }
        // Check if theme relates to user skills
        for (const skill of userSkillNames) {
            if (theme.includes(skill) || skill.includes(theme)) {
                themeScore += 10
                break
            }
        }
    }
    score += Math.min(themeScore, 30) // Cap at 30 points for theme matching

    // Keyword matching for common tech themes (15 points max)
    const techKeywords: Record<string, string[]> = {
        "ai": ["machine learning", "tensorflow", "pytorch", "data science", "python"],
        "ml": ["machine learning", "tensorflow", "pytorch", "data science", "python"],
        "web3": ["blockchain", "solidity", "ethereum", "web3"],
        "blockchain": ["solidity", "ethereum", "web3", "smart contracts"],
        "mobile": ["react native", "flutter", "android", "ios", "swift", "kotlin"],
        "frontend": ["react", "vue", "angular", "javascript", "typescript", "css"],
        "backend": ["node.js", "python", "java", "go", "rust", "api"],
        "fullstack": ["react", "node.js", "python", "javascript", "typescript"],
        "cloud": ["aws", "azure", "gcp", "docker", "kubernetes"],
        "devops": ["docker", "kubernetes", "aws", "ci/cd", "terraform"],
        "fintech": ["python", "java", "api", "database", "security"],
        "health": ["python", "data science", "machine learning", "api"],
        "sustainability": ["python", "data science", "iot", "analytics"],
        "gaming": ["unity", "c++", "javascript", "webgl", "3d"],
        "ar/vr": ["unity", "3d", "javascript", "python"],
        "iot": ["python", "c++", "arduino", "raspberry pi", "embedded"],
    }

    let keywordScore = 0
    const allTags = [...hackathonTags, ...hackathonThemes]
    for (const tag of allTags) {
        for (const [keyword, relatedSkills] of Object.entries(techKeywords)) {
            if (tag.includes(keyword)) {
                for (const skill of relatedSkills) {
                    if (userSkillNames.has(skill)) {
                        keywordScore += 5
                    }
                }
            }
        }
    }
    score += Math.min(keywordScore, 15)

    // Popularity boost (5 points max)
    const registrations = hackathon._count.registrations
    if (registrations > 100) score += 5
    else if (registrations > 50) score += 3
    else if (registrations > 10) score += 1

    // Prize pool boost (5 points max)
    if (hackathon.prizePool) {
        if (hackathon.prizePool >= 50000) score += 5
        else if (hackathon.prizePool >= 10000) score += 3
        else if (hackathon.prizePool >= 1000) score += 1
    }

    // Featured boost (5 points)
    if (hackathon.isFeatured) {
        score += 5
    }

    // Generate match reason
    if (matchedTags.length > 0) {
        reasons.push(`Matches your skills: ${matchedTags.slice(0, 3).join(", ")}`)
    }
    if (hackathon.prizePool && hackathon.prizePool >= 10000) {
        reasons.push(`$${hackathon.prizePool.toLocaleString()} prize pool`)
    }
    if (registrations > 50) {
        reasons.push("Popular event")
    }

    const matchReason = reasons.length > 0 ? reasons[0] : "Recommended for you"

    // Normalize to 0-100
    score = Math.min(Math.round(score), 100)

    return { score, matchedTags, matchReason }
}

/**
 * Get recommendation reasons for display
 */
export async function getRecommendationInsights() {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, insights: [] }
    }

    try {
        const userSkills = await prisma.userSkill.findMany({
            where: { userId: session.user.id },
            include: { skill: true },
        })

        const categoryCount: Record<string, number> = {}
        for (const us of userSkills) {
            const category = us.skill.category || "Other"
            categoryCount[category] = (categoryCount[category] || 0) + 1
        }

        const topCategories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category)

        return {
            success: true,
            insights: {
                totalSkills: userSkills.length,
                topCategories,
                recommendationBasis: topCategories.length > 0
                    ? `Based on your ${topCategories.join(", ")} skills`
                    : "Add skills for personalized recommendations",
            },
        }
    } catch (error) {
        console.error("Error getting insights:", error)
        return { success: false, insights: null }
    }
}
