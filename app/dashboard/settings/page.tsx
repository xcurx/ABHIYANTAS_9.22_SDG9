"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
    ArrowLeft, 
    User, 
    Bell, 
    Shield, 
    Eye, 
    Palette, 
    Link2, 
    Trash2, 
    Save, 
    Loader2,
    Mail,
    Smartphone,
    Globe,
    Lock,
    AlertTriangle,
    Check,
    Moon,
    Sun,
    Monitor
} from "lucide-react"

type SettingsSection = "account" | "notifications" | "privacy" | "appearance" | "connections" | "danger"

export default function SettingsPage() {
    const router = useRouter()
    const [activeSection, setActiveSection] = useState<SettingsSection>("account")
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // Mock settings state
    const [settings, setSettings] = useState({
        // Account
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        
        // Notifications
        emailNotifications: true,
        pushNotifications: true,
        hackathonReminders: true,
        teamInvites: true,
        marketingEmails: false,
        weeklyDigest: true,
        
        // Privacy
        profileVisibility: "public",
        showEmail: false,
        showPhone: false,
        showActivity: true,
        allowTeamInvites: true,
        
        // Appearance
        theme: "system",
        compactMode: false,
        
        // Connections
        connectedAccounts: [
            { provider: "github", connected: true, username: "johndoe" },
            { provider: "google", connected: true, email: "john.doe@gmail.com" },
            { provider: "linkedin", connected: false, username: null },
        ],
    })

    const handleSave = async () => {
        setIsLoading(true)
        setMessage(null)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setMessage({ type: "success", text: "Settings saved successfully!" })
        setIsLoading(false)
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
    }

    const handleDeleteAccount = () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            alert("Account deletion would be processed here.")
        }
    }

    const sections = [
        { id: "account" as const, label: "Account", icon: User },
        { id: "notifications" as const, label: "Notifications", icon: Bell },
        { id: "privacy" as const, label: "Privacy", icon: Shield },
        { id: "appearance" as const, label: "Appearance", icon: Palette },
        { id: "connections" as const, label: "Connections", icon: Link2 },
        { id: "danger" as const, label: "Danger Zone", icon: AlertTriangle },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/dashboard/profile"
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Manage your account settings and preferences</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div className={`rounded-lg p-4 flex items-center gap-3 ${
                        message.type === "success" 
                            ? "bg-green-50 text-green-800 border border-green-200" 
                            : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                        {message.type === "success" ? (
                            <Check className="h-5 w-5 text-green-600" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                </div>
            )}

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-64 flex-shrink-0">
                        <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                        activeSection === section.id
                                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                                            : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                                    } ${section.id === "danger" ? "text-red-600" : ""}`}
                                >
                                    <section.icon className={`h-5 w-5 ${
                                        activeSection === section.id ? "text-blue-600" : 
                                        section.id === "danger" ? "text-red-500" : "text-gray-400"
                                    }`} />
                                    <span className="font-medium">{section.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            {/* Account Section */}
                            {activeSection === "account" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
                                        <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.name}
                                                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={settings.email}
                                                disabled
                                                className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={settings.phone}
                                                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Change Section */}
                                    <div className="border-t border-gray-200 pt-6">
                                        <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    Current Password
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    <input
                                                        type="password"
                                                        className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                        New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>
                                            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                                Update Password
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Section */}
                            {activeSection === "notifications" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                                        <p className="text-sm text-gray-500 mt-1">Choose how you want to be notified</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Mail className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Email Notifications</p>
                                                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.emailNotifications}
                                                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Smartphone className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Push Notifications</p>
                                                    <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.pushNotifications}
                                                    onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <h3 className="font-medium text-gray-900 mb-3">Notify me about</h3>
                                            <div className="space-y-3">
                                                {[
                                                    { key: "hackathonReminders", label: "Hackathon reminders and deadlines" },
                                                    { key: "teamInvites", label: "Team invitations and requests" },
                                                    { key: "weeklyDigest", label: "Weekly digest of activities" },
                                                    { key: "marketingEmails", label: "Marketing and promotional emails" },
                                                ].map((item) => (
                                                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={settings[item.key as keyof typeof settings] as boolean}
                                                            onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-gray-700">{item.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Privacy Section */}
                            {activeSection === "privacy" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
                                        <p className="text-sm text-gray-500 mt-1">Control who can see your information</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Profile Visibility
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { value: "public", label: "Public", icon: Globe, desc: "Anyone can view" },
                                                    { value: "connections", label: "Connections", icon: Link2, desc: "Only connections" },
                                                    { value: "private", label: "Private", icon: Lock, desc: "Only you" },
                                                ].map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => setSettings({ ...settings, profileVisibility: option.value })}
                                                        className={`p-4 rounded-lg border-2 text-center transition-colors ${
                                                            settings.profileVisibility === option.value
                                                                ? "border-blue-600 bg-blue-50"
                                                                : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                    >
                                                        <option.icon className={`h-6 w-6 mx-auto mb-2 ${
                                                            settings.profileVisibility === option.value ? "text-blue-600" : "text-gray-400"
                                                        }`} />
                                                        <p className={`font-medium ${
                                                            settings.profileVisibility === option.value ? "text-blue-700" : "text-gray-700"
                                                        }`}>{option.label}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <h3 className="font-medium text-gray-900 mb-3">Show on profile</h3>
                                            <div className="space-y-3">
                                                {[
                                                    { key: "showEmail", label: "Email address" },
                                                    { key: "showPhone", label: "Phone number" },
                                                    { key: "showActivity", label: "Recent activity" },
                                                ].map((item) => (
                                                    <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                                                        <span className="text-gray-700">{item.label}</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={settings[item.key as keyof typeof settings] as boolean}
                                                                onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                                                <div>
                                                    <p className="font-medium text-gray-900">Allow team invitations</p>
                                                    <p className="text-sm text-gray-500">Others can invite you to join their teams</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.allowTeamInvites}
                                                        onChange={(e) => setSettings({ ...settings, allowTeamInvites: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Appearance Section */}
                            {activeSection === "appearance" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
                                        <p className="text-sm text-gray-500 mt-1">Customize how the app looks</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Theme
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { value: "light", label: "Light", icon: Sun },
                                                    { value: "dark", label: "Dark", icon: Moon },
                                                    { value: "system", label: "System", icon: Monitor },
                                                ].map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => setSettings({ ...settings, theme: option.value })}
                                                        className={`p-4 rounded-lg border-2 text-center transition-colors ${
                                                            settings.theme === option.value
                                                                ? "border-blue-600 bg-blue-50"
                                                                : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                    >
                                                        <option.icon className={`h-6 w-6 mx-auto mb-2 ${
                                                            settings.theme === option.value ? "text-blue-600" : "text-gray-400"
                                                        }`} />
                                                        <p className={`font-medium ${
                                                            settings.theme === option.value ? "text-blue-700" : "text-gray-700"
                                                        }`}>{option.label}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                                                <div>
                                                    <p className="font-medium text-gray-900">Compact Mode</p>
                                                    <p className="text-sm text-gray-500">Reduce spacing for denser content</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.compactMode}
                                                        onChange={(e) => setSettings({ ...settings, compactMode: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Connections Section */}
                            {activeSection === "connections" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Connected Accounts</h2>
                                        <p className="text-sm text-gray-500 mt-1">Manage your connected services</p>
                                    </div>

                                    <div className="space-y-3">
                                        {settings.connectedAccounts.map((account) => (
                                            <div key={account.provider} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2.5 rounded-lg ${
                                                        account.provider === "github" ? "bg-gray-800" :
                                                        account.provider === "google" ? "bg-white border border-gray-200" :
                                                        "bg-blue-700"
                                                    }`}>
                                                        {account.provider === "github" && (
                                                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                                        )}
                                                        {account.provider === "google" && (
                                                            <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                                        )}
                                                        {account.provider === "linkedin" && (
                                                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 capitalize">{account.provider}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {account.connected 
                                                                ? (account.username || account.email)
                                                                : "Not connected"
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        account.connected
                                                            ? "text-red-600 hover:bg-red-50"
                                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                                    }`}
                                                >
                                                    {account.connected ? "Disconnect" : "Connect"}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Danger Zone Section */}
                            {activeSection === "danger" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
                                        <p className="text-sm text-gray-500 mt-1">Irreversible and destructive actions</p>
                                    </div>

                                    <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-red-100 rounded-lg">
                                                <Trash2 className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-red-800">Delete Account</h3>
                                                <p className="text-sm text-red-700 mt-1">
                                                    Permanently delete your account and all of your data. This action cannot be undone.
                                                </p>
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete My Account
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-yellow-100 rounded-lg">
                                                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-yellow-800">Export Data</h3>
                                                <p className="text-sm text-yellow-700 mt-1">
                                                    Download all your data in a machine-readable format.
                                                </p>
                                                <button
                                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-yellow-600 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors font-medium text-sm"
                                                >
                                                    Request Data Export
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save Button (except for danger zone) */}
                            {activeSection !== "danger" && (
                                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
