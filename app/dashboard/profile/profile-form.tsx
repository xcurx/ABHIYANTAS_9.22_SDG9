"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { updateProfile } from "@/lib/actions/user"
import { Camera, X, Plus, Github, Linkedin, Globe, Save, Loader2 } from "lucide-react"

type UserRole = "SUPER_ADMIN" | "ORGANIZATION_ADMIN" | "MENTOR" | "JUDGE" | "PARTICIPANT" | "SPONSOR"

type User = {
    id: string
    name: string | null
    email: string
    avatar: string | null
    role: UserRole
    createdAt: Date
}

type MockData = {
    bio: string
    location: string
    skills: string[]
    github: string
    linkedin: string
    twitter: string
    portfolio: string
}

export default function ProfileForm({ user, mockData }: { user: User; mockData?: MockData }) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    
    // Form state with mock data fallbacks
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar)
    const [name, setName] = useState(user.name || "")
    const [bio, setBio] = useState(mockData?.bio || "")
    const [location, setLocation] = useState(mockData?.location || "")
    const [skills, setSkills] = useState<string[]>(mockData?.skills || [])
    const [newSkill, setNewSkill] = useState("")
    const [github, setGithub] = useState(mockData?.github || "")
    const [linkedin, setLinkedin] = useState(mockData?.linkedin || "")
    const [twitter, setTwitter] = useState(mockData?.twitter || "")
    const [portfolio, setPortfolio] = useState(mockData?.portfolio || "")

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Create preview URL
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()])
            setNewSkill("")
        }
    }

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAddSkill()
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        const formData = new FormData()
        formData.append("name", name)
        formData.append("avatar", avatarPreview || "")

        const result = await updateProfile(formData)
        
        if (result.success) {
            setMessage({ type: "success", text: "Profile updated successfully! (Note: Some features use mock data)" })
            router.refresh()
        } else {
            setMessage({ type: "error", text: result.message })
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {message && (
                <div
                    className={`rounded-lg p-4 ${
                        message.type === "success"
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                >
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            {/* Avatar Upload Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative group">
                    <div 
                        onClick={handleAvatarClick}
                        className="h-24 w-24 rounded-xl bg-blue-100 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
                    >
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar"
                                className="h-24 w-24 object-cover"
                            />
                        ) : (
                            <span className="text-4xl font-bold text-blue-600">
                                {name?.charAt(0) || user.email.charAt(0)}
                            </span>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                            <Camera className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                </div>
                <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Profile Photo</h4>
                    <p className="text-sm text-gray-500 mt-1">
                        Click on the avatar to upload a new photo. JPG, PNG or GIF. Max 2MB.
                    </p>
                    <div className="flex gap-2 mt-3">
                        <button
                            type="button"
                            onClick={handleAvatarClick}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            Upload new
                        </button>
                        {avatarPreview && (
                            <button
                                type="button"
                                onClick={() => setAvatarPreview(null)}
                                className="text-sm font-medium text-red-600 hover:text-red-700"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="John Doe"
                        />
                    </div>

                    {/* Email (read-only) */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={user.email}
                            disabled
                            className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="San Francisco, CA"
                        />
                    </div>

                    {/* Role (read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                        <div className="px-4 py-2.5">
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div className="mt-6">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Bio
                    </label>
                    <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                        placeholder="Tell us about yourself..."
                    />
                    <p className="mt-1 text-xs text-gray-500">{bio.length}/500 characters</p>
                </div>
            </div>

            {/* Skills Section */}
            <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Skills & Expertise</h4>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="Add a skill (e.g., React, Python, UI/UX)"
                        />
                        <button
                            type="button"
                            onClick={handleAddSkill}
                            disabled={!newSkill.trim()}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add
                        </button>
                    </div>
                    
                    {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700"
                                >
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSkill(skill)}
                                        className="hover:text-blue-900 transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    
                    {skills.length === 0 && (
                        <p className="text-sm text-gray-500">No skills added yet. Add your first skill above.</p>
                    )}
                </div>
            </div>

            {/* Social Links Section */}
            <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Social Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1.5">
                            GitHub
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Github className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="github"
                                value={github}
                                onChange={(e) => setGithub(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="github.com/username"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1.5">
                            LinkedIn
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Linkedin className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="linkedin"
                                value={linkedin}
                                onChange={(e) => setLinkedin(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="linkedin.com/in/username"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Twitter / X
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </div>
                            <input
                                type="text"
                                id="twitter"
                                value={twitter}
                                onChange={(e) => setTwitter(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="twitter.com/username"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Portfolio Website
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Globe className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="portfolio"
                                value={portfolio}
                                onChange={(e) => setPortfolio(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="yourwebsite.com"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6 flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
