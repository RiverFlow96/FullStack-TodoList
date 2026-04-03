import { CheckCircle2, Calendar, Trash2 } from "lucide-react";
import { useTaskStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function TaskCard({ title, description, completed, created_at, updated_at, id }) {

    const { editTask, removeTask } = useTaskStore()
    const navigate = useNavigate()

    const navigateToTask = () => {
        navigate(`/home/edit/${id}`)
    }

    const onDeleteTask = async (event) => {
        event.stopPropagation()
        const confirmDelete = window.confirm("Are you sure you want to delete this task?")
        if (!confirmDelete) return

        await removeTask(id)
        toast.success("Task deleted")
    }

    return (
        <div className="bg-violet-700 rounded-2xl pl-4 flex justify-end min-h-50 cursor-pointer" onClick={navigateToTask}>
            <div className="bg-purple-100 shadow-2xl p-3 rounded-2xl rounded-l-none flex flex-col w-full">
                <div className="flex items-center justify-between mb-3">
                    <button
                        type="button"
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${completed ? 'bg-violet-600 border-violet-600' : 'border-purple-300 hover:border-violet-400'}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            editTask({ completed: !completed }, id)
                        }}
                    >
                        {completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                    <span className={`text-sm font-semibold ${completed ? 'text-green-600' : 'text-orange-500'}`}>
                        {completed ? "Completed" : "Uncompleted"}
                    </span>
                </div>
                <div className="grow">
                    <p className="font-bold font-sans text-xl md:text-2xl my-1 text-purple-950 line-clamp-2">{title}</p>
                    <p className="font-sans text-base text-black/60 line-clamp-2">{description || "No description"}</p>
                </div>
                <div className="flex items-center justify-between gap-2 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="w-4 h-4 text-purple-950" />
                        <p className="truncate">{created_at ? new Date(created_at).toLocaleDateString() : "No date"}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onDeleteTask}
                        className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        aria-label="Delete task"
                        title="Delete task"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TaskCard