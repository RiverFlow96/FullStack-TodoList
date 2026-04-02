import { useEffect } from "react";
import { useTaskStore } from "../store/useStore";
import TaskCard from "../components/TaskCard";

export function TaskLayout() {

    const { tasks, fetchTasks, loading, error } = useTaskStore()

    useEffect(() => {
        fetchTasks()
    }, [])

    console.log("Tasks:", tasks, "Loading:", loading, "Error:", error)

    if (loading) return <div>Cargando...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div>
            {tasks.length === 0 ? (
                <p>No hay tareas</p>
            ) : (
                tasks.map((task) => (
                    <TaskCard key={task.id} title={task.title} completed={task.completed} created_at={task.created_at} />
                ))
            )}
        </div>
    )
}
