"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import ProctoringWrapper from "@/components/coding/proctoring-wrapper"
import { submitMCQAnswer, submitCode, runCode } from "@/lib/actions/coding-submission"
import { submitContest } from "@/lib/actions/coding-contest"

// Dynamically import CodeEditor to avoid SSR issues
const CodeEditor = dynamic(() => import("@/components/coding/code-editor"), {
    ssr: false,
    loading: () => (
        <div className="h-96 bg-[#0D1117] rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
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
    mcqOptions: string[] | null
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
    mcqAnswer: number | null
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

const difficultyColors = {
    EASY: "text-green-400",
    MEDIUM: "text-yellow-400",
    HARD: "text-red-400",
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

export default function ParticipateClient({
    contest,
    participant,
    questions: rawQuestions,
    existingSubmissions,
    userId,
}: Props) {
    const router = useRouter()

    // Shuffle questions if enabled
    const questions = useMemo(() => {
        if (contest.shuffleQuestions) {
            return [...rawQuestions].sort(() => Math.random() - 0.5)
        }
        return rawQuestions.sort((a, b) => a.order - b.order)
    }, [rawQuestions, contest.shuffleQuestions])

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, { code?: string; language?: string; mcqAnswer?: number }>>(() => {
        const initial: Record<string, { code?: string; language?: string; mcqAnswer?: number }> = {}
        existingSubmissions.forEach(sub => {
            initial[sub.questionId] = {
                code: sub.code || undefined,
                language: sub.language || undefined,
                mcqAnswer: sub.mcqAnswer ?? undefined,
            }
        })
        return initial
    })
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [runOutput, setRunOutput] = useState<{ type: "success" | "error"; output: string; testResults?: any[] } | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<number>(0)
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
    const [submissionResults, setSubmissionResults] = useState<Record<string, { passed: boolean; score: number }>>({})

    const currentQuestion = questions[currentQuestionIndex]

    // Calculate time remaining
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

    // Format time
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    // Get current answer
    const getCurrentAnswer = () => answers[currentQuestion.id] || {}

    // Update answer
    const updateAnswer = (update: { code?: string; language?: string; mcqAnswer?: number }) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: {
                ...prev[currentQuestion.id],
                ...update,
            }
        }))
    }

    // Handle MCQ selection
    const handleMCQSelect = async (optionIndex: number) => {
        updateAnswer({ mcqAnswer: optionIndex })
        
        // Auto-submit MCQ - convert index to option ID
        const optionId = currentQuestion.mcqOptions?.[optionIndex] || String(optionIndex)
        const result = await submitMCQAnswer({
            participantId: participant.id,
            questionId: currentQuestion.id,
            selectedOptions: [String(optionIndex)],
        })

        if (result.success && result.data) {
            setSubmissionResults(prev => ({
                ...prev,
                [currentQuestion.id]: {
                    passed: result.data!.isCorrect,
                    score: result.data!.score,
                }
            }))
        }
    }

    // Handle code run
    const handleRunCode = async () => {
        const answer = getCurrentAnswer()
        if (!answer.code || !answer.language) return

        setIsRunning(true)
        setRunOutput(null)

        try {
            // Run code against sample test cases
            const result = await runCode(answer.code, answer.language, currentQuestion.testCases[0]?.input || "")

            if (result.success && result.data) {
                setRunOutput({
                    type: "success",
                    output: result.data.output || "Execution completed",
                })
            } else {
                setRunOutput({
                    type: "error",
                    output: result.message || "Failed to run code",
                })
            }
        } catch (error) {
            setRunOutput({
                type: "error",
                output: "An error occurred while running code",
            })
        } finally {
            setIsRunning(false)
        }
    }

    // Handle code submit
    const handleSubmitCode = async () => {
        const answer = getCurrentAnswer()
        if (!answer.code || !answer.language) return

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
            }
        } catch (error) {
            setRunOutput({
                type: "error",
                output: "An error occurred while submitting",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle final contest submit
    const handleFinalSubmit = async () => {
        const result = await submitContest(contest.id)
        if (result.success) {
            router.push(`/coding-contests/${contest.slug}/results`)
        }
    }

    // Calculate progress
    const answeredCount = Object.keys(submissionResults).length
    const totalScore = Object.values(submissionResults).reduce((sum, r) => sum + r.score, 0)
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)

    // Question navigation
    const goToQuestion = (index: number) => {
        setCurrentQuestionIndex(index)
        setRunOutput(null)
    }

    // Get question status
    const getQuestionStatus = (questionId: string) => {
        const result = submissionResults[questionId]
        if (!result) return "unanswered"
        return result.passed ? "correct" : "attempted"
    }

    const content = (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold text-white">{contest.title}</h1>
                    </div>

                    {/* Timer */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        timeRemaining < 300 ? "bg-red-600/50 animate-pulse" : "bg-white/10"
                    }`}>
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-mono text-lg font-bold text-white">
                            {formatTime(timeRemaining)}
                        </span>
                    </div>

                    {/* Progress & Submit */}
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400">
                            Score: <span className="text-white font-bold">{totalScore}/{maxScore}</span>
                        </div>
                        <button
                            onClick={() => setShowSubmitConfirm(true)}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500 transition-colors"
                        >
                            Submit Contest
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex pt-16">
                {/* Question Navigator Sidebar */}
                <aside className="fixed left-0 top-16 bottom-0 w-20 border-r border-white/10 bg-black/30 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="space-y-2">
                        {questions.map((q, i) => {
                            const status = getQuestionStatus(q.id)
                            return (
                                <button
                                    key={q.id}
                                    onClick={() => goToQuestion(i)}
                                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold transition-all ${
                                        i === currentQuestionIndex
                                            ? "bg-purple-600 text-white ring-2 ring-purple-400"
                                            : status === "correct"
                                            ? "bg-green-600/30 text-green-400 border border-green-500/50"
                                            : status === "attempted"
                                            ? "bg-yellow-600/30 text-yellow-400 border border-yellow-500/50"
                                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            )
                        })}
                    </div>
                </aside>

                {/* Question Content */}
                <main className="ml-20 flex-1 p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Question Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-gray-400 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</span>
                                <span className={`text-sm ${difficultyColors[currentQuestion.difficulty]}`}>
                                    {currentQuestion.difficulty}
                                </span>
                                <span className="text-purple-400 text-sm">⭐ {currentQuestion.points} pts</span>
                                {currentQuestion.type === "CODING" && (
                                    <span className="text-gray-400 text-sm">💻 Coding</span>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-white">{currentQuestion.title}</h2>
                        </div>

                        {currentQuestion.type === "MCQ" ? (
                            /* MCQ Question */
                            <div className="space-y-6">
                                <div className="prose prose-invert max-w-none">
                                    <div className="text-gray-300 whitespace-pre-wrap">
                                        {currentQuestion.description}
                                    </div>
                                </div>

                                <div className="space-y-3 mt-8">
                                    {currentQuestion.mcqOptions?.map((option, i) => {
                                        const isSelected = getCurrentAnswer().mcqAnswer === i
                                        const result = submissionResults[currentQuestion.id]
                                        const showResult = result !== undefined

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleMCQSelect(i)}
                                                disabled={showResult}
                                                className={`w-full p-4 rounded-xl text-left transition-all ${
                                                    isSelected
                                                        ? showResult
                                                            ? result.passed
                                                                ? "bg-green-600/20 border-2 border-green-500"
                                                                : "bg-red-600/20 border-2 border-red-500"
                                                            : "bg-purple-600/20 border-2 border-purple-500"
                                                        : "bg-white/5 border border-white/10 hover:border-white/30"
                                                } ${showResult ? "cursor-not-allowed" : ""}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                        isSelected
                                                            ? "bg-purple-600 text-white"
                                                            : "bg-white/10 text-gray-400"
                                                    }`}>
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                    <span className="text-white">{option}</span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                {submissionResults[currentQuestion.id] && (
                                    <div className={`p-4 rounded-lg ${
                                        submissionResults[currentQuestion.id].passed
                                            ? "bg-green-900/30 border border-green-500/30"
                                            : "bg-red-900/30 border border-red-500/30"
                                    }`}>
                                        <p className={submissionResults[currentQuestion.id].passed ? "text-green-400" : "text-red-400"}>
                                            {submissionResults[currentQuestion.id].passed
                                                ? `✅ Correct! +${submissionResults[currentQuestion.id].score} points`
                                                : `❌ Incorrect. Score: ${submissionResults[currentQuestion.id].score}`
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Coding Question */
                            <div className="grid grid-cols-2 gap-6">
                                {/* Left: Problem Description */}
                                <div className="space-y-6">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                                        <div className="prose prose-invert max-w-none">
                                            <div className="text-gray-300 whitespace-pre-wrap">
                                                {currentQuestion.description}
                                            </div>
                                        </div>

                                        {/* Sample Test Cases */}
                                        {currentQuestion.testCases.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-white/10">
                                                <h3 className="text-sm font-semibold text-white mb-4">Sample Test Cases</h3>
                                                <div className="space-y-4">
                                                    {currentQuestion.testCases.map((tc, i) => (
                                                        <div key={tc.id} className="bg-black/30 rounded-lg p-4">
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500 text-xs">Input:</span>
                                                                    <pre className="text-gray-300 mt-1 font-mono text-xs">{tc.input}</pre>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 text-xs">Expected Output:</span>
                                                                    <pre className="text-gray-300 mt-1 font-mono text-xs">{tc.expectedOutput}</pre>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Constraints */}
                                        <div className="mt-6 pt-6 border-t border-white/10 text-sm text-gray-400">
                                            <div className="flex items-center gap-4">
                                                {currentQuestion.timeLimit && (
                                                    <span>⏱️ Time Limit: {currentQuestion.timeLimit}ms</span>
                                                )}
                                                {currentQuestion.memoryLimit && (
                                                    <span>💾 Memory: {currentQuestion.memoryLimit}MB</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Code Editor */}
                                <div className="space-y-4">
                                    {/* Language Selector */}
                                    <div className="flex items-center justify-between">
                                        <select
                                            value={getCurrentAnswer().language || currentQuestion.allowedLanguages?.[0] || "javascript"}
                                            onChange={(e) => {
                                                const lang = e.target.value
                                                updateAnswer({
                                                    language: lang,
                                                    code: getCurrentAnswer().code || currentQuestion.starterCode?.[lang] || "",
                                                })
                                            }}
                                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            {currentQuestion.allowedLanguages?.map(lang => (
                                                <option key={lang} value={lang}>
                                                    {languageLabels[lang] || lang}
                                                </option>
                                            ))}
                                        </select>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleRunCode}
                                                disabled={isRunning || isSubmitting}
                                                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {isRunning ? "Running..." : "▶ Run"}
                                            </button>
                                            <button
                                                onClick={handleSubmitCode}
                                                disabled={isRunning || isSubmitting}
                                                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {isSubmitting ? "Submitting..." : "Submit"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Editor */}
                                    <CodeEditor
                                        value={getCurrentAnswer().code || currentQuestion.starterCode?.[getCurrentAnswer().language || currentQuestion.allowedLanguages?.[0] || "javascript"] || ""}
                                        onChange={(code) => updateAnswer({ code })}
                                        language={getCurrentAnswer().language || currentQuestion.allowedLanguages?.[0] || "javascript"}
                                        height="400px"
                                        onRun={handleRunCode}
                                        onSubmit={handleSubmitCode}
                                        isLoading={isRunning || isSubmitting}
                                    />

                                    {/* Output Panel */}
                                    <div className="bg-black/50 border border-white/10 rounded-xl p-4 min-h-[150px]">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-gray-400">Output</span>
                                            {runOutput && (
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    runOutput.type === "success"
                                                        ? "bg-green-600/20 text-green-400"
                                                        : "bg-red-600/20 text-red-400"
                                                }`}>
                                                    {runOutput.type === "success" ? "Passed" : "Failed"}
                                                </span>
                                            )}
                                        </div>
                                        {runOutput ? (
                                            <div className="space-y-3">
                                                <pre className={`text-sm font-mono ${
                                                    runOutput.type === "success" ? "text-green-400" : "text-red-400"
                                                }`}>
                                                    {runOutput.output}
                                                </pre>
                                                {runOutput.testResults && (
                                                    <div className="space-y-2 pt-3 border-t border-white/10">
                                                        {runOutput.testResults.map((tr, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-xs">
                                                                <span className={tr.passed ? "text-green-400" : "text-red-400"}>
                                                                    {tr.passed ? "✓" : "✗"}
                                                                </span>
                                                                <span className="text-gray-400">Test Case {i + 1}</span>
                                                                {!tr.passed && tr.actualOutput && (
                                                                    <span className="text-gray-500">
                                                                        Got: {tr.actualOutput.slice(0, 50)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">
                                                Run your code to see output here
                                            </p>
                                        )}
                                    </div>

                                    {/* Submission Result */}
                                    {submissionResults[currentQuestion.id] && (
                                        <div className={`p-4 rounded-lg ${
                                            submissionResults[currentQuestion.id].passed
                                                ? "bg-green-900/30 border border-green-500/30"
                                                : "bg-yellow-900/30 border border-yellow-500/30"
                                        }`}>
                                            <p className={submissionResults[currentQuestion.id].passed ? "text-green-400" : "text-yellow-400"}>
                                                {submissionResults[currentQuestion.id].passed
                                                    ? `✅ All test cases passed! +${submissionResults[currentQuestion.id].score} points`
                                                    : `⚠️ Partial score: ${submissionResults[currentQuestion.id].score} points`
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                            <button
                                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                ← Previous
                            </button>
                            <button
                                onClick={() => goToQuestion(currentQuestionIndex + 1)}
                                disabled={currentQuestionIndex === questions.length - 1}
                                className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="max-w-md w-full mx-4 p-6 bg-slate-900 border border-white/10 rounded-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Submit Contest?</h3>
                        <p className="text-gray-400 mb-6">
                            You have answered {answeredCount} of {questions.length} questions.
                            Your current score is {totalScore}/{maxScore} points.
                        </p>
                        <p className="text-yellow-400 text-sm mb-6">
                            ⚠️ This action cannot be undone. Make sure you have reviewed all your answers.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowSubmitConfirm(false)}
                                className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500 transition-colors"
                            >
                                Submit Contest
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    // Wrap with proctoring if enabled
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
