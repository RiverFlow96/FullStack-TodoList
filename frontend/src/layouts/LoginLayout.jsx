import { Link, useNavigate } from "react-router-dom"
import { User, Lock } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../utils/schema";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/useStore";
import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import { resendVerification } from "../api/axios";
import toast from "react-hot-toast";

export default function LoginLayout() {

    const navigate = useNavigate()
    const { login, isLoggedIn } = useAuthStore()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/home", { replace: true })
        }
    }, [isLoggedIn, navigate])

    const [lastUsername, setLastUsername] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(loginSchema)
    })

    const submit = async (data) => {
        setLoading(true)
        setLastUsername(data.username)
        const success = await login(data.username, data.password)
        setLoading(false)
        if (success) {
            navigate("/home", { replace: true })
        }
    }

    const handleResend = async () => {
        if (!lastUsername) {
            toast.error("Primero intenta iniciar sesión para identificar tu cuenta")
            return
        }

        try {
            await resendVerification(lastUsername)
            toast.success("Si tu cuenta no está verificada, enviamos un nuevo correo")
        } catch {
            toast.error("No se pudo reenviar el correo en este momento")
        }
    }

    return (
        <div className="w-full max-w-md md:max-w-lg bg-white p-4 sm:p-6 md:p-8 flex flex-col text-center rounded-2xl sm:rounded-3xl text-base sm:text-lg shadow-xl sm:shadow-2xl mx-auto">
            <h1 className="font-bold text-2xl sm:text-3xl w-full">LOGIN</h1>
            <span className="font-bold text-black/40 text-xs sm:text-sm">Your not have an account? {<Link to={'/auth/register'} className="text-blue-600">register</Link>}</span>
            <hr className="my-4 sm:my-5" />
            <form onSubmit={handleSubmit(submit)} className="w-full h-full px-1 sm:px-3 md:px-6">
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
                <button
                    type="submit"
                    disabled={loading}
                    className="border-2 w-full mt-2 mb-3 rounded-lg h-10 sm:h-11 bg-violet-700 text-white font-bold hover:shadow-md hover:shadow-black hover:bg-violet-600 hover:text-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {loading ? <Spinner color={"bg-violet-700"} /> : "Login"}
                </button>
                <button
                    type="button"
                    onClick={handleResend}
                    className="w-full text-sm text-violet-700 font-semibold hover:text-violet-900 transition-colors"
                >
                    Reenviar email de verificación
                </button>
            </form>
        </div>
    )
}
