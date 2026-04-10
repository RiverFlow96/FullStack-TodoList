import { useState } from "react"
import { useTaskStore } from "../store/useStore"
import { PlusIcon, PencilIcon, CheckIcon, X } from "lucide-react"

function getTextColor(bgColor) {
    if (!bgColor) return "text-white"
    const hex = bgColor.replace("#", "")
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? "text-gray-900" : "text-white"
}

function isDarkColor(bgColor) {
    if (!bgColor) return false
    const hex = bgColor.replace("#", "")
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance <= 0.5
}

export default function TaskGroupTabs() {
    const { groups, activeGroup, setActiveGroup, addGroup, editGroup, removeGroup, fetchTasks } = useTaskStore()
    const [isCreating, setIsCreating] = useState(false)
    const [newGroupName, setNewGroupName] = useState("")
    const [newGroupColor, setNewGroupColor] = useState("#6366f1")
    const [editingId, setEditingId] = useState(null)
    const [editName, setEditName] = useState("")
    const [editColor, setEditColor] = useState("")

    const colors = [
        "#6366f1", "#ef4444", "#f97316", "#eab308", "#22c55e",
        "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"
    ]

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return
        await addGroup({ name: newGroupName, color: newGroupColor })
        setNewGroupName("")
        setNewGroupColor("#6366f1")
        setIsCreating(false)
    }

    const handleSelectGroup = async (groupId) => {
        setActiveGroup(groupId)
        await fetchTasks()
    }

    const handleEditStart = (group) => {
        setEditingId(group.id)
        setEditName(group.name)
        setEditColor(group.color || "#6366f1")
    }

    const handleEditSave = async () => {
        if (!editName.trim() || !editingId) return
        await editGroup({ name: editName, color: editColor }, editingId)
        setEditingId(null)
    }

    const handleDeleteGroup = async (groupId) => {
        if (window.confirm("¿Eliminar este grupo? Las tareas se moverán a sin grupo.")) {
            await removeGroup(groupId)
            await fetchTasks()
        }
    }

    const handleAllTasks = async () => {
        setActiveGroup(null)
        localStorage.removeItem('last_active_group')
        await fetchTasks()
    }

    if (groups.length === 0 && !isCreating) {
        return (
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    NuevoGrupo
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-1 mb-4 flex-wrap">
            <button
                onClick={handleAllTasks}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeGroup === null
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
            >
                Todas
            </button>

            {groups.map((group) => (
                <div key={group.id} className="relative group">
                    {editingId === group.id ? (
                        <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 rounded-lg">
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                autoFocus
                            />
                            <div className="flex gap-0.5">
                                {colors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setEditColor(c)}
                                        className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${editColor === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={handleEditSave}
                                className="p-1 bg-green-500 rounded hover:bg-green-600 transition-colors"
                            >
                                <CheckIcon className="w-4 h-4 text-white" />
                            </button>
                            <button
                                onClick={() => setEditingId(null)}
                                className="p-1 bg-gray-400 rounded hover:bg-gray-500 transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleSelectGroup(group.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeGroup === group.id
                                ? isDarkColor(group.color) ? "text-white" : "text-gray-900"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            style={activeGroup === group.id && group.color
                                ? { backgroundColor: group.color }
                                : group.color
                                    ? { borderLeft: `3px solid ${group.color}` }
                                    : undefined
                            }
                        >
                            <span className={activeGroup === group.id && group.color ? getTextColor(group.color) : ""}>{group.name}</span>
                            <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEditStart(group) }}
                                    className="p-1 rounded hover:bg-white/30 transition-colors"
                                    style={activeGroup === group.id && group.color ? { color: 'inherit' } : undefined}
                                >
                                    <PencilIcon className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id) }}
                                    className="p-1 rounded hover:bg-red-500 transition-colors hover:text-white"
                                    style={activeGroup === group.id && group.color ? { color: 'inherit' } : undefined}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </button>
                    )}
                </div>
            ))}

            {isCreating ? (
                <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 rounded-lg">
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Nombre"
                        className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                    />
                    <div className="flex gap-0.5">
                        {colors.map((c) => (
                            <button
                                key={c}
                                onClick={() => setNewGroupColor(c)}
                                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${newGroupColor === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleCreateGroup}
                        className="p-1 bg-green-500 rounded hover:bg-green-600 transition-colors"
                    >
                        <CheckIcon className="w-4 h-4 text-white" />
                    </button>
                    <button
                        onClick={() => setIsCreating(false)}
                        className="p-1 bg-gray-400 rounded hover:bg-gray-500 transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-1 px-2 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}
