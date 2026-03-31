import { registerSchema } from '../utils/schema'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function LoginInputs({ type, placeholder, icon, type_register }) {
    const {
        register,
    } = useForm({
        resolver: zodResolver(registerSchema),
    })

    return (
        <div className="flex flex-row my-4 sm:my-5 min-w-full relative">
            {icon}
            <input {...register(`${type_register}`)} className="border-b-2 w-full pl-10 pr-4 py-2.5 text-sm sm:text-base outline-none focus:border-violet-600 transition-colors" type={type} placeholder={placeholder} />
        </div>
    )
}
