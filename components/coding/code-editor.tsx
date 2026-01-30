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
    theme = "dark",
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
    const [isEditorReady, setIsEditorReady] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    // Load Monaco Editor
    useEffect(() => {
        const loadMonaco = async () => {
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
            if (!editorRef.current) return

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

            const editor = monaco.editor.create(editorRef.current, {
                value: value,
                language: languageMap[language] || language,
                theme: theme === "dark" ? "custom-dark" : "vs",
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
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
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
        }

        loadMonaco()

        return () => {
            if (editorInstanceRef.current) {
                editorInstanceRef.current.dispose()
            }
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
            monacoRef.current.editor.setTheme(theme === "dark" ? "custom-dark" : "vs")
        }
    }, [theme])

    // Update read-only state
    useEffect(() => {
        if (editorInstanceRef.current) {
            editorInstanceRef.current.updateOptions({ readOnly })
        }
    }, [readOnly])

    return (
        <div
            className={`relative rounded-xl overflow-hidden ${className} ${
                isFocused ? "ring-2 ring-purple-500/50" : ""
            }`}
            style={{
                height,
                minHeight,
                maxHeight,
            }}
        >
            {/* Loading overlay */}
            {(!isEditorReady || isLoading) && (
                <div className="absolute inset-0 bg-[#0D1117] flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-400">
                            {isLoading ? "Running code..." : "Loading editor..."}
                        </span>
                    </div>
                </div>
            )}

            {/* Editor container */}
            <div
                ref={editorRef}
                className="w-full h-full"
                style={{ backgroundColor: "#0D1117" }}
            />

            {/* Placeholder */}
            {placeholder && !value && isEditorReady && (
                <div className="absolute top-4 left-16 text-gray-500 pointer-events-none text-sm font-mono">
                    {placeholder}
                </div>
            )}

            {/* Keyboard shortcuts hint */}
            {(onRun || onSubmit) && (
                <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-gray-500">
                    {onRun && (
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono">
                                Ctrl
                            </kbd>
                            <span>+</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono">
                                Enter
                            </kbd>
                            <span className="ml-1">Run</span>
                        </span>
                    )}
                    {onSubmit && (
                        <span className="flex items-center gap-1 ml-3">
                            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono">
                                Ctrl
                            </kbd>
                            <span>+</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono">
                                Shift
                            </kbd>
                            <span>+</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono">
                                Enter
                            </kbd>
                            <span className="ml-1">Submit</span>
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
