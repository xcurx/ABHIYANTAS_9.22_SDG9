"use client"

import { useEffect, useRef, useState, useCallback, ReactNode } from "react"
import { reportViolation, incrementTabSwitch, sendHeartbeat } from "@/lib/actions/coding-proctor"

interface ProctoringWrapperProps {
    children: ReactNode
    participantId: string
    contestId: string
    enableFullscreenLock?: boolean
    enableTabSwitchDetection?: boolean
    enableCopyPasteBlock?: boolean
    enableRightClickBlock?: boolean
    enableDevtoolsDetection?: boolean
    maxTabSwitches?: number
    onViolation?: (type: string, message: string) => void
    onMaxViolationsReached?: () => void
    warningThreshold?: number
}

type ViolationType = 
    | "TAB_SWITCH"
    | "WINDOW_BLUR"
    | "COPY_ATTEMPT"
    | "PASTE_ATTEMPT"
    | "RIGHT_CLICK"
    | "FULLSCREEN_EXIT"
    | "DEVTOOLS_OPEN"
    | "SCREEN_CAPTURE_ATTEMPT"
    | "MULTIPLE_DISPLAYS"
    | "SUSPICIOUS_BEHAVIOR"
    | "IDLE_TIMEOUT"

export default function ProctoringWrapper({
    children,
    participantId,
    contestId,
    enableFullscreenLock = true,
    enableTabSwitchDetection = true,
    enableCopyPasteBlock = true,
    enableRightClickBlock = true,
    enableDevtoolsDetection = true,
    maxTabSwitches = 3,
    onViolation,
    onMaxViolationsReached,
    warningThreshold = 2,
}: ProctoringWrapperProps) {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true)
    const [tabSwitchCount, setTabSwitchCount] = useState(0)
    const [warnings, setWarnings] = useState<{ type: string; message: string; time: Date }[]>([])
    const [isDevtoolsOpen, setIsDevtoolsOpen] = useState(false)
    const heartbeatInterval = useRef<NodeJS.Timeout | null>(null)
    const devtoolsCheckInterval = useRef<NodeJS.Timeout | null>(null)

    // Report violation to server
    const handleViolation = useCallback(async (type: ViolationType, details: string) => {
        const warning = { type, message: details, time: new Date() }
        setWarnings(prev => [...prev, warning])
        onViolation?.(type, details)

        // Report to server
        await reportViolation({
            participantId,
            type,
            details,
        })

        // Check if max violations reached
        if (warnings.length + 1 >= warningThreshold) {
            onMaxViolationsReached?.()
        }
    }, [participantId, onViolation, onMaxViolationsReached, warnings.length, warningThreshold])

    // Tab switch detection
    useEffect(() => {
        if (!enableTabSwitchDetection) return

        const handleVisibilityChange = async () => {
            if (document.hidden) {
                const newCount = tabSwitchCount + 1
                setTabSwitchCount(newCount)
                
                // Increment server-side count
                await incrementTabSwitch(participantId)
                
                handleViolation("TAB_SWITCH", `Tab switch detected (${newCount}/${maxTabSwitches})`)

                if (newCount >= maxTabSwitches) {
                    handleViolation("TAB_SWITCH", "Maximum tab switches exceeded - submission may be disqualified")
                }
            }
        }

        const handleBlur = () => {
            // Additional blur detection for when visibility API doesn't fire
            // This can happen with some window managers or virtual desktops
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        window.addEventListener("blur", handleBlur)

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            window.removeEventListener("blur", handleBlur)
        }
    }, [enableTabSwitchDetection, tabSwitchCount, maxTabSwitches, handleViolation, participantId])

    // Fullscreen management
    useEffect(() => {
        if (!enableFullscreenLock) {
            setShowFullscreenPrompt(false)
            return
        }

        const handleFullscreenChange = () => {
            const isNowFullscreen = !!document.fullscreenElement
            setIsFullscreen(isNowFullscreen)

            if (!isNowFullscreen && !showFullscreenPrompt) {
                handleViolation("FULLSCREEN_EXIT", "Exited fullscreen mode")
                setShowFullscreenPrompt(true)
            }
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
        }
    }, [enableFullscreenLock, showFullscreenPrompt, handleViolation])

    // Enter fullscreen
    const enterFullscreen = useCallback(async () => {
        try {
            await document.documentElement.requestFullscreen()
            setShowFullscreenPrompt(false)
            setIsFullscreen(true)
        } catch (err) {
            console.error("Failed to enter fullscreen:", err)
        }
    }, [])

    // Copy/paste blocking
    useEffect(() => {
        if (!enableCopyPasteBlock) return

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault()
            handleViolation("COPY_ATTEMPT", "Copy attempt blocked")
        }

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault()
            handleViolation("PASTE_ATTEMPT", "Paste attempt blocked")
        }

        const handleCut = (e: ClipboardEvent) => {
            e.preventDefault()
            handleViolation("COPY_ATTEMPT", "Cut attempt blocked")
        }

        document.addEventListener("copy", handleCopy)
        document.addEventListener("paste", handlePaste)
        document.addEventListener("cut", handleCut)

        return () => {
            document.removeEventListener("copy", handleCopy)
            document.removeEventListener("paste", handlePaste)
            document.removeEventListener("cut", handleCut)
        }
    }, [enableCopyPasteBlock, handleViolation])

    // Right-click blocking
    useEffect(() => {
        if (!enableRightClickBlock) return

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            handleViolation("RIGHT_CLICK", "Right-click context menu blocked")
        }

        document.addEventListener("contextmenu", handleContextMenu)

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu)
        }
    }, [enableRightClickBlock, handleViolation])

    // DevTools detection
    useEffect(() => {
        if (!enableDevtoolsDetection) return

        const detectDevTools = () => {
            const threshold = 160
            const widthThreshold = window.outerWidth - window.innerWidth > threshold
            const heightThreshold = window.outerHeight - window.innerHeight > threshold

            if (widthThreshold || heightThreshold) {
                if (!isDevtoolsOpen) {
                    setIsDevtoolsOpen(true)
                    handleViolation("DEVTOOLS_OPEN", "Developer tools detected - this is a critical violation")
                }
            } else {
                setIsDevtoolsOpen(false)
            }
        }

        // Check periodically
        devtoolsCheckInterval.current = setInterval(detectDevTools, 1000)

        // Also check on resize
        window.addEventListener("resize", detectDevTools)

        // Disable keyboard shortcuts for devtools
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12
            if (e.key === "F12") {
                e.preventDefault()
                handleViolation("DEVTOOLS_OPEN", "F12 key blocked")
            }
            // Ctrl+Shift+I (Chrome DevTools)
            if (e.ctrlKey && e.shiftKey && e.key === "I") {
                e.preventDefault()
                handleViolation("DEVTOOLS_OPEN", "Ctrl+Shift+I blocked")
            }
            // Ctrl+Shift+J (Chrome Console)
            if (e.ctrlKey && e.shiftKey && e.key === "J") {
                e.preventDefault()
                handleViolation("DEVTOOLS_OPEN", "Ctrl+Shift+J blocked")
            }
            // Ctrl+Shift+C (Chrome Inspect Element)
            if (e.ctrlKey && e.shiftKey && e.key === "C") {
                e.preventDefault()
                handleViolation("DEVTOOLS_OPEN", "Ctrl+Shift+C blocked")
            }
            // Ctrl+U (View Source)
            if (e.ctrlKey && e.key === "u") {
                e.preventDefault()
                handleViolation("SUSPICIOUS_BEHAVIOR", "View source blocked")
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            if (devtoolsCheckInterval.current) {
                clearInterval(devtoolsCheckInterval.current)
            }
            window.removeEventListener("resize", detectDevTools)
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [enableDevtoolsDetection, isDevtoolsOpen, handleViolation])

    // Heartbeat to server
    useEffect(() => {
        heartbeatInterval.current = setInterval(() => {
            sendHeartbeat(participantId)
        }, 30000) // Every 30 seconds

        return () => {
            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current)
            }
        }
    }, [participantId])

    // Screen capture detection (limited support)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = "Your contest progress will be lost. Are you sure you want to leave?"
        }

        window.addEventListener("beforeunload", handleBeforeUnload)

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
        }
    }, [])

    // Fullscreen prompt overlay
    if (showFullscreenPrompt && enableFullscreenLock) {
        return (
            <div className="fixed inset-0 z-[9999] bg-blue-600 flex items-center justify-center">
                <div className="max-w-lg w-full mx-4 p-8 bg-white rounded-2xl shadow-2xl text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter Fullscreen Mode</h2>
                    <p className="text-gray-500 mb-6">
                        This contest requires fullscreen mode to ensure fair competition. 
                        Exiting fullscreen will be logged as a violation.
                    </p>
                    <div className="space-y-3 text-left mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">⚠️</span>
                            <span>Tab switching will be monitored and limited</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">🚫</span>
                            <span>Copy/paste is disabled during the contest</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">🔒</span>
                            <span>Developer tools access is blocked</span>
                        </div>
                    </div>
                    <button
                        onClick={enterFullscreen}
                        className="w-full py-4 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-colors"
                    >
                        Enter Fullscreen & Start
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            {/* Warning notifications - bottom right */}
            <div className="fixed bottom-4 right-4 z-[9998] space-y-2">
                {warnings.slice(-3).map((warning, i) => (
                    <div
                        key={i}
                        className="animate-slide-in p-4 rounded-lg bg-red-900/90 border border-red-500/50 text-white shadow-lg max-w-sm"
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-red-400">⚠️</span>
                            <div>
                                <p className="font-medium text-sm">{warning.type.replace("_", " ")}</p>
                                <p className="text-xs text-red-200">{warning.message}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab switch counter - bottom left */}
            {enableTabSwitchDetection && tabSwitchCount > 0 && (
                <div className="fixed bottom-4 left-4 z-[9998] px-4 py-2 rounded-lg bg-yellow-900/90 border border-yellow-500/50 text-yellow-200 text-sm">
                    Tab Switches: {tabSwitchCount}/{maxTabSwitches}
                </div>
            )}

            {/* DevTools warning */}
            {isDevtoolsOpen && (
                <div className="fixed inset-0 z-[9997] bg-black/80 flex items-center justify-center">
                    <div className="max-w-md p-8 bg-red-900/90 border border-red-500 rounded-xl text-center">
                        <span className="text-6xl mb-4 block">🚨</span>
                        <h3 className="text-2xl font-bold text-white mb-3">Developer Tools Detected</h3>
                        <p className="text-red-200">
                            Please close developer tools immediately. This is a critical violation that may result in disqualification.
                        </p>
                    </div>
                </div>
            )}

            {/* Main content */}
            {children}

            <style jsx global>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}
