"use client"

import { forwardRef } from "react"

interface CertificateTemplateProps {
    participantName: string
    eventName: string
    eventType: "hackathon" | "coding-contest"
    rank?: number
    totalParticipants?: number
    score?: number
    maxScore?: number
    date: string
    organizationName?: string
    certificateId: string
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
    ({ participantName, eventName, eventType, rank, totalParticipants, score, maxScore, date, organizationName, certificateId }, ref) => {
        const isWinner = rank && rank <= 3
        const achievementText = isWinner 
            ? rank === 1 ? "FIRST PLACE" : rank === 2 ? "SECOND PLACE" : "THIRD PLACE"
            : "PARTICIPATION"
        
        const rankDisplayText = rank === 1 ? "First Place" : rank === 2 ? "Second Place" : "Third Place"
        const rankColor = rank === 1 ? "#b45309" : rank === 2 ? "#475569" : "#c2410c"
        const medalEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"

        return (
            <div
                ref={ref}
                id="certificate-content"
                style={{
                    width: "1000px",
                    height: "700px",
                    background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eef2ff 100%)",
                    position: "relative",
                    overflow: "hidden",
                    fontFamily: "'Segoe UI', Arial, sans-serif",
                }}
            >
                {/* Background SVG with Logo Watermark */}
                <svg
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                    }}
                    viewBox="0 0 1000 700"
                >
                    {/* Decorative circles */}
                    <circle cx="-50" cy="-50" r="250" fill="#3b82f6" opacity="0.06" />
                    <circle cx="1050" cy="750" r="300" fill="#6366f1" opacity="0.06" />
                    <circle cx="900" cy="100" r="150" fill="#06b6d4" opacity="0.04" />
                    
                    {/* Watermark Logo in center */}
                    <g transform="translate(500, 350)" opacity="0.03">
                        <rect x="-60" y="-60" width="120" height="120" rx="24" fill="#2563eb" />
                        <text x="0" y="20" textAnchor="middle" fontSize="72" fontWeight="bold" fill="#ffffff">E</text>
                    </g>
                    
                    {/* Border frames */}
                    <rect x="20" y="20" width="960" height="660" rx="12" fill="none" stroke="#bfdbfe" strokeWidth="3" />
                    <rect x="30" y="30" width="940" height="640" rx="8" fill="none" stroke="#dbeafe" strokeWidth="1" />
                    
                    {/* Corner decorations */}
                    <path d="M20,80 L20,20 L80,20" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                    <path d="M920,20 L980,20 L980,80" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                    <path d="M980,620 L980,680 L920,680" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                    <path d="M80,680 L20,680 L20,620" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                </svg>

                {/* Content Container */}
                <div
                    style={{
                        position: "relative",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "50px 80px",
                        boxSizing: "border-box",
                    }}
                >
                    {/* Header with Logo */}
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                                }}
                            >
                                <span style={{ color: "#ffffff", fontWeight: "bold", fontSize: "24px" }}>E</span>
                            </div>
                            <span style={{ fontSize: "32px", fontWeight: 700, color: "#1e3a5f", letterSpacing: "2px" }}>ELEVATE</span>
                        </div>
                        <div style={{ fontSize: "14px", color: "#64748b", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 500 }}>
                            Certificate of {achievementText}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%" }}>
                        <p style={{ color: "#64748b", fontSize: "18px", margin: "0 0 20px 0", fontWeight: 400 }}>This is to certify that</p>
                        
                        <h1 style={{ fontSize: "52px", fontWeight: 700, color: "#0f172a", margin: "0 0 20px 0", fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "1px" }}>
                            {participantName}
                        </h1>

                        <p style={{ color: "#64748b", fontSize: "18px", margin: "0 0 24px 0" }}>
                            has successfully {isWinner ? "secured" : "participated in"}
                        </p>

                        {/* Achievement - Normal text style */}
                        {isWinner && (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                                <span style={{ fontSize: "36px" }}>{medalEmoji}</span>
                                <span style={{ fontSize: "32px", fontWeight: 700, color: rankColor, fontFamily: "Georgia, serif" }}>{rankDisplayText}</span>
                            </div>
                        )}

                        <p style={{ color: "#64748b", fontSize: "16px", margin: "0 0 8px 0" }}>in</p>

                        <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#2563eb", margin: "0 0 12px 0" }}>
                            {eventName}
                        </h2>

                        {organizationName && (
                            <p style={{ color: "#64748b", fontSize: "16px", margin: "0 0 24px 0" }}>
                                Organized by <span style={{ fontWeight: 600, color: "#334155" }}>{organizationName}</span>
                            </p>
                        )}

                        {/* Stats */}
                        {(rank || score !== undefined) && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "48px", marginTop: "16px" }}>
                                {rank && totalParticipants && (
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>#{rank}</div>
                                        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>of {totalParticipants} participants</div>
                                    </div>
                                )}
                                {score !== undefined && maxScore && (
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>{score}/{maxScore}</div>
                                        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Score</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
                        <div style={{ textAlign: "left" }}>
                            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "1px" }}>Issue Date</p>
                            <p style={{ fontWeight: 600, color: "#334155", margin: 0, fontSize: "15px" }}>{date}</p>
                        </div>
                        
                        <div style={{ textAlign: "center" }}>
                            <div style={{ width: "160px", borderBottom: "2px solid #cbd5e1", marginBottom: "8px" }}></div>
                            <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>Authorized Signature</p>
                        </div>

                        <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "1px" }}>Certificate ID</p>
                            <p style={{ fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#475569", margin: 0, fontWeight: 600 }}>{certificateId}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)

CertificateTemplate.displayName = "CertificateTemplate"
