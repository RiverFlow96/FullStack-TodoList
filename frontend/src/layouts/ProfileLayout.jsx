import { UserCircle2, Mail, CheckCircle, Circle, Clock, ListChecks } from "lucide-react"
import { useTaskStore } from "../store/useStore"
import { useEffect } from "react"
import Spinner from "../components/Spinner"

function ProfileLayout() {
    const tasks = useTaskStore((state) => state.tasks)
    const fetchTasks = useTaskStore((state) => state.fetchTasks)
    const loading = useTaskStore((state) => state.loading)

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const completedTasks = tasks.filter(t => t.completed).length
    const pendingTasks = tasks.filter(t => !t.completed).length
    const lastTask = tasks.length > 0 ? tasks[0] : null

    if (loading && tasks.length === 0) {
        return (
            <div className="w-full min-h-screen bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-violet-100 to-purple-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Profile Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header with gradient */}
                    <div className="bg-linear-to-r from-violet-600 to-purple-600 h-40 relative">
                        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                            <div className="bg-white rounded-full p-2 shadow-xl">
                                <UserCircle2 size={110} strokeWidth={1} className="text-violet-600" />
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="pt-24 pb-8 px-8">
                        <h2 className="text-3xl font-bold text-gray-800 text-center">
                            {localStorage.getItem("username") || "User"}
                        </h2>
                        <p className="text-gray-500 text-center flex items-center justify-center gap-2 mt-2">
                            <Mail className="w-5 h-5" />
                            <span>{localStorage.getItem("email") || "No email"}</span>
                        </p>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">Statistics</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Total Tasks */}
                            <div className="bg-violet-50 rounded-2xl p-5 flex flex-col items-center">
                                <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mb-3">
                                    <ListChecks className="w-7 h-7 text-violet-600" />
                                </div>
                                <span className="text-4xl font-bold text-violet-600">{tasks.length}</span>
                                <span className="text-sm text-gray-500 mt-1">Total Tasks</span>
                            </div>

                            {/* Completed */}
                            <div className="bg-green-50 rounded-2xl p-5 flex flex-col items-center">
                                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle className="w-7 h-7 text-green-600" />
                                </div>
                                <span className="text-4xl font-bold text-green-600">{completedTasks}</span>
                                <span className="text-sm text-gray-500 mt-1">Completed</span>
                            </div>

                            {/* Pending */}
                            <div className="bg-orange-50 rounded-2xl p-5 flex flex-col items-center">
                                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                                    <Circle className="w-7 h-7 text-orange-500" />
                                </div>
                                <span className="text-4xl font-bold text-orange-500">{pendingTasks}</span>
                                <span className="text-sm text-gray-500 mt-1">Pending</span>
                            </div>

                            {/* Last Added */}
                            <div className="bg-blue-50 rounded-2xl p-5 flex flex-col items-center">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                    <Clock className="w-7 h-7 text-blue-600" />
                                </div>
                                <span className="text-xl font-bold text-blue-600">
                                    {lastTask?.created_at ? new Date(lastTask.created_at).toLocaleDateString() : "-"}
                                </span>
                                <span className="text-sm text-gray-500 mt-1">Last Added</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {tasks.length > 0 && (
                            <div className="mt-8">
                                <div className="flex justify-between text-base text-gray-600 mb-3">
                                    <span className="font-medium">Progress</span>
                                    <span className="font-bold text-violet-600">{Math.round((completedTasks / tasks.length) * 100)}%</span>
                                </div>
                                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${(completedTasks / tasks.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileLayout
