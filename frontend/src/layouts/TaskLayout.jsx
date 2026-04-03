import { useEffect } from "react";
import { useTaskStore } from "../store/useStore";
import TaskCard from "../components/TaskCard";
import Spinner from "../components/Spinner";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router-dom";

export function TaskLayout() {

    const { tasks, fetchTasks, loading, error, order_by, sort_by, filter_by, search_query } = useTaskStore()

    useEffect(() => {
        fetchTasks()
    }, [])

    // Filtrar y ordenar tareas
    const processTasks = (tasksToProcess) => {
        let result = [...tasksToProcess]

        // Aplicar filtro
        if (filter_by === 'completed') {
            result = result.filter(t => t.completed)
        } else if (filter_by === 'uncompleted') {
            result = result.filter(t => !t.completed)
        }

        // Aplicar búsqueda
        if (search_query) {
            const query = search_query.toLowerCase()
            result = result.filter(t =>
                t.title.toLowerCase().includes(query) ||
                (t.description && t.description.toLowerCase().includes(query))
            )
        }

        // Aplicar ordenamiento
        result.sort((a, b) => {
            let valueA, valueB

            switch (sort_by) {
                case 'created_at':
                    valueA = new Date(a.created_at).getTime()
                    valueB = new Date(b.created_at).getTime()
                    break
                case 'updated_at':
                    valueA = new Date(a.updated_at).getTime()
                    valueB = new Date(b.updated_at).getTime()
                    break
                case 'title':
                    valueA = a.title.toLowerCase()
                    valueB = b.title.toLowerCase()
                    break
                case 'completed':
                    valueA = a.completed ? 1 : 0
                    valueB = b.completed ? 1 : 0
                    break
                default:
                    return 0
            }

            if (order_by === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0
            }
        })

        return result
    }

    const processedTasks = processTasks(tasks)

    if (loading) return <div className="w-dvw h-dvh flex justify-center items-center"><Spinner></Spinner></div>
    if (error) return <div className="w-dvw h-dvh flex justify-center items-center text-3xl text-red-700 font-bold font-sans">Error: {error}</div>

    return (
        <div className="w-full min-h-screen p-4 bg-gray-100">
            {processedTasks.length === 0 ? (
                <div className="w-full h-[80dvh] flex justify-center items-center">
                    <p className="font-bold font-sans text-2xl md:text-4xl text-gray-400">No tasks found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {processedTasks.map((task) => (
                        <TaskCard key={task.id} title={task.title} description={task.description} completed={task.completed} created_at={task.created_at} id={task.id} />
                    ))}
                </div>
            )}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-violet-600 rounded-full shadow-lg hover:bg-violet-700 hover:scale-110 transition-transform flex items-center justify-center">
                <Link>{<PlusIcon className="w-6 h-6 text-white" />}</Link>
            </button>
        </div>
    )
}
