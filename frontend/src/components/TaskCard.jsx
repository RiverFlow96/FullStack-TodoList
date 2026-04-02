import { Circle, CheckCircle2, Calendar } from "lucide-react";

function TaskCard({ title, description, completed, created_at, updated_at }) {
    return (
        <div className="bg-violet-700 w-[30dvw] h-60 flex justify-end rounded-2xl m-10">
            <div className="bg-purple-100 w-[29dvw] h-60 shadow-2xl p-3 rounded-2xl rounded-l-none flex flex-col">
                <div className="min-w-full h-auto flex justify-end">
                    <Circle className="text-violet-700 mx-4" />
                    <span className="">{completed ? "Completed" : "Uncompleted"}</span>
                </div>
                <div className="w-full h-[80%]">
                    <p className="font-bold font-sans text-3xl my-1 text-purple-950">{title}</p>
                    <p className="font-sans text-xl text-black/60">{description}</p>
                </div>
                <div className="flex gap-3">
                    <Calendar className="text-purple-950" />
                    <p>{created_at}</p>
                </div>
            </div>
        </div>
    )
}

export default TaskCard