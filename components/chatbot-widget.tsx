"use client"

import { useState } from "react"
import Script from "next/script"

export function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Chat toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center transition-all duration-300 hover:bg-blue-700 hover:scale-110 hover:shadow-2xl ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                aria-label="Open chat"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>

            {/* Chat window */}
            <div 
                className={`fixed bottom-6 right-6 z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
            >
                {/* Close button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-800 text-white shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
                    aria-label="Close chat"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Chat iframe container */}
                <div className="w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                    <iframe
                        id="JotFormIFrame-019c101f8013722d8f3642e3cbb74af9235a"
                        title="ELEVATE: Website Support Specialist"
                        allow="geolocation; microphone; camera; fullscreen"
                        src="https://agent.jotform.com/019c101f8013722d8f3642e3cbb74af9235a?embedMode=iframe&background=1&shadow=1"
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                        }}
                    />
                </div>
            </div>

            <Script
                src="https://cdn.jotfor.ms/s/umd/d1be1c0f01f/for-form-embed-handler.js"
                strategy="lazyOnload"
                onLoad={() => {
                    if (typeof window !== "undefined" && (window as any).jotformEmbedHandler) {
                        (window as any).jotformEmbedHandler(
                            "iframe[id='JotFormIFrame-019c101f8013722d8f3642e3cbb74af9235a']",
                            "https://www.jotform.com"
                        )
                    }
                }}
            />
        </>
    )
}
