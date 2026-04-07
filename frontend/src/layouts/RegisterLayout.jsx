import { Link } from "react-router-dom"
import { User, Lock, Mail, Eye, EyeOff } from "lucide-react"
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from '../utils/schema'
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

export default function RegisterLayout() {

    const { registerUser, isLoggedIn } = useAuthStore()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/home", { replace: true })
        }
    }, [isLoggedIn, navigate])

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const userData = {
                username: data.username,
                password: data.password,
                email: data.email
            }
            const result = await registerUser(userData.username, userData.password, userData.email)
            toast.success(result?.detail || "Registro exitoso.")

            navigate("/auth/login", { replace: true })
        } catch {
            toast.error("Registration failed. Please try again.")
        } finally {
            setLoading(false)
        }
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
                    <input {...register("password")} className="border-b-2 w-full pl-10 pr-12 py-2.5 text-sm sm:text-base outline-none focus:border-violet-600 transition-colors" type={showPassword ? "text" : "password"} placeholder="password" />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-black/60 hover:text-black"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {errors.password && <span className="text-red-500 text-sm">{errors.password?.message}</span>}

                {/* Confirm Password - Input*/}
                <div className="flex flex-row my-4 sm:my-5 min-w-full relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-2/3 h-5 w-5 text-black/60" />
                    <input {...register("confirmPassword")} className="border-b-2 w-full pl-10 pr-12 py-2.5 text-sm sm:text-base outline-none focus:border-violet-600 transition-colors" type={showConfirmPassword ? "text" : "password"} placeholder="confirm password" />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-black/60 hover:text-black"
                        aria-label={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                    >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword?.message}</span>}

                {/* Email - Input */}
                <div className="flex flex-row my-4 sm:my-5 min-w-full relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-2/3 h-5 w-5 text-black/60" />
                    <input {...register("email")} className="border-b-2 w-full pl-10 pr-4 py-2.5 text-sm sm:text-base outline-none focus:border-violet-600 transition-colors" type="email" placeholder="example@email.com" />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="border-2 w-full mt-2 mb-3 rounded-lg h-10 sm:h-11 bg-violet-700 text-white font-bold hover:shadow-md hover:shadow-black hover:bg-violet-600 hover:text-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {loading ? <Spinner variant="light" size="sm" /> : "Register"}
                </button>
            </form>
        </div>
    )
}
