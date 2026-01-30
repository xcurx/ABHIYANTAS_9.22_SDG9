"use client"

import { useEffect, useRef, useState, useCallback } from "react"

// Extend Window interface for Monaco
declare global {
    interface Window {
        monaco?: unknown
    }
}

interface CodeEditorProps {
    value: string
    onChange: (value: string) => void
    language: string
    theme?: "dark" | "light"
    readOnly?: boolean
    height?: string
    minHeight?: string
    maxHeight?: string
    showLineNumbers?: boolean
    showMinimap?: boolean
    fontSize?: number
    tabSize?: number
    wordWrap?: "on" | "off"
    placeholder?: string
    className?: string
    onRun?: () => void
    onSubmit?: () => void
    isLoading?: boolean
}

// Monaco Editor language mapping
const languageMap: Record<string, string> = {
    javascript: "javascript",
    python: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    go: "go",
    rust: "rust",
    typescript: "typescript",
    csharp: "csharp",
    ruby: "ruby",
    php: "php",
    swift: "swift",
    kotlin: "kotlin",
    scala: "scala",
}

export default function CodeEditor({
    value,
    onChange,
    language,
    theme = "light",
    readOnly = false,
    height = "400px",
    minHeight,
    maxHeight,
    showLineNumbers = true,
    showMinimap = false,
    fontSize = 14,
    tabSize = 4,
    wordWrap = "on",
    placeholder,
    className = "",
    onRun,
    onSubmit,
    isLoading = false,
}: CodeEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null)
    const monacoRef = useRef<any>(null)
    const editorInstanceRef = useRef<any>(null)
    const isInitializingRef = useRef(false)
    const [isEditorReady, setIsEditorReady] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    // Load Monaco Editor
    useEffect(() => {
        // Prevent multiple initializations
        if (isInitializingRef.current || editorInstanceRef.current) {
            return
        }
        
        const loadMonaco = async () => {
            isInitializingRef.current = true
            
            // Load Monaco from CDN
            if (typeof window !== "undefined" && !window.monaco) {
                const script = document.createElement("script")
                script.src = "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js"
                script.onload = () => {
                    (window as any).require.config({
                        paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs" }
                    });
                    (window as any).require(["vs/editor/editor.main"], (monaco: any) => {
                        (window as any).monaco = monaco
                        monacoRef.current = monaco
                        initEditor(monaco)
                    })
                }
                document.head.appendChild(script)
            } else if ((window as any).monaco) {
                monacoRef.current = (window as any).monaco
                initEditor((window as any).monaco)
            }
        }

        const initEditor = (monaco: any) => {
            if (!editorRef.current || editorInstanceRef.current) {
                isInitializingRef.current = false
                return
            }
            
            // Clear any existing content in the container
            editorRef.current.innerHTML = ""

            // Define custom dark theme
            monaco.editor.defineTheme("custom-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [
                    { token: "comment", foreground: "6A9955", fontStyle: "italic" },
                    { token: "keyword", foreground: "C586C0" },
                    { token: "string", foreground: "CE9178" },
                    { token: "number", foreground: "B5CEA8" },
                    { token: "type", foreground: "4EC9B0" },
                ],
                colors: {
                    "editor.background": "#0D1117",
                    "editor.foreground": "#E6EDF3",
                    "editorLineNumber.foreground": "#484F58",
                    "editorLineNumber.activeForeground": "#E6EDF3",
                    "editor.selectionBackground": "#264F78",
                    "editor.lineHighlightBackground": "#161B22",
                    "editorCursor.foreground": "#A855F7",
                    "editor.selectionHighlightBackground": "#264F7840",
                    "editorBracketMatch.background": "#264F7840",
                    "editorBracketMatch.border": "#A855F7",
                },
            })

            // Define custom light theme (Premium style with indigo accents)
            monaco.editor.defineTheme("custom-light", {
                base: "vs",
                inherit: true,
                rules: [
                    { token: "comment", foreground: "64748b", fontStyle: "italic" },
                    { token: "keyword", foreground: "7c3aed" },
                    { token: "string", foreground: "059669" },
                    { token: "number", foreground: "0891b2" },
                    { token: "type", foreground: "6366f1" },
                    { token: "function", foreground: "8b5cf6" },
                    { token: "variable", foreground: "1e293b" },
                    { token: "operator", foreground: "64748b" },
                    { token: "delimiter", foreground: "64748b" },
                ],
                colors: {
                    "editor.background": "#fafbfc",
                    "editor.foreground": "#1e293b",
                    "editorLineNumber.foreground": "#94a3b8",
                    "editorLineNumber.activeForeground": "#6366f1",
                    "editor.selectionBackground": "#e0e7ff",
                    "editor.lineHighlightBackground": "#f1f5f9",
                    "editorCursor.foreground": "#6366f1",
                    "editor.selectionHighlightBackground": "#e0e7ff80",
                    "editorBracketMatch.background": "#e0e7ff",
                    "editorBracketMatch.border": "#6366f1",
                    "editorGutter.background": "#f8fafc",
                    "scrollbarSlider.background": "#cbd5e180",
                    "scrollbarSlider.hoverBackground": "#94a3b880",
                    "scrollbarSlider.activeBackground": "#64748b80",
                    "editorIndentGuide.background": "#e2e8f0",
                    "editorIndentGuide.activeBackground": "#c7d2fe",
                },
            })

            const selectedTheme = theme === "light" ? "custom-light" : "custom-dark"

            const editor = monaco.editor.create(editorRef.current, {
                value: value,
                language: languageMap[language] || language,
                theme: selectedTheme,
                readOnly,
                lineNumbers: showLineNumbers ? "on" : "off",
                minimap: { enabled: showMinimap },
                fontSize,
                tabSize,
                wordWrap,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderLineHighlight: "line",
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                padding: { top: 16, bottom: 16 },
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Consolas, monospace",
                fontLigatures: true,
                bracketPairColorization: { enabled: true },
                guides: {
                    bracketPairs: true,
                    indentation: true,
                },
                suggest: {
                    showKeywords: true,
                    showSnippets: true,
                },
                quickSuggestions: true,
                parameterHints: { enabled: true },
                formatOnPaste: true,
                formatOnType: true,
                renderWhitespace: "selection",
                scrollbar: {
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                    useShadows: false,
                },
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
            })

            editorInstanceRef.current = editor

            // Handle content changes
            editor.onDidChangeModelContent(() => {
                onChange(editor.getValue())
            })

            // Handle focus/blur
            editor.onDidFocusEditorText(() => setIsFocused(true))
            editor.onDidBlurEditorText(() => setIsFocused(false))

            // Add keyboard shortcuts
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                onRun?.()
            })

            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                onSubmit?.()
            })

            setIsEditorReady(true)
            isInitializingRef.current = false
        }

        loadMonaco()

        return () => {
            if (editorInstanceRef.current) {
                editorInstanceRef.current.dispose()
                editorInstanceRef.current = null
            }
            isInitializingRef.current = false
        }
    }, [])

    // Update editor value when prop changes
    useEffect(() => {
        if (editorInstanceRef.current) {
            const currentValue = editorInstanceRef.current.getValue()
            if (currentValue !== value) {
                editorInstanceRef.current.setValue(value)
            }
        }
    }, [value])

    // Update language when prop changes
    useEffect(() => {
        if (editorInstanceRef.current && monacoRef.current) {
            const model = editorInstanceRef.current.getModel()
            if (model) {
                monacoRef.current.editor.setModelLanguage(model, languageMap[language] || language)
            }
        }
    }, [language])

    // Update theme when prop changes
    useEffect(() => {
        if (monacoRef.current) {
            monacoRef.current.editor.setTheme(theme === "light" ? "custom-light" : "custom-dark")
        }
    }, [theme])

    // Update read-only state
    useEffect(() => {
        if (editorInstanceRef.current) {
            editorInstanceRef.current.updateOptions({ readOnly })
        }
    }, [readOnly])

    const bgColor = theme === "light" ? "#fafbfc" : "#0D1117"
    const borderColor = theme === "light" ? (isFocused ? "border-indigo-400 ring-2 ring-indigo-500/20" : "border-slate-200") : (isFocused ? "border-purple-500" : "border-gray-700")

    return (
        <div
            className={`relative rounded-xl overflow-hidden border ${borderColor} ${className} transition-colors`}
            style={{
                height,
                minHeight,
                maxHeight,
            }}
        >
            {/* Loading overlay */}
            {(!isEditorReady || isLoading) && (
                <div 
                    className={`absolute inset-0 flex items-center justify-center z-10 ${
                        theme === "light" ? "bg-white" : "bg-[#0D1117]"
                    }`}
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className={`w-8 h-8 border-2 rounded-full animate-spin ${
                            theme === "light" 
                                ? "border-indigo-500 border-t-transparent" 
                                : "border-purple-500 border-t-transparent"
                        }`} />
                        <span className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                            {isLoading ? "Running code..." : "Loading editor..."}
                        </span>
                    </div>
                </div>
            )}

            {/* Editor container */}
            <div
                ref={editorRef}
                className="w-full h-full"
                style={{ backgroundColor: bgColor }}
            />

            {/* Placeholder */}
            {placeholder && !value && isEditorReady && (
                <div className={`absolute top-4 left-16 pointer-events-none text-sm font-mono ${
                    theme === "light" ? "text-gray-400" : "text-gray-500"
                }`}>
                    {placeholder}
                </div>
            )}

            {/* Keyboard shortcuts hint */}
            {(onRun || onSubmit) && (
                <div className={`absolute bottom-2 right-2 flex items-center gap-2 text-xs ${
                    theme === "light" ? "text-gray-400" : "text-gray-500"
                }`}>
                    {onRun && (
                        <span className="flex items-center gap-1">
                            <kbd className={`px-1.5 py-0.5 rounded font-mono ${
                                theme === "light" 
                                    ? "bg-gray-100 border border-gray-200 text-gray-600" 
                                    : "bg-white/10 border border-white/20"
                            }`}>
                                Ctrl
                            </kbd>
                            <span>+</span>
                            <kbd className={`px-1.5 py-0.5 rounded font-mono ${
                                theme === "light" 
                                    ? "bg-gray-100 border border-gray-200 text-gray-600" 
                                    : "bg-white/10 border border-white/20"
                            }`}>
                                ↵
                            </kbd>
                            <span className="ml-1">Run</span>
                        </span>
                    )}
                    {onSubmit && (
                        <span className="flex items-center gap-1 ml-3">
                            <kbd className={`px-1.5 py-0.5 rounded font-mono ${
                                theme === "light" 
                                    ? "bg-gray-100 border border-gray-200 text-gray-600" 
                                    : "bg-white/10 border border-white/20"
                            }`}>
                                Ctrl
                            </kbd>
                            <span>+</span>
                            <kbd className={`px-1.5 py-0.5 rounded font-mono ${
                                theme === "light" 
                                    ? "bg-gray-100 border border-gray-200 text-gray-600" 
                                    : "bg-white/10 border border-white/20"
                            }`}>
                                ⇧
                            </kbd>
                            <span>+</span>
                            <kbd className={`px-1.5 py-0.5 rounded font-mono ${
                                theme === "light" 
                                    ? "bg-gray-100 border border-gray-200 text-gray-600" 
                                    : "bg-white/10 border border-white/20"
                            }`}>
                                ↵
                            </kbd>
                            <span className="ml-1">Submit</span>
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
