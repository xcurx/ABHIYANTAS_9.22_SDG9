"use client"

import { useState, useRef } from "react"
import { Award, Download, X } from "lucide-react"

interface HackathonCertificateSectionProps {
    participantName: string
    teamName?: string | null
    eventName: string
    rank?: number | null
    prize?: string | null
    track?: string | null
    date: string
    organizationName?: string | null
}

export function HackathonCertificateSection({
    participantName,
    teamName,
    eventName,
    rank,
    prize,
    track,
    date,
    organizationName,
}: HackathonCertificateSectionProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const certificateRef = useRef<HTMLDivElement>(null)

    const downloadCertificate = async () => {
        if (!certificateRef.current) return

        setIsGenerating(true)
        try {
            const html2canvas = (await import("html2canvas")).default
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: null,
            })
            const link = document.createElement("a")
            link.download = `${eventName.replace(/\s+/g, "-")}-Certificate.png`
            link.href = canvas.toDataURL("image/png")
            link.click()
        } catch (error) {
            console.error("Failed to generate certificate:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    const getRankSuffix = (n: number) => {
        const s = ["th", "st", "nd", "rd"]
        const v = n % 100
        return n + (s[(v - 20) % 10] || s[v] || s[0])
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-medium text-sm"
            >
                <Award className="h-4 w-4" />
                Download Certificate
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Certificate Preview</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Certificate Preview */}
                        <div className="p-6 bg-gray-100 flex justify-center">
                            <div
                                ref={certificateRef}
                                style={{
                                    width: "800px",
                                    height: "566px",
                                    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
                                    position: "relative",
                                    overflow: "hidden",
                                    fontFamily: "system-ui, -apple-system, sans-serif",
                                }}
                            >
                                {/* Decorative circles */}
                                <div
                                    style={{
                                        position: "absolute",
                                        width: "300px",
                                        height: "300px",
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.1)",
                                        top: "-100px",
                                        right: "-100px",
                                    }}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        width: "200px",
                                        height: "200px",
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.08)",
                                        bottom: "-50px",
                                        left: "-50px",
                                    }}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        width: "150px",
                                        height: "150px",
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.05)",
                                        top: "50%",
                                        left: "10%",
                                    }}
                                />

                                {/* White content area */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "40px",
                                        left: "40px",
                                        right: "40px",
                                        bottom: "40px",
                                        background: "white",
                                        borderRadius: "16px",
                                        padding: "40px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                                    }}
                                >
                                    {/* ELEVATE Logo */}
                                    <div
                                        style={{
                                            fontSize: "28px",
                                            fontWeight: "700",
                                            color: "#2563eb",
                                            letterSpacing: "0.1em",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        ELEVATE
                                    </div>
                                    
                                    {/* Certificate Title */}
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            color: "#6b7280",
                                            letterSpacing: "0.3em",
                                            textTransform: "uppercase",
                                            marginBottom: "24px",
                                        }}
                                    >
                                        Certificate of {rank && rank <= 3 ? "Achievement" : "Participation"}
                                    </div>

                                    {/* Award Badge for Winners */}
                                    {rank && rank <= 3 && (
                                        <div
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                borderRadius: "50%",
                                                background: rank === 1 ? "linear-gradient(135deg, #fbbf24, #f59e0b)" :
                                                           rank === 2 ? "linear-gradient(135deg, #9ca3af, #6b7280)" :
                                                           "linear-gradient(135deg, #f97316, #ea580c)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginBottom: "16px",
                                                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                                            }}
                                        >
                                            <span style={{ fontSize: "24px" }}>🏆</span>
                                        </div>
                                    )}

                                    {/* Presented To */}
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#9ca3af",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.2em",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        This is to certify that
                                    </div>

                                    {/* Participant Name */}
                                    <div
                                        style={{
                                            fontSize: "32px",
                                            fontWeight: "700",
                                            color: "#1e3a5f",
                                            marginBottom: teamName ? "4px" : "16px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {participantName}
                                    </div>

                                    {/* Team Name */}
                                    {teamName && (
                                        <div
                                            style={{
                                                fontSize: "16px",
                                                color: "#6b7280",
                                                marginBottom: "16px",
                                            }}
                                        >
                                            Team: {teamName}
                                        </div>
                                    )}

                                    {/* Achievement Description */}
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            color: "#4b5563",
                                            textAlign: "center",
                                            maxWidth: "500px",
                                            lineHeight: "1.6",
                                        }}
                                    >
                                        {rank && rank <= 3 ? (
                                            <>
                                                has achieved <span style={{ fontWeight: "600", color: "#2563eb" }}>{getRankSuffix(rank)} Place</span>
                                                {prize && <> and won <span style={{ fontWeight: "600", color: "#059669" }}>{prize}</span></>}
                                                {track && <> in the <span style={{ fontWeight: "600" }}>{track}</span> track</>}
                                            </>
                                        ) : (
                                            <>has successfully participated{track && <> in the <span style={{ fontWeight: "600" }}>{track}</span> track</>}</>
                                        )}{" "}
                                        at
                                    </div>

                                    {/* Event Name */}
                                    <div
                                        style={{
                                            fontSize: "20px",
                                            fontWeight: "700",
                                            color: "#2563eb",
                                            marginTop: "8px",
                                            marginBottom: "24px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {eventName}
                                    </div>

                                    {/* Date and Organization */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "24px",
                                            paddingTop: "16px",
                                            borderTop: "1px solid #e5e7eb",
                                            width: "100%",
                                        }}
                                    >
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                                Date
                                            </div>
                                            <div style={{ fontSize: "14px", color: "#374151", fontWeight: "500" }}>
                                                {date}
                                            </div>
                                        </div>
                                        {organizationName && (
                                            <div style={{ textAlign: "center" }}>
                                                <div style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                                    Organized By
                                                </div>
                                                <div style={{ fontSize: "14px", color: "#374151", fontWeight: "500" }}>
                                                    {organizationName}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom branding */}
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: "12px",
                                        left: "0",
                                        right: "0",
                                        textAlign: "center",
                                        fontSize: "10px",
                                        color: "rgba(255,255,255,0.6)",
                                        letterSpacing: "0.15em",
                                    }}
                                >
                                    POWERED BY ELEVATE
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={downloadCertificate}
                                disabled={isGenerating}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
