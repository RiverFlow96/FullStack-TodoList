import { useEffect, useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "./Spinner";
import { suggestTaskWithAI } from "../api/axios";

function formatSuggestionForDescription(suggestion) {
    const lines = []
    if (suggestion.description) {
        lines.push(suggestion.description)
    }

    if (suggestion.subtasks?.length) {
        lines.push("", "Subtasks:")
        suggestion.subtasks.forEach((item) => {
            lines.push(`- ${item}`)
        })
    }

    if (suggestion.tags?.length) {
        lines.push("", `Tags: ${suggestion.tags.join(", ")}`)
    }

    lines.push("", `Priority: ${suggestion.priority}`)
    return lines.join("\n").trim()
}

function AIAssistantModal({ isOpen, onClose, existingTasks = [], onUseSuggestion }) {
    const [prompt, setPrompt] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [suggestion, setSuggestion] = useState(null)

    const existingTasksContext = useMemo(() => {
        return (existingTasks || []).slice(0, 20).map((task) => ({
            title: task.title,
            description: task.description || "",
            completed: Boolean(task.completed),
        }))
    }, [existingTasks])

    useEffect(() => {
        if (!isOpen) return

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const onGenerate = async () => {
        const trimmed = prompt.trim()
        if (!trimmed) {
            toast.error("Escribe un prompt para generar sugerencias")
            return
        }

        setLoading(true)
        setError("")
        try {
            const data = await suggestTaskWithAI({
                prompt: trimmed,
                context: {
                    existingTasks: existingTasksContext,
                },
            })
            setSuggestion(data)
        } catch (err) {
            const message = err?.message || "No se pudo generar la sugerencia"
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const onUse = () => {
        if (!suggestion) return
        onUseSuggestion?.({
            title: suggestion.title,
            description: formatSuggestionForDescription(suggestion),
            priority: suggestion.priority,
            subtasks: suggestion.subtasks,
            tags: suggestion.tags,
        })
        toast.success("Sugerencia aplicada")
        onClose()
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-assistant-title"
            onClick={onClose}
        >
            <div
                className="w-full sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                        </span>
                        <h2 id="ai-assistant-title" className="text-lg sm:text-xl font-bold text-gray-900">AI Task Assistant</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-600"
                        aria-label="Close AI assistant"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4">
                    <div>
                        <label htmlFor="ai-prompt" className="block text-sm font-semibold text-gray-700 mb-2">
                            Describe la tarea que quieres planificar
                        </label>
                        <textarea
                            id="ai-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ejemplo: Necesito preparar el lanzamiento del producto esta semana"
                            className="w-full min-h-32 border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-y"
                            maxLength={1000}
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={onGenerate}
                            disabled={loading}
                            aria-busy={loading}
                            className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                            {loading ? <Spinner variant="light" size="sm" /> : <Sparkles className="w-4 h-4" />}
                            Generar
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {suggestion && (
                        <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4 space-y-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-indigo-700 font-bold">Title</p>
                                <p className="text-gray-900 font-semibold">{suggestion.title}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-indigo-700 font-bold">Description</p>
                                <p className="text-gray-800 whitespace-pre-wrap">{suggestion.description || "No description"}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-white border border-indigo-200 text-indigo-700">
                                    Priority: {suggestion.priority}
                                </span>
                                {(suggestion.tags || []).map((tag) => (
                                    <span key={tag} className="text-xs font-semibold px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            {(suggestion.subtasks || []).length > 0 && (
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-indigo-700 font-bold mb-1">Subtasks</p>
                                    <ul className="list-disc pl-5 space-y-1 text-gray-800">
                                        {suggestion.subtasks.map((item, index) => (
                                            <li key={`${item}-${index}`}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="pt-1 flex justify-end">
                                <button
                                    type="button"
                                    onClick={onUse}
                                    className="px-4 py-2 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700"
                                >
                                    Usar sugerencia
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AIAssistantModal
