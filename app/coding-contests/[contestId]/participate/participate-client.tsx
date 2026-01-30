"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import ProctoringWrapper from "@/components/coding/proctoring-wrapper"
import { submitMCQAnswer, submitCode, runCode } from "@/lib/actions/coding-submission"
import { submitContest } from "@/lib/actions/coding-contest"

// Dynamically import CodeEditor to avoid SSR issues
const CodeEditor = dynamic(() => import("@/components/coding/code-editor"), {
    ssr: false,
    loading: () => (
        <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-500 font-medium">Loading editor...</span>
            </div>
        </div>
    ),
})

interface Question {
    id: string
    title: string
    description: string
    type: "MCQ" | "CODING"
    difficulty: "EASY" | "MEDIUM" | "HARD"
    points: number
    order: number
    mcqOptions: { id: string; text: string }[] | null
    allowedLanguages: string[] | null
    starterCode: Record<string, string> | null
    timeLimit: number | null
    memoryLimit: number | null
    testCases: { id: string; input: string; expectedOutput: string }[]
}

interface ExistingSubmission {
    questionId: string
    code: string | null
    language: string | null
    mcqAnswer: string | null
    score: number
    isCorrect: boolean | null
}

interface ContestData {
    id: string
    title: string
    slug: string
    duration: number
    startTime: Date
    endTime: Date
    enableProctoring: boolean
    enableTabSwitchDetection: boolean
    maxTabSwitches: number
    enableCopyPasteDetection: boolean
    enableFullscreenMode: boolean
    shuffleQuestions: boolean
    showLeaderboardDuringContest: boolean
}

interface ParticipantData {
    id: string
    startedAt: Date | null
    tabSwitchCount: number
}

interface Props {
    contest: ContestData
    participant: ParticipantData
    questions: Question[]
    existingSubmissions: ExistingSubmission[]
    userId: string
}

const difficultyConfig = {
    EASY: { label: "Easy", gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200" },
    MEDIUM: { label: "Medium", gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-200" },
    HARD: { label: "Hard", gradient: "from-red-500 to-rose-500", bg: "bg-red-50", text: "text-red-600", ring: "ring-red-200" },
}

const languageLabels: Record<string, string> = {
    javascript: "JavaScript",
    python: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
    go: "Go",
    rust: "Rust",
    typescript: "TypeScript",
}

const languageIcons: Record<string, { icon: string; color: string }> = {
    javascript: { icon: "JS", color: "from-yellow-400 to-yellow-500" },
    python: { icon: "PY", color: "from-blue-400 to-green-500" },
    java: { icon: "JV", color: "from-red-500 to-orange-500" },
    cpp: { icon: "C+", color: "from-blue-500 to-indigo-500" },
    c: { icon: "C", color: "from-slate-500 to-slate-600" },
    go: { icon: "GO", color: "from-cyan-400 to-blue-500" },
    rust: { icon: "RS", color: "from-orange-500 to-red-500" },
    typescript: { icon: "TS", color: "from-blue-500 to-blue-600" },
}

interface AnswerState {
    code: string
    language: string
    mcqAnswer?: string
}

export default function ParticipateClient({
    contest,
    participant,
    questions: rawQuestions,
    existingSubmissions,
    userId,
}: Props) {
    const router = useRouter()
    const hasInitializedRef = useRef(false)

    const questions = useMemo(() => {
        if (contest.shuffleQuestions) {
            return [...rawQuestions].sort(() => Math.random() - 0.5)
        }
        return rawQuestions.sort((a, b) => a.order - b.order)
    }, [rawQuestions, contest.shuffleQuestions])

    const initializeAnswers = useCallback(() => {
        const initial: Record<string, AnswerState> = {}
        
        questions.forEach(q => {
            const existing = existingSubmissions.find(s => s.questionId === q.id)
            const defaultLang = q.allowedLanguages?.[0] || "javascript"
            
            if (existing) {
                initial[q.id] = {
                    code: existing.code || q.starterCode?.[existing.language || defaultLang] || "",
                    language: existing.language || defaultLang,
                    mcqAnswer: existing.mcqAnswer ?? undefined,
                }
            } else {
                initial[q.id] = {
                    code: q.starterCode?.[defaultLang] || "",
                    language: defaultLang,
                    mcqAnswer: undefined,
                }
            }
        })
        
        return initial
    }, [questions, existingSubmissions])

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, AnswerState>>({})
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [runOutput, setRunOutput] = useState<{ type: "success" | "error"; output: string } | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<number>(0)
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
    const [submissionResults, setSubmissionResults] = useState<Record<string, { passed: boolean; score: number }>>({})
    const [activeTab, setActiveTab] = useState<"description" | "submissions">("description")

    const currentQuestion = questions[currentQuestionIndex]

    useEffect(() => {
        if (!hasInitializedRef.current && questions.length > 0) {
            hasInitializedRef.current = true
            setAnswers(initializeAnswers())
            
            const initialResults: Record<string, { passed: boolean; score: number }> = {}
            existingSubmissions.forEach(sub => {
                if (sub.isCorrect !== null) {
                    initialResults[sub.questionId] = {
                        passed: sub.isCorrect,
                        score: sub.score,
                    }
                }
            })
            setSubmissionResults(initialResults)
        }
    }, [questions, initializeAnswers, existingSubmissions])

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date()
            const end = new Date(contest.endTime)
            const remaining = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
            setTimeRemaining(remaining)

            if (remaining === 0) {
                handleFinalSubmit()
            }
        }

        calculateTimeRemaining()
        const interval = setInterval(calculateTimeRemaining, 1000)
        return () => clearInterval(interval)
    }, [contest.endTime])

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const getCurrentAnswer = useCallback((): AnswerState => {
        if (!currentQuestion) {
            return { code: "", language: "javascript" }
        }
        
        const answer = answers[currentQuestion.id]
        if (answer) return answer
        
        const defaultLang = currentQuestion.allowedLanguages?.[0] || "javascript"
        return {
            code: currentQuestion.starterCode?.[defaultLang] || "",
            language: defaultLang,
        }
    }, [answers, currentQuestion])

    const updateAnswer = useCallback((update: Partial<AnswerState>) => {
        if (!currentQuestion) return

        setAnswers(prev => {
            const current = prev[currentQuestion.id] || {
                code: "",
                language: currentQuestion.allowedLanguages?.[0] || "javascript",
            }

            const newState = { ...current }

            if (update.language && update.language !== current.language) {
                const oldStarterCode = currentQuestion.starterCode?.[current.language] || ""
                const newStarterCode = currentQuestion.starterCode?.[update.language] || ""
                
                if (!current.code || current.code === oldStarterCode || current.code.trim() === "") {
                    newState.code = newStarterCode
                }
                newState.language = update.language
            }

            if (update.code !== undefined) {
                newState.code = update.code
            }

            if (update.mcqAnswer !== undefined) {
                newState.mcqAnswer = update.mcqAnswer
            }

            return { ...prev, [currentQuestion.id]: newState }
        })
    }, [currentQuestion])

    const handleMCQSelect = async (optionId: string) => {
        updateAnswer({ mcqAnswer: optionId })
        
        const result = await submitMCQAnswer({
            participantId: participant.id,
            questionId: currentQuestion.id,
            selectedOptions: [optionId],
        })

        if (result.success && result.data) {
            // Store that answer was submitted, but don't reveal if correct during contest
            setSubmissionResults(prev => ({
                ...prev,
                [currentQuestion.id]: {
                    passed: false, // Don't reveal during contest
                    score: 0, // Don't show actual score during contest
                }
            }))
        }
    }

    const handleRunCode = async () => {
        const answer = getCurrentAnswer()
        if (!answer.code || !answer.language) {
            setRunOutput({ type: "error", output: "Please write some code before running." })
            return
        }

        setIsRunning(true)
        setRunOutput(null)

        try {
            const result = await runCode(
                answer.code, 
                answer.language, 
                currentQuestion.testCases[0]?.input || ""
            )

            if (result.success && result.data) {
                if (result.data.error) {
                    setRunOutput({ type: "error", output: `${result.data.output || ""}\n\n⚠️ ${result.data.error}` })
                } else {
                    setRunOutput({ type: "success", output: result.data.output || "Execution completed" })
                }
            } else {
                setRunOutput({ type: "error", output: result.message || "Failed to run code" })
            }
        } catch {
            setRunOutput({ type: "error", output: "An error occurred while running code" })
        } finally {
            setIsRunning(false)
        }
    }

    const handleSubmitCode = async () => {
        const answer = getCurrentAnswer()
        if (!answer.code || !answer.language) {
            setRunOutput({ type: "error", output: "Please write some code before submitting." })
            return
        }

        setIsSubmitting(true)

        try {
            const result = await submitCode({
                participantId: participant.id,
                questionId: currentQuestion.id,
                code: answer.code,
                language: answer.language as "python" | "javascript" | "typescript" | "cpp" | "c" | "java" | "go" | "rust",
            })

            if (result.success && result.data) {
                setSubmissionResults(prev => ({
                    ...prev,
                    [currentQuestion.id]: {
                        passed: result.data!.isCorrect,
                        score: result.data!.score,
                    }
                }))
                setRunOutput({
                    type: result.data.isCorrect ? "success" : "error",
                    output: result.data.isCorrect
                        ? `✅ All test cases passed! Score: ${result.data.score}`
                        : `${result.data.testCasesPassed}/${result.data.testCasesTotal} test cases passed. Score: ${result.data.score}`,
                })
            } else {
                setRunOutput({ type: "error", output: result.message || "Failed to submit code. Please try again." })
            }
        } catch {
            setRunOutput({ type: "error", output: "An error occurred while submitting" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFinalSubmit = async () => {
        const result = await submitContest(contest.id)
        if (result.success) {
            router.push(`/coding-contests/${contest.slug}/results`)
        }
    }

    // Count answered questions based on actual answers, not submission results
    const answeredCount = Object.entries(answers).filter(([qId, answer]) => {
        const question = questions.find(q => q.id === qId)
        if (!question) return false
        if (question.type === "MCQ") {
            return answer.mcqAnswer !== undefined
        } else {
            return answer.code && answer.code.trim().length > 0
        }
    }).length
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)

    const goToQuestion = (index: number) => {
        setCurrentQuestionIndex(index)
        setRunOutput(null)
        setActiveTab("description")
    }

    const getQuestionStatus = (questionId: string) => {
        const question = questions.find(q => q.id === questionId)
        const answer = answers[questionId]
        if (!question || !answer) return "unanswered"
        
        if (question.type === "MCQ") {
            return answer.mcqAnswer !== undefined ? "answered" : "unanswered"
        } else {
            return answer.code && answer.code.trim().length > 0 ? "answered" : "unanswered"
        }
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen pattern-bg flex items-center justify-center">
                <div className="glass-card rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading questions...</p>
                </div>
            </div>
        )
    }

    const currentAnswer = getCurrentAnswer()
    const diffConfig = difficultyConfig[currentQuestion.difficulty]
    const langInfo = languageIcons[currentAnswer.language] || { icon: "?", color: "from-slate-400 to-slate-500" }

    const content = (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Premium Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
                <div className="flex items-center justify-between px-4 h-16">
                    {/* Left: Logo & Contest */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-sm font-bold text-slate-800">{contest.title}</div>
                                <div className="text-xs text-slate-500">{questions.length} Questions</div>
                            </div>
                        </div>
                    </div>

                    {/* Center: Question Pills */}
                    <div className="flex items-center gap-1.5 bg-slate-100/80 rounded-xl p-1.5">
                        {questions.map((q, i) => {
                            const status = getQuestionStatus(q.id)
                            return (
                                <button
                                    key={q.id}
                                    onClick={() => goToQuestion(i)}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center ${
                                        i === currentQuestionIndex
                                            ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 scale-105"
                                            : status === "answered"
                                            ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm"
                                            : "bg-white text-slate-600 hover:bg-slate-50 shadow-sm"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            )
                        })}
                    </div>

                    {/* Right: Timer & Actions */}
                    <div className="flex items-center gap-4">
                        {/* Timer */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                            timeRemaining < 300 
                                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30" 
                                : timeRemaining < 600
                                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                                : "bg-slate-100 text-slate-700"
                        }`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-mono text-sm font-bold tracking-wider">
                                {formatTime(timeRemaining)}
                            </span>
                        </div>

                        {/* Progress (answered count) */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-slate-700">{answeredCount}</span>
                            <span className="text-xs text-slate-400">/ {questions.length}</span>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={() => setShowSubmitConfirm(true)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Submit All
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="pt-16 h-screen">
                <div className="flex h-[calc(100vh-64px)]">
                    {currentQuestion.type === "MCQ" ? (
                        /* MCQ Layout */
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="max-w-3xl mx-auto">
                                {/* Question Header */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-sm text-slate-500 font-medium">
                                            Question {currentQuestionIndex + 1} of {questions.length}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${diffConfig.bg} ${diffConfig.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${diffConfig.gradient}`} />
                                            {diffConfig.label}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
                                            {currentQuestion.points} pts
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800">{currentQuestion.title}</h2>
                                </div>

                                {/* Question Card */}
                                <div className="glass-card rounded-2xl p-8 mb-8">
                                    <div className="prose prose-slate max-w-none">
                                        <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-lg">
                                            {currentQuestion.description}
                                        </div>
                                    </div>
                                </div>

                                {/* MCQ Options */}
                                <div className="space-y-4">
                                    {currentQuestion.mcqOptions?.map((option, i) => {
                                        const isSelected = currentAnswer.mcqAnswer === option.id

                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => handleMCQSelect(option.id)}
                                                className={`w-full p-5 rounded-2xl text-left transition-all duration-300 border-2 group ${
                                                    isSelected
                                                        ? "bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-400 shadow-lg shadow-indigo-500/20"
                                                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md"
                                                }`}
                                            >
                                                <div className="flex items-center gap-5">
                                                    <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
                                                        isSelected
                                                            ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30"
                                                            : "bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                                                    }`}>
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                    <span className="flex-1 text-slate-700 font-medium text-lg">{option.text}</span>
                                                    {isSelected && (
                                                        <span className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500">
                                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Answer Saved Banner (no right/wrong feedback) */}
                                {currentAnswer.mcqAnswer && (
                                    <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200">
                                        <p className="font-semibold text-lg text-indigo-700">
                                            ✓ Answer saved. You can change your selection anytime before submitting the contest.
                                        </p>
                                    </div>
                                )}

                                {/* Navigation */}
                                <div className="flex items-center justify-between mt-10 pt-8 border-t border-slate-200">
                                    <button
                                        onClick={() => goToQuestion(currentQuestionIndex - 1)}
                                        disabled={currentQuestionIndex === 0}
                                        className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        onClick={() => goToQuestion(currentQuestionIndex + 1)}
                                        disabled={currentQuestionIndex === questions.length - 1}
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Coding Layout - Split Pane */
                        <>
                            {/* Left Panel */}
                            <div className="w-1/2 border-r border-slate-200/60 flex flex-col bg-white">
                                {/* Tabs */}
                                <div className="flex items-center gap-1 px-4 py-3 border-b border-slate-200/60 bg-slate-50/50">
                                    <button
                                        onClick={() => setActiveTab("description")}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            activeTab === "description"
                                                ? "bg-white text-indigo-600 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                        }`}
                                    >
                                        Description
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("submissions")}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            activeTab === "submissions"
                                                ? "bg-white text-indigo-600 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                        }`}
                                    >
                                        Submissions
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    {activeTab === "description" ? (
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${diffConfig.bg} ${diffConfig.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${diffConfig.gradient}`} />
                                                        {diffConfig.label}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
                                                        {currentQuestion.points} pts
                                                    </span>
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-800">{currentQuestion.title}</h2>
                                            </div>

                                            <div className="prose prose-slate max-w-none">
                                                <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                                    {currentQuestion.description}
                                                </div>
                                            </div>

                                            {/* Test Cases */}
                                            {currentQuestion.testCases.length > 0 && (
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-bold text-slate-700">Examples</h3>
                                                    {currentQuestion.testCases.map((tc, i) => (
                                                        <div key={tc.id} className="rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
                                                            <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200">
                                                                <span className="text-xs font-bold text-slate-600">Example {i + 1}</span>
                                                            </div>
                                                            <div className="p-4 space-y-3">
                                                                <div>
                                                                    <span className="text-xs font-semibold text-slate-500 block mb-1">Input:</span>
                                                                    <pre className="text-sm text-slate-700 font-mono bg-white p-3 rounded-lg border border-slate-200">{tc.input}</pre>
                                                                </div>
                                                                <div>
                                                                    <span className="text-xs font-semibold text-slate-500 block mb-1">Output:</span>
                                                                    <pre className="text-sm text-slate-700 font-mono bg-white p-3 rounded-lg border border-slate-200">{tc.expectedOutput}</pre>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Constraints */}
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-bold text-slate-700">Constraints</h3>
                                                <div className="flex flex-wrap gap-3">
                                                    {currentQuestion.timeLimit && (
                                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-sm text-slate-600">{currentQuestion.timeLimit}ms</span>
                                                        </div>
                                                    )}
                                                    {currentQuestion.memoryLimit && (
                                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-sm text-slate-600">{currentQuestion.memoryLimit}MB</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {submissionResults[currentQuestion.id] ? (
                                                <div className={`p-5 rounded-2xl ${
                                                    submissionResults[currentQuestion.id].passed
                                                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200"
                                                        : "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
                                                }`}>
                                                    <p className={`font-semibold ${submissionResults[currentQuestion.id].passed ? "text-emerald-700" : "text-amber-700"}`}>
                                                        {submissionResults[currentQuestion.id].passed
                                                            ? `✅ Accepted - ${submissionResults[currentQuestion.id].score} points`
                                                            : `⚠️ Partial Score - ${submissionResults[currentQuestion.id].score} points`
                                                        }
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-center py-16">
                                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-slate-500">No submissions yet</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Navigation */}
                                <div className="flex items-center justify-between p-4 border-t border-slate-200/60 bg-slate-50/50">
                                    <button
                                        onClick={() => goToQuestion(currentQuestionIndex - 1)}
                                        disabled={currentQuestionIndex === 0}
                                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        ← Prev
                                    </button>
                                    <span className="text-sm text-slate-500 font-medium">
                                        {currentQuestionIndex + 1} / {questions.length}
                                    </span>
                                    <button
                                        onClick={() => goToQuestion(currentQuestionIndex + 1)}
                                        disabled={currentQuestionIndex === questions.length - 1}
                                        className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>

                            {/* Right Panel - Code Editor */}
                            <div className="w-1/2 flex flex-col bg-slate-50">
                                {/* Language & Actions */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${langInfo.color} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                                            {langInfo.icon}
                                        </div>
                                        <select
                                            value={currentAnswer.language}
                                            onChange={(e) => updateAnswer({ language: e.target.value })}
                                            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                                        >
                                            {currentQuestion.allowedLanguages?.map(lang => (
                                                <option key={lang} value={lang}>
                                                    {languageLabels[lang] || lang}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleRunCode}
                                            disabled={isRunning || isSubmitting}
                                            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-200"
                                        >
                                            {isRunning ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                                    Running
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    </svg>
                                                    Run
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleSubmitCode}
                                            disabled={isRunning || isSubmitting}
                                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Submitting
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                    Submit
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Code Editor */}
                                <div className="flex-1 overflow-hidden">
                                    <CodeEditor
                                        key={`${currentQuestion.id}-${currentAnswer.language}`}
                                        value={currentAnswer.code}
                                        onChange={(code) => updateAnswer({ code })}
                                        language={currentAnswer.language}
                                        theme="light"
                                        height="100%"
                                        onRun={handleRunCode}
                                        onSubmit={handleSubmitCode}
                                        isLoading={isRunning || isSubmitting}
                                    />
                                </div>

                                {/* Output Panel */}
                                <div className="h-48 border-t border-slate-200/60 bg-white flex flex-col">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200/60 bg-slate-50/50">
                                        <span className="text-sm font-semibold text-slate-700">Console</span>
                                        {runOutput && (
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                                runOutput.type === "success"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}>
                                                {runOutput.type === "success" ? "✓ Success" : "✗ Error"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4">
                                        {runOutput ? (
                                            <pre className={`text-sm font-mono whitespace-pre-wrap ${
                                                runOutput.type === "success" ? "text-slate-700" : "text-red-600"
                                            }`}>
                                                {runOutput.output}
                                            </pre>
                                        ) : (
                                            <p className="text-slate-400 text-sm">
                                                Run your code to see output here...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <div className="max-w-md w-full mx-4 glass-card rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Submit Contest?</h3>
                            <p className="text-slate-500 mb-6">
                                You've answered <span className="font-bold text-slate-700">{answeredCount}</span> of <span className="font-bold text-slate-700">{questions.length}</span> questions.
                            </p>

                            <div className="bg-slate-50 rounded-2xl p-5 mb-6">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-slate-800">{answeredCount}</div>
                                        <div className="text-sm text-slate-500">Answered</div>
                                    </div>
                                    <div className="w-px h-12 bg-slate-200"></div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-slate-400">{questions.length - answeredCount}</div>
                                        <div className="text-sm text-slate-500">Unanswered</div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-amber-600 text-sm font-medium mb-6">
                                ⚠️ This action cannot be undone. Your score will be revealed after submission.
                            </p>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowSubmitConfirm(false)}
                                    className="flex-1 px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFinalSubmit}
                                    className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all"
                                >
                                    Submit Contest
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    if (contest.enableProctoring) {
        return (
            <ProctoringWrapper
                participantId={participant.id}
                contestId={contest.id}
                enableFullscreenLock={contest.enableFullscreenMode}
                enableTabSwitchDetection={contest.enableTabSwitchDetection}
                enableCopyPasteBlock={contest.enableCopyPasteDetection}
                maxTabSwitches={contest.maxTabSwitches}
            >
                {content}
            </ProctoringWrapper>
        )
    }

    return content
}
