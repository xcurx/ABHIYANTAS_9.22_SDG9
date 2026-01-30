"use client"

import { useTransition } from "react"

interface DeleteButtonProps {
    questionId: string
    onDelete: (questionId: string) => Promise<void>
}

export function DeleteButton({ questionId, onDelete }: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleClick = () => {
        if (confirm("Are you sure you want to delete this question?")) {
            startTransition(async () => {
                await onDelete(questionId)
            })
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            className="px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
            {isPending ? "Deleting..." : "Delete"}
        </button>
    )
}
