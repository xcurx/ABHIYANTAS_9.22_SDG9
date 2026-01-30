"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createMCQQuestion, createCodingQuestion, createTestCase } from "@/lib/actions/coding-question"

type QuestionType = "mcq" | "coding"
type Difficulty = "EASY" | "MEDIUM" | "HARD"

interface MCQOption {
    id: string
    text: string
    isCorrect: boolean
}

interface TestCase {
    id: string
    input: string
    expectedOutput: string
    isHidden: boolean
    points: number
    description: string
}

export default function NewQuestionForm({ contestId, contestSlug }: { contestId: string; contestSlug: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialType = (searchParams.get("type") as QuestionType) || "mcq"
    
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [questionType, setQuestionType] = useState<QuestionType>(initialType)

    // Common fields
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM")
    const [points, setPoints] = useState(100)

    // MCQ specific
    const [options, setOptions] = useState<MCQOption[]>([
        { id: "1", text: "", isCorrect: false },
        { id: "2", text: "", isCorrect: false },
        { id: "3", text: "", isCorrect: false },
        { id: "4", text: "", isCorrect: false },
    ])
    const [explanation, setExplanation] = useState("")

    // Coding specific
    const [languages, setLanguages] = useState<string[]>(["javascript", "python", "java", "cpp"])
    const [starterCode, setStarterCode] = useState<Record<string, string>>({
        javascript: "function solution(input) {\n    // Write your code here\n    \n}",
        python: "def solution(input):\n    # Write your code here\n    pass",
        java: "public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
        cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    })
    const [solutionCode, setSolutionCode] = useState("")
    const [timeLimit, setTimeLimit] = useState(2000)
    const [memoryLimit, setMemoryLimit] = useState(256)
    const [testCases, setTestCases] = useState<TestCase[]>([
        { id: "1", input: "", expectedOutput: "", isHidden: false, points: 10, description: "Sample test" },
    ])

    const addOption = () => {
        setOptions([...options, { id: Date.now().toString(), text: "", isCorrect: false }])
    }

    const removeOption = (id: string) => {
        if (options.length > 2) {
            setOptions(options.filter(o => o.id !== id))
        }
    }

    const updateOption = (id: string, field: "text" | "isCorrect", value: string | boolean) => {
        setOptions(options.map(o => {
            if (o.id === id) {
                return { ...o, [field]: value }
            }
            if (field === "isCorrect" && value === true) {
                return { ...o, isCorrect: false }
            }
            return o
        }))
    }

    const addTestCase = () => {
        setTestCases([...testCases, { 
            id: Date.now().toString(), 
            input: "", 
            expectedOutput: "", 
            isHidden: true, 
            points: 10,
            description: `Test case ${testCases.length + 1}`
        }])
    }

    const removeTestCase = (id: string) => {
        if (testCases.length > 1) {
            setTestCases(testCases.filter(t => t.id !== id))
        }
    }

    const updateTestCase = (id: string, field: keyof TestCase, value: string | boolean | number) => {
        setTestCases(testCases.map(t => t.id === id ? { ...t, [field]: value } : t))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        startTransition(async () => {
            try {
                if (questionType === "mcq") {
                    const correctOption = options.find(o => o.isCorrect)
                    if (!correctOption) {
                        setError("Please select a correct answer")
                        return
                    }

                    const result = await createMCQQuestion({
                        contestId,
                        type: "MCQ",
                        title,
                        description,
                        difficulty,
                        points,
                        order: 0, // Auto-assigned by server
                        options: options.map((o, i) => ({
                            id: o.id,
                            text: o.text,
                            isCorrect: o.isCorrect,
                        })),
                        allowMultiple: false,
                        tags: [],
                        explanation,
                    })

                    if (!result.success) {
                        setError(result.message || "Failed to create question")
                        return
                    }
                } else {
                    // Create coding question
                    const questionResult = await createCodingQuestion({
                        contestId,
                        type: "CODING",
                        title,
                        description,
                        difficulty,
                        points,
                        order: 0, // Auto-assigned by server
                        starterCode,
                        solutionCode: { default: solutionCode },
                        timeLimit,
                        memoryLimit,
                        hints: [],
                        tags: [],
                    })

                    if (!questionResult.success || !questionResult.data) {
                        setError(questionResult.message || "Failed to create question")
                        return
                    }

                    // Create test cases
                    for (let i = 0; i < testCases.length; i++) {
                        const tc = testCases[i]
                        await createTestCase({
                            questionId: questionResult.data.questionId,
                            input: tc.input,
                            output: tc.expectedOutput,
                            isHidden: tc.isHidden,
                            isSample: !tc.isHidden,
                            points: tc.points,
                            order: i,
                        })
                    }
                }

                router.push(`/coding-contests/${contestSlug}/manage/questions`)
                router.refresh()
            } catch (err) {
                setError("An unexpected error occurred")
            }
        })
    }

    const availableLanguages = [
        { id: "javascript", name: "JavaScript", icon: "🟨" },
        { id: "python", name: "Python", icon: "🐍" },
        { id: "java", name: "Java", icon: "☕" },
        { id: "cpp", name: "C++", icon: "⚙️" },
        { id: "c", name: "C", icon: "©️" },
        { id: "go", name: "Go", icon: "🔵" },
        { id: "rust", name: "Rust", icon: "🦀" },
        { id: "typescript", name: "TypeScript", icon: "🔷" },
    ]

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Question Type Toggle */}
            <div className="flex items-center gap-4 p-1 bg-white/5 rounded-xl w-fit">
                <button
                    type="button"
                    onClick={() => setQuestionType("mcq")}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        questionType === "mcq"
                            ? "bg-purple-600 text-white"
                            : "text-gray-400 hover:text-white"
                    }`}
                >
                    📝 MCQ Question
                </button>
                <button
                    type="button"
                    onClick={() => setQuestionType("coding")}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        questionType === "coding"
                            ? "bg-purple-600 text-white"
                            : "text-gray-400 hover:text-white"
                    }`}
                >
                    💻 Coding Question
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                    {error}
                </div>
            )}

            {/* Common Fields */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Basic Information</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Question Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="e.g., Two Sum Problem"
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={6}
                            placeholder="Describe the problem in detail. You can use markdown for formatting..."
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Supports Markdown formatting. Include examples and constraints.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Difficulty
                            </label>
                            <div className="flex items-center gap-3">
                                {(["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setDifficulty(d)}
                                        className={`px-4 py-2 rounded-lg border font-medium transition-all ${
                                            difficulty === d
                                                ? d === "EASY"
                                                    ? "bg-green-600/20 border-green-500 text-green-400"
                                                    : d === "MEDIUM"
                                                    ? "bg-yellow-600/20 border-yellow-500 text-yellow-400"
                                                    : "bg-red-600/20 border-red-500 text-red-400"
                                                : "border-white/10 text-gray-400 hover:border-white/30"
                                        }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Points
                            </label>
                            <input
                                type="number"
                                value={points}
                                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                                min={1}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* MCQ Options */}
            {questionType === "mcq" && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Answer Options</h2>
                        <button
                            type="button"
                            onClick={addOption}
                            className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                            + Add Option
                        </button>
                    </div>
                    <div className="space-y-4">
                        {options.map((option, index) => (
                            <div key={option.id} className="flex items-start gap-4">
                                <button
                                    type="button"
                                    onClick={() => updateOption(option.id, "isCorrect", true)}
                                    className={`mt-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                        option.isCorrect
                                            ? "border-green-500 bg-green-500"
                                            : "border-white/30 hover:border-white/50"
                                    }`}
                                >
                                    {option.isCorrect && (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => updateOption(option.id, "text", e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(option.id)}
                                        className="mt-3 text-gray-400 hover:text-red-400"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        Click the circle to mark the correct answer
                    </p>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Explanation (optional)
                        </label>
                        <textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            rows={3}
                            placeholder="Explain why the correct answer is correct..."
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                    </div>
                </div>
            )}

            {/* Coding Question Options */}
            {questionType === "coding" && (
                <>
                    {/* Languages */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-6">Allowed Languages</h2>
                        <div className="flex flex-wrap gap-3">
                            {availableLanguages.map((lang) => (
                                <button
                                    key={lang.id}
                                    type="button"
                                    onClick={() => {
                                        if (languages.includes(lang.id)) {
                                            if (languages.length > 1) {
                                                setLanguages(languages.filter(l => l !== lang.id))
                                            }
                                        } else {
                                            setLanguages([...languages, lang.id])
                                        }
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                        languages.includes(lang.id)
                                            ? "bg-purple-600/20 border-purple-500 text-purple-300"
                                            : "border-white/10 text-gray-400 hover:border-white/30"
                                    }`}
                                >
                                    <span>{lang.icon}</span>
                                    <span>{lang.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Starter Code */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-6">Starter Code</h2>
                        <div className="space-y-4">
                            {languages.map((lang) => (
                                <div key={lang}>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {availableLanguages.find(l => l.id === lang)?.name || lang}
                                    </label>
                                    <textarea
                                        value={starterCode[lang] || ""}
                                        onChange={(e) => setStarterCode({ ...starterCode, [lang]: e.target.value })}
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Limits */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-6">Execution Limits</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Time Limit (ms)
                                </label>
                                <input
                                    type="number"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 1000)}
                                    min={100}
                                    max={30000}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Memory Limit (MB)
                                </label>
                                <input
                                    type="number"
                                    value={memoryLimit}
                                    onChange={(e) => setMemoryLimit(parseInt(e.target.value) || 256)}
                                    min={16}
                                    max={1024}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Test Cases */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Test Cases</h2>
                            <button
                                type="button"
                                onClick={addTestCase}
                                className="text-purple-400 hover:text-purple-300 text-sm"
                            >
                                + Add Test Case
                            </button>
                        </div>
                        <div className="space-y-6">
                            {testCases.map((tc, index) => (
                                <div key={tc.id} className="p-4 rounded-lg bg-black/20 border border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-white">Test Case {index + 1}</span>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={tc.isHidden}
                                                    onChange={(e) => updateTestCase(tc.id, "isHidden", e.target.checked)}
                                                    className="w-4 h-4 rounded bg-white/10 border-white/20"
                                                />
                                                <span className="text-gray-400">Hidden</span>
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Points:</span>
                                                <input
                                                    type="number"
                                                    value={tc.points}
                                                    onChange={(e) => updateTestCase(tc.id, "points", parseInt(e.target.value) || 0)}
                                                    min={0}
                                                    className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                />
                                            </div>
                                            {testCases.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTestCase(tc.id)}
                                                    className="text-gray-400 hover:text-red-400"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                Input
                                            </label>
                                            <textarea
                                                value={tc.input}
                                                onChange={(e) => updateTestCase(tc.id, "input", e.target.value)}
                                                rows={3}
                                                placeholder="5&#10;1 2 3 4 5"
                                                className="w-full px-3 py-2 rounded bg-black/30 border border-white/10 text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                Expected Output
                                            </label>
                                            <textarea
                                                value={tc.expectedOutput}
                                                onChange={(e) => updateTestCase(tc.id, "expectedOutput", e.target.value)}
                                                rows={3}
                                                placeholder="15"
                                                className="w-full px-3 py-2 rounded bg-black/30 border border-white/10 text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            Hidden test cases are not shown to participants during the contest. Use them to prevent hardcoding.
                        </p>
                    </div>

                    {/* Solution Code */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-2">Solution Code (optional)</h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Reference solution for validation. This will not be shown to participants.
                        </p>
                        <textarea
                            value={solutionCode}
                            onChange={(e) => setSolutionCode(e.target.value)}
                            rows={8}
                            placeholder="// Your reference solution here..."
                            className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                    </div>
                </>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <Link
                    href={`/coding-contests/${contestSlug}/manage/questions`}
                    className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isPending ? (
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Creating...
                        </span>
                    ) : (
                        `Create ${questionType === "mcq" ? "MCQ" : "Coding"} Question`
                    )}
                </button>
            </div>
        </form>
    )
}
