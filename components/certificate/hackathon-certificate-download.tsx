"use client"

import { useState } from "react"
import { Download, Loader2, Award } from "lucide-react"

interface HackathonCertificateDownloadProps {
    participantName: string
    teamName?: string
    eventName: string
    rank?: number
    prize?: string
    track?: string
    date: string
    organizationName?: string
}

export function HackathonCertificateDownload({
    participantName,
    teamName,
    eventName,
    rank,
    prize,
    track,
    date,
    organizationName,
}: HackathonCertificateDownloadProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const certificateId = `ELEV-HK-${Date.now().toString(36).toUpperCase()}`
    
    const isWinner = rank && rank <= 3
    const achievementText = isWinner 
        ? (rank === 1 ? "FIRST PLACE" : rank === 2 ? "SECOND PLACE" : "THIRD PLACE")
        : "PARTICIPATION"
    const medalEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"

    const handleDownload = async () => {
        setIsGenerating(true)

        try {
            const html2canvas = (await import("html2canvas")).default
            
            const tempContainer = document.createElement("div")
            tempContainer.style.position = "fixed"
            tempContainer.style.left = "-9999px"
            tempContainer.style.top = "0"
            tempContainer.style.zIndex = "-9999"
            document.body.appendChild(tempContainer)

            const certElement = document.createElement("div")
            certElement.innerHTML = `
                <div id="cert-download" style="width: 1000px; height: 700px; background: linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eef2ff 100%); position: relative; overflow: hidden; font-family: 'Segoe UI', Arial, sans-serif;">
                    <!-- SVG Background with Logo -->
                    <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;" viewBox="0 0 1000 700">
                        <!-- Decorative circles -->
                        <circle cx="-50" cy="-50" r="250" fill="#3b82f6" opacity="0.06"/>
                        <circle cx="1050" cy="750" r="300" fill="#6366f1" opacity="0.06"/>
                        <circle cx="900" cy="100" r="150" fill="#06b6d4" opacity="0.04"/>
                        
                        <!-- Watermark Logo in center -->
                        <g transform="translate(500, 350)" opacity="0.03">
                            <rect x="-60" y="-60" width="120" height="120" rx="24" fill="#2563eb"/>
                            <text x="0" y="20" text-anchor="middle" font-size="72" font-weight="bold" fill="#ffffff">E</text>
                        </g>
                        
                        <!-- Border frames -->
                        <rect x="20" y="20" width="960" height="660" rx="12" fill="none" stroke="#bfdbfe" stroke-width="3"/>
                        <rect x="30" y="30" width="940" height="640" rx="8" fill="none" stroke="#dbeafe" stroke-width="1"/>
                        
                        <!-- Corner decorations -->
                        <path d="M20,80 L20,20 L80,20" fill="none" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>
                        <path d="M920,20 L980,20 L980,80" fill="none" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>
                        <path d="M980,620 L980,680 L920,680" fill="none" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>
                        <path d="M80,680 L20,680 L20,620" fill="none" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>
                    </svg>
                    
                    <!-- Content -->
                    <div style="position: relative; height: 100%; display: flex; flex-direction: column; align-items: center; padding: 50px 80px; box-sizing: border-box;">
                        
                        <!-- Header with Logo -->
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div style="display: inline-flex; align-items: center; gap: 14px; margin-bottom: 12px;">
                                <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                                    <span style="color: #ffffff; font-weight: bold; font-size: 24px;">E</span>
                                </div>
                                <span style="font-size: 32px; font-weight: 700; color: #1e3a5f; letter-spacing: 2px;">ELEVATE</span>
                            </div>
                            <div style="font-size: 14px; color: #64748b; letter-spacing: 4px; text-transform: uppercase; font-weight: 500;">Certificate of ${achievementText}</div>
                        </div>
                        
                        <!-- Main Content -->
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; width: 100%;">
                            
                            <p style="color: #64748b; font-size: 18px; margin: 0 0 16px 0; font-weight: 400;">This is to certify that</p>
                            
                            <!-- Name -->
                            <h1 style="font-size: 48px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: 1px;">${participantName}</h1>
                            
                            ${teamName ? `<p style="color: #475569; font-size: 18px; margin: 0 0 16px 0; font-weight: 500;">Team: ${teamName}</p>` : '<div style="margin-bottom: 16px;"></div>'}
                            
                            <p style="color: #64748b; font-size: 18px; margin: 0 0 20px 0;">has successfully ${isWinner ? "secured" : "participated in"}</p>
                            
                            <!-- Achievement (if winner) -->
                            ${isWinner ? `
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                                    <span style="font-size: 36px;">${medalEmoji}</span>
                                    <span style="font-size: 32px; font-weight: 700; color: ${rank === 1 ? "#b45309" : rank === 2 ? "#475569" : "#c2410c"}; font-family: Georgia, serif;">${rank === 1 ? "First Place" : rank === 2 ? "Second Place" : "Third Place"}</span>
                                </div>
                            ` : ""}
                            
                            ${prize ? `<p style="color: #059669; font-size: 16px; margin: 0 0 16px 0; font-weight: 600;">🏆 ${prize}</p>` : ""}
                            
                            <p style="color: #64748b; font-size: 16px; margin: 0 0 8px 0;">in</p>
                            
                            <!-- Event Name -->
                            <h2 style="font-size: 28px; font-weight: 700; color: #2563eb; margin: 0 0 8px 0;">${eventName}</h2>
                            
                            ${track ? `<p style="color: #7c3aed; font-size: 16px; margin: 0 0 12px 0; font-weight: 500;">Track: ${track}</p>` : ""}
                            
                            ${organizationName ? `<p style="color: #64748b; font-size: 16px; margin: 0 0 16px 0;">Organized by <span style="font-weight: 600; color: #334155;">${organizationName}</span></p>` : ""}
                        </div>
                        
                        <!-- Footer -->
                        <div style="width: 100%; display: flex; align-items: flex-end; justify-content: space-between; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                            <div style="text-align: left;">
                                <p style="font-size: 12px; color: #94a3b8; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Issue Date</p>
                                <p style="font-weight: 600; color: #334155; margin: 0; font-size: 15px;">${date}</p>
                            </div>
                            
                            <div style="text-align: center;">
                                <div style="width: 160px; border-bottom: 2px solid #cbd5e1; margin-bottom: 8px;"></div>
                                <p style="font-size: 12px; color: #94a3b8; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Authorized Signature</p>
                            </div>
                            
                            <div style="text-align: right;">
                                <p style="font-size: 12px; color: #94a3b8; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Certificate ID</p>
                                <p style="font-family: 'Courier New', monospace; font-size: 13px; color: #475569; margin: 0; font-weight: 600;">${certificateId}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `
            tempContainer.appendChild(certElement)

            const element = tempContainer.querySelector("#cert-download") as HTMLElement
            
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
            })

            document.body.removeChild(tempContainer)

            const link = document.createElement("a")
            link.download = `${eventName.replace(/[^a-z0-9]/gi, "_")}_Certificate.png`
            link.href = canvas.toDataURL("image/png")
            link.click()
        } catch (error) {
            console.error("Error generating certificate:", error)
            alert("Failed to generate certificate. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowPreview(true)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 transition-colors font-medium text-sm"
            >
                <Award className="h-4 w-4" />
                Download Certificate
            </button>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-violet-50 to-purple-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Award className="h-5 w-5 text-violet-600" />
                                Hackathon Certificate Preview
                            </h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 bg-gray-100 overflow-auto max-h-[70vh]">
                            {/* Simple Preview */}
                            <div className="mx-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-xl border-2 border-blue-200 p-8 text-center max-w-2xl">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">E</span>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-800">ELEVATE</span>
                                </div>
                                <p className="text-sm text-gray-500 uppercase tracking-widest mb-6">Certificate of {achievementText}</p>
                                
                                <p className="text-gray-600 mb-2">This is to certify that</p>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>{participantName}</h2>
                                {teamName && <p className="text-gray-600 mb-4">Team: <span className="font-semibold">{teamName}</span></p>}
                                
                                {isWinner && (
                                    <div className="flex items-center justify-center gap-2 my-4">
                                        <span className="text-3xl">{medalEmoji}</span>
                                        <span className="text-2xl font-bold" style={{ color: rank === 1 ? "#b45309" : rank === 2 ? "#475569" : "#c2410c" }}>
                                            {rank === 1 ? "First Place" : rank === 2 ? "Second Place" : "Third Place"}
                                        </span>
                                    </div>
                                )}
                                
                                {prize && <p className="text-green-600 font-semibold mb-4">🏆 {prize}</p>}
                                
                                <p className="text-gray-600 mb-2">in</p>
                                <h3 className="text-xl font-bold text-blue-600 mb-2">{eventName}</h3>
                                {track && <p className="text-purple-600 font-medium mb-2">Track: {track}</p>}
                                {organizationName && <p className="text-gray-500">Organized by <span className="font-semibold text-gray-700">{organizationName}</span></p>}
                            </div>
                        </div>
                        
                        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={isGenerating}
                                className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Download PNG
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
