import { ArrowLeft, Save } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { TaskSchema } from "../utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTaskStore } from "../store/useStore";
import { useState } from "react";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

function AddTaskPage() {

    const { addTask, loading: storeLoading } = useTaskStore()
    const [loading, setLoading] = useState(false)
    const location = useLocation()
    const initialSuggestion = location.state?.aiSuggestion
    const [aiMeta] = useState(
        initialSuggestion
            ? {
                priority: initialSuggestion.priority || "medium",
                tags: initialSuggestion.tags || [],
            }
            : null
    )

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            title: initialSuggestion?.title || "",
            description: initialSuggestion?.description || "",
        },
        resolver: zodResolver(TaskSchema)
    })

    const navigate = useNavigate()

    const onSubmit = async (data) => {
        console.log("Submit triggered with data:", data)
        setLoading(true)
        try {
            const success = await addTask({ title: data.title, description: data.description, completed: false })
            console.log("Success:", success)
            setLoading(false)
            if (success) {
                toast.success("Task created successfully!")
                reset()
                navigate("/home")
            } else {
                console.error("Failed to create task")
            }
        } catch (error) {
            console.error("Error:", error)
            setLoading(false)
            console.error("Error creating task")
        }
    }

    return (
        <div className='w-full min-h-screen flex justify-center items-center bg-violet-100 p-4'>
            <div className='bg-white w-full max-w-lg rounded-3xl shadow-2xl'>
                <div className='w-full h-20 bg-linear-to-br from-violet-700 to-purple-700 rounded-t-3xl flex items-center justify-center relative px-4'>
                    <button
                        type="button"
                        onClick={() => navigate("/home")}
                        className="absolute left-4 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 text-white hover:bg-white/25 transition-colors"
                        aria-label="Go home"
                        title="Go home"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className='text-3xl text-white font-bold'>Add Task</h1>
                </div>

                <div className='w-full p-8'>
                    {aiMeta && (
                        <div className="mb-4 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                            <p className="text-sm font-semibold text-indigo-700">Sugerencia IA aplicada</p>
                            <p className="text-xs text-indigo-600 mt-1">Priority: {aiMeta.priority}</p>
                            {aiMeta.tags.length > 0 && (
                                <p className="text-xs text-indigo-600 mt-1">Tags: {aiMeta.tags.join(", ")}</p>
                            )}
                        </div>
                    )}
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
                                {loading || storeLoading ? <Spinner variant="light" size="sm" /> : (
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

export default AddTaskPage
