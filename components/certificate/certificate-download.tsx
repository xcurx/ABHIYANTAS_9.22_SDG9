"use client"

import { useRef, useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { CertificateTemplate } from "./certificate-template"

interface CertificateDownloadProps {
    participantName: string
    eventName: string
    eventType: "hackathon" | "coding-contest"
    rank?: number
    totalParticipants?: number
    score?: number
    maxScore?: number
    date: string
    organizationName?: string
}

export function CertificateDownload({
    participantName,
    eventName,
    eventType,
    rank,
    totalParticipants,
    score,
    maxScore,
    date,
    organizationName,
}: CertificateDownloadProps) {
    const certificateRef = useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    // Generate a unique certificate ID
    const certificateId = `ELEV-${eventType === "coding-contest" ? "CC" : "HK"}-${Date.now().toString(36).toUpperCase()}`

    const handleDownload = async () => {
        setIsGenerating(true)

        try {
            // Create a temporary container for rendering
            const tempContainer = document.createElement("div")
            tempContainer.style.position = "fixed"
            tempContainer.style.left = "-9999px"
            tempContainer.style.top = "0"
            tempContainer.style.zIndex = "-9999"
            document.body.appendChild(tempContainer)

            const isWinner = rank && rank <= 3
            const achievementText = isWinner 
                ? (rank === 1 ? "FIRST PLACE" : rank === 2 ? "SECOND PLACE" : "THIRD PLACE")
                : "PARTICIPATION"
            const medalEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"

            // Create the certificate element with clean layout
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
                            
                            <p style="color: #64748b; font-size: 18px; margin: 0 0 20px 0; font-weight: 400;">This is to certify that</p>
                            
                            <!-- Name -->
                            <h1 style="font-size: 52px; font-weight: 700; color: #0f172a; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: 1px;">${participantName}</h1>
                            
                            <p style="color: #64748b; font-size: 18px; margin: 0 0 24px 0;">has successfully ${isWinner ? "secured" : "participated in"}</p>
                            
                            <!-- Achievement (if winner) - Normal text style -->
                            ${isWinner ? `
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                                    <span style="font-size: 36px;">${medalEmoji}</span>
                                    <span style="font-size: 32px; font-weight: 700; color: ${rank === 1 ? "#b45309" : rank === 2 ? "#475569" : "#c2410c"}; font-family: Georgia, serif;">${rank === 1 ? "First Place" : rank === 2 ? "Second Place" : "Third Place"}</span>
                                </div>
                            ` : ""}
                            
                            <p style="color: #64748b; font-size: 16px; margin: 0 0 8px 0;">in</p>
                            
                            <!-- Event Name -->
                            <h2 style="font-size: 28px; font-weight: 700; color: #2563eb; margin: 0 0 12px 0;">${eventName}</h2>
                            
                            ${organizationName ? `<p style="color: #64748b; font-size: 16px; margin: 0 0 24px 0;">Organized by <span style="font-weight: 600; color: #334155;">${organizationName}</span></p>` : ""}
                            
                            <!-- Stats -->
                            <div style="display: flex; align-items: center; justify-content: center; gap: 48px; margin-top: 16px;">
                                ${rank && totalParticipants ? `
                                    <div style="text-align: center;">
                                        <div style="font-size: 28px; font-weight: 700; color: #0f172a;">#${rank}</div>
                                        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">of ${totalParticipants} participants</div>
                                    </div>
                                ` : ""}
                                ${score !== undefined && maxScore ? `
                                    <div style="text-align: center;">
                                        <div style="font-size: 28px; font-weight: 700; color: #0f172a;">${score}/${maxScore}</div>
                                        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Score</div>
                                    </div>
                                ` : ""}
                            </div>
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

            // Wait for rendering
            await new Promise(resolve => setTimeout(resolve, 100))

            // Capture with html2canvas
            const html2canvas = (await import("html2canvas")).default
            const targetElement = tempContainer.querySelector("#cert-download") as HTMLElement
            
            const canvas = await html2canvas(targetElement, {
                scale: 2,
                backgroundColor: "#ffffff",
                logging: false,
                useCORS: true,
            })

            // Download
            const link = document.createElement("a")
            link.download = `${eventName.replace(/[^a-z0-9]/gi, "_")}_Certificate.png`
            link.href = canvas.toDataURL("image/png", 1.0)
            link.click()

            // Cleanup
            document.body.removeChild(tempContainer)
        } catch (error) {
            console.error("Error generating certificate:", error)
            alert("Failed to generate certificate. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <>
            {/* Download Button */}
            <button
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:-translate-y-0.5"
            >
                <Download className="w-5 h-5" />
                Download Certificate
            </button>

            {/* Modal with Certificate Preview */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-bold text-gray-900">Certificate Preview</h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDownload}
                                    disabled={isGenerating}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" />
                                            Download PNG
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Certificate Preview */}
                        <div className="p-6 bg-gray-100 flex items-center justify-center overflow-auto">
                            <div style={{ transform: "scale(0.6)", transformOrigin: "top center" }} className="shadow-2xl rounded-lg overflow-hidden">
                                <CertificateTemplate
                                    ref={certificateRef}
                                    participantName={participantName}
                                    eventName={eventName}
                                    eventType={eventType}
                                    rank={rank}
                                    totalParticipants={totalParticipants}
                                    score={score}
                                    maxScore={maxScore}
                                    date={date}
                                    organizationName={organizationName}
                                    certificateId={certificateId}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
