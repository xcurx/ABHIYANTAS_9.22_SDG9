"use client"

import { useState } from "react"
import { Download, Loader2, Award } from "lucide-react"

interface CodingCertificateDownloadProps {
    participantName: string
    eventName: string
    rank?: number
    totalParticipants?: number
    score?: number
    maxScore?: number
    date: string
    organizationName?: string
}

export function CodingCertificateDownload({
    participantName,
    eventName,
    rank,
    totalParticipants,
    score,
    maxScore,
    date,
    organizationName,
}: CodingCertificateDownloadProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const certificateId = `ELEV-CC-${Date.now().toString(36).toUpperCase()}`
    
    const isWinner = rank && rank <= 3
    const achievementText = isWinner 
        ? (rank === 1 ? "First Place" : rank === 2 ? "Second Place" : "Third Place")
        : "Completion"

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
                <div id="cert-download" style="width: 1000px; height: 700px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); position: relative; overflow: hidden; font-family: 'Segoe UI', Arial, sans-serif;">
                    <!-- SVG Background -->
                    <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;" viewBox="0 0 1000 700">
                        <!-- Decorative pattern circles -->
                        <defs>
                            <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="#3b82f6" opacity="0.1"/>
                            </pattern>
                        </defs>
                        
                        <!-- Large decorative circles with gradient lines -->
                        <circle cx="-100" cy="350" r="400" fill="none" stroke="#3b82f6" stroke-width="1" opacity="0.15"/>
                        <circle cx="-100" cy="350" r="350" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.1"/>
                        <circle cx="-100" cy="350" r="300" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.08"/>
                        
                        <circle cx="1100" cy="350" r="400" fill="none" stroke="#3b82f6" stroke-width="1" opacity="0.15"/>
                        <circle cx="1100" cy="350" r="350" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.1"/>
                        <circle cx="1100" cy="350" r="300" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.08"/>
                        
                        <!-- Subtle glow effects -->
                        <ellipse cx="0" cy="350" rx="200" ry="300" fill="#3b82f6" opacity="0.05"/>
                        <ellipse cx="1000" cy="350" rx="200" ry="300" fill="#3b82f6" opacity="0.05"/>
                        
                        <!-- Watermark Logo -->
                        <g transform="translate(500, 350)" opacity="0.03">
                            <rect x="-80" y="-80" width="160" height="160" rx="32" fill="#ffffff"/>
                            <text x="0" y="30" text-anchor="middle" font-size="100" font-weight="bold" fill="#0f172a">E</text>
                        </g>
                    </svg>
                    
                    <!-- Content -->
                    <div style="position: relative; height: 100%; display: flex; flex-direction: column; align-items: center; padding: 60px 80px; box-sizing: border-box;">
                        
                        <!-- Header -->
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="font-size: 42px; font-weight: 300; color: #ffffff; margin: 0 0 8px 0; letter-spacing: 8px; text-transform: uppercase; font-family: 'Segoe UI', Arial, sans-serif;">CERTIFICATE</h1>
                            <p style="font-size: 24px; color: #94a3b8; margin: 0; font-style: italic; font-family: Georgia, serif;">Of ${achievementText}</p>
                        </div>
                        
                        <!-- Divider -->
                        <div style="width: 400px; height: 2px; background: linear-gradient(90deg, transparent, #3b82f6, transparent); margin-bottom: 40px;"></div>
                        
                        <!-- Main Content -->
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; width: 100%;">
                            
                            <!-- Name with underline -->
                            <div style="margin-bottom: 30px;">
                                <h2 style="font-size: 48px; font-weight: 400; color: #ffffff; margin: 0; font-family: Georgia, 'Times New Roman', serif; letter-spacing: 2px; padding: 0 40px;">${participantName}</h2>
                                <div style="width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #475569, transparent); margin-top: 12px;"></div>
                            </div>
                            
                            <p style="color: #94a3b8; font-size: 16px; margin: 0 0 24px 0; line-height: 1.8;">
                                For having successfully completed a credit-based<br/>
                                online course "${eventName}"
                            </p>
                            
                            ${organizationName ? `<p style="color: #64748b; font-size: 14px; margin: 0 0 20px 0;">Organized by <span style="color: #94a3b8; font-weight: 500;">${organizationName}</span></p>` : ""}
                            
                            <!-- Stats Row -->
                            ${(rank || score !== undefined) ? `
                                <div style="display: flex; align-items: center; justify-content: center; gap: 60px; margin-top: 20px;">
                                    ${rank && totalParticipants ? `
                                        <div style="text-align: center;">
                                            <div style="font-size: 32px; font-weight: 600; color: #ffffff;">#${rank}</div>
                                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">of ${totalParticipants} participants</div>
                                        </div>
                                    ` : ""}
                                    ${score !== undefined && maxScore ? `
                                        <div style="text-align: center;">
                                            <div style="font-size: 32px; font-weight: 600; color: #ffffff;">${score}/${maxScore}</div>
                                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Score</div>
                                        </div>
                                    ` : ""}
                                </div>
                            ` : ""}
                        </div>
                        
                        <!-- Footer -->
                        <div style="width: 100%; display: flex; align-items: flex-end; justify-content: space-between; padding-top: 30px;">
                            <div style="text-align: center; flex: 1;">
                                <div style="width: 150px; border-bottom: 2px solid #475569; margin: 0 auto 8px auto;"></div>
                                <p style="font-size: 14px; color: #64748b; margin: 0;">Date</p>
                                <p style="font-size: 13px; color: #94a3b8; margin: 4px 0 0 0;">${date}</p>
                            </div>
                            
                            <div style="text-align: center; flex: 1;">
                                <!-- ELEVATE Logo -->
                                <div style="display: inline-flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                    <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); display: flex; align-items: center; justify-content: center;">
                                        <span style="color: #ffffff; font-weight: bold; font-size: 18px;">E</span>
                                    </div>
                                    <span style="font-size: 18px; font-weight: 600; color: #e2e8f0; letter-spacing: 1px;">ELEVATE</span>
                                </div>
                                <p style="font-size: 11px; color: #64748b; margin: 0;">Certificate ID: ${certificateId}</p>
                            </div>
                            
                            <div style="text-align: center; flex: 1;">
                                <div style="width: 150px; border-bottom: 2px solid #475569; margin: 0 auto 8px auto;"></div>
                                <p style="font-size: 14px; color: #64748b; margin: 0;">Signature</p>
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
                backgroundColor: "#0f172a",
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
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors font-medium text-sm"
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
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Award className="h-5 w-5 text-emerald-600" />
                                Coding Contest Certificate Preview
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
                        
                        <div className="p-6 bg-gray-900 overflow-auto max-h-[70vh]">
                            {/* Dark Preview */}
                            <div className="mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 p-8 text-center max-w-2xl relative overflow-hidden">
                                {/* Decorative circles */}
                                <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-40 h-40 border border-blue-500/20 rounded-full"></div>
                                <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-40 h-40 border border-blue-500/20 rounded-full"></div>
                                
                                <h1 className="text-3xl font-light text-white tracking-[0.3em] mb-2">CERTIFICATE</h1>
                                <p className="text-slate-400 italic mb-6" style={{ fontFamily: "Georgia, serif" }}>Of {achievementText}</p>
                                
                                <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-8"></div>
                                
                                <h2 className="text-3xl text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>{participantName}</h2>
                                
                                <p className="text-slate-400 mb-4">
                                    For successfully completing<br/>
                                    <span className="text-slate-300 font-medium">&quot;{eventName}&quot;</span>
                                </p>
                                
                                {organizationName && (
                                    <p className="text-slate-500 text-sm">Organized by <span className="text-slate-400">{organizationName}</span></p>
                                )}
                                
                                {(rank || score !== undefined) && (
                                    <div className="flex items-center justify-center gap-12 mt-6">
                                        {rank && totalParticipants && (
                                            <div className="text-center">
                                                <div className="text-2xl font-semibold text-white">#{rank}</div>
                                                <div className="text-xs text-slate-500">of {totalParticipants}</div>
                                            </div>
                                        )}
                                        {score !== undefined && maxScore && (
                                            <div className="text-center">
                                                <div className="text-2xl font-semibold text-white">{score}/{maxScore}</div>
                                                <div className="text-xs text-slate-500">Score</div>
                                            </div>
                                        )}
                                    </div>
                                )}
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
                                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
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
