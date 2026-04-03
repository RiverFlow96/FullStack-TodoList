import { Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { TaskSchema } from "../utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTaskStore } from "../store/useStore";
import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

function EditTaskPage() {

    const { editTask, loading: storeLoading, tasks, fetchTasks, removeTask } = useTaskStore()
    const [loading, setLoading] = useState(false)
    const [taskData, setTaskData] = useState(null)
    const [loadingTask, setLoadingTask] = useState(true)

    const { id } = useParams()

    useEffect(() => {
        const loadTask = async () => {
            if (!tasks || tasks.length === 0) {
                await fetchTasks()
            }
            setLoadingTask(false)
        }
        loadTask()
    }, [])

    useEffect(() => {
        if (id && tasks.length > 0) {
            const task = tasks.find(t => t.id === parseInt(id))
            if (task) {
                setTaskData(task)
            } else {
                toast.error("Task not found")
            }
        }
    }, [id, tasks])

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(TaskSchema)
    })

    useEffect(() => {
        if (taskData) {
            reset({
                title: taskData.title,
                description: taskData.description || ""
            })
        }
    }, [taskData, reset])

    const navigate = useNavigate()

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await editTask({
                title: data.title,
                description: data.description,
                completed: taskData?.completed || false
            }, parseInt(id))
            toast.success("Task updated successfully!")
            navigate("/home")
        } catch (error) {
            console.error("Error:", error)
            toast.error("Error updating task")
        } finally {
            setLoading(false)
        }
    }

    if (loadingTask || !taskData) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center bg-violet-100">
                <Spinner />
            </div>
        )
    }

    const deleteTask = () => {
        const confirmDelete = window.confirm()
        if (confirmDelete) {
            removeTask(id)
            navigate("home/")
        }
    }
    return (
        <div className='w-full min-h-screen flex justify-center items-center bg-violet-100 p-4'>
            <div className='bg-white w-full max-w-lg rounded-3xl shadow-2xl'>
                <div className='w-full h-20 bg-linear-to-br from-violet-700 to-purple-700 rounded-t-3xl flex items-center justify-center'>
                    <h1 className='text-3xl text-white font-bold'>Edit Task</h1>
                </div>

                <div className='w-full p-8'>
                    <form onSubmit={handleSubmit(onSubmit)} className='w-full flex flex-col gap-5'>
                        <div className='flex flex-col w-full'>
                            <p className="font-bold text-xl mb-2">Title: </p>
                            <input
                                {...register("title")}
                                type="text"
                                className='border-2 w-full p-3 outline-0 rounded-lg focus:border-violet-700 transition-colors'
                                placeholder="Enter task title"
                            />
                            {errors.title && <span className="text-red-600 text-xs mt-1">{errors.title.message}</span>}
                        </div>
                        <div className='flex flex-col w-full'>
                            <p className="font-bold text-xl mb-2">Description: </p>
                            <textarea
                                {...register("description")}
                                className='h-40 border-2 w-full p-3 outline-0 rounded-lg focus:border-violet-700 transition-colors resize-none'
                                placeholder="Enter task description (optional)"
                            />
                            {errors.description && <span className="text-red-600 text-xs mt-1">{errors.description.message}</span>}
                        </div>
                        <div className='w-full flex items-center justify-center mt-4'>
                            <button
                                type="submit"
                                disabled={loading || storeLoading}
                                className='flex gap-2 items-center bg-violet-600 text-white font-bold py-3 px-10 rounded-lg w-max hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {loading || storeLoading ? <Spinner /> : (
                                    <>
                                        <span className="inline text-lg">Save</span>
                                        <Save className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                            <button
                                disabled={loading || storeLoading}
                                className='flex gap-2 items-center bg-violet-600 text-white font-bold py-3 px-10 rounded-lg w-max hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                onClick={() => deleTask}
                            >
                                {loading || storeLoading ? <Spinner /> : (
                                    <>
                                        <span className="inline text-lg">Save</span>
                                        <Save className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditTaskPage