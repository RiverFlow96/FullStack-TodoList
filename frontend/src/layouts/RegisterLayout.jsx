import { Link } from "react-router-dom"
import { LoginInputs } from "../components/LoginInputs"
import { User, Lock, Mail } from "lucide-react"
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from '../utils/schema'

export default function RegisterLayout() {

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = (data) => {
        toast.success("User Registered")
        console.log(data)
    }

    return (
        <div className="w-full max-w-md md:max-w-lg bg-white p-4 sm:p-6 md:p-8 flex flex-col text-center rounded-2xl sm:rounded-3xl text-base sm:text-lg shadow-xl sm:shadow-2xl mx-auto">
            <h1 className="font-bold text-2xl sm:text-3xl w-full">Register</h1>
            <span className="font-bold text-black/40 text-xs sm:text-sm">Your have an account? {<Link to={'/auth/login'} className="text-blue-600">login</Link>}</span>
            <hr className="my-4 sm:my-5" />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full h-full px-1 sm:px-3 md:px-6">
                {/* Username - Input */}
                <div className="flex flex-row my-4 sm:my-5 min-w-full relative">
                    <User className="absolute left-3 top-1/2 -translate-y-2/3 h-5 w-5 text-black/60" />
                    <input {...register("username")} className="border-b-2 w-full pl-10 pr-4 py-2.5 text-sm sm:text-base outline-none focus:border-violet-600 transition-colors" type="text" placeholder="username" />
                </div>
                {errors.username && <span className="text-red-500 text-sm">{errors.username?.message}</span>}

                {/* Password - Input */}
                <div className="flex flex-row my-4 sm:my-5 min-w-full relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-2/3 h-5 w-5 text-black/60" />
                    <input {...register("password")} className="border-b-2 w-full pl-10 pr-4 py-2.5 text-sm sm:text-base outline-none focus:border-violet-600 transition-colors" type="password" placeholder="password" />
                </div>
                {errors.password && <span className="text-red-500 text-sm">{errors.password?.message}</span>}

                {/* Confirm Password - Input*/}
                <div className="flex flex-row my-4 sm:my-5 min-w-full relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-2/3 h-5 w-5 text-black/60" />
                    <input {...register("confirmPassword")} className="border-b-2 w-full pl-10 pr-4 py-2.5 text-sm sm:text-base outline-none focus:border-violet-600 transition-colors" type="password" placeholder="confirm password" />
                </div>
                {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword?.message}</span>}

                {/* Email - Input */}
                <div className="flex flex-row my-4 sm:my-5 min-w-full relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-2/3 h-5 w-5 text-black/60" />
                    <input {...register("email")} className="border-b-2 w-full pl-10 pr-4 py-2.5 text-sm sm:text-base outline-none focus:border-violet-600 transition-colors" type="email" placeholder="example@email.com" />
                </div>
                <button type="submit" className="border-2 w-full mt-2 mb-3 rounded-lg h-10 sm:h-11 bg-violet-700 text-white font-bold hover:shadow-md hover:shadow-black hover:bg-violet-600 hover:text-white/80 transition-colors">Register</button>
                <button className="border-2 w-full mb-2 rounded-lg h-10 sm:h-11 text-black font-bold hover:shadow-md hover:shadow-black hover:bg-gray-200 hover:text-black/80 transition-colors">Google</button>
            </form>
        </div>
    )
}