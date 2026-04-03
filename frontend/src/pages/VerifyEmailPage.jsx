import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle2, XCircle } from "lucide-react"
import Spinner from "../components/Spinner"
import { verifyEmail } from "../api/axios"

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams()
    const uid = useMemo(() => searchParams.get("uid") || "", [searchParams])
    const token = useMemo(() => searchParams.get("token") || "", [searchParams])

    const [loading, setLoading] = useState(true)
    const [success, setSuccess] = useState(false)
    const [message, setMessage] = useState("Verificando tu cuenta...")

    useEffect(() => {
        const runVerification = async () => {
            if (!uid || !token) {
                setSuccess(false)
                setMessage("Enlace inválido. Solicita un nuevo correo de verificación.")
                setLoading(false)
                return
            }

            try {
                const response = await verifyEmail(uid, token)
                setSuccess(true)
                setMessage(response?.detail || "Tu email fue verificado correctamente.")
            } catch (error) {
                setSuccess(false)
                setMessage(error.response?.data?.detail || "El enlace es inválido o expiró.")
            } finally {
                setLoading(false)
            }
        }

        runVerification()
    }, [uid, token])

    return (
        <div className="w-full min-h-screen bg-violet-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
                {loading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Spinner />
                        <p className="text-gray-600">{message}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        {success ? (
                            <CheckCircle2 className="w-14 h-14 text-green-600" />
                        ) : (
                            <XCircle className="w-14 h-14 text-red-600" />
                        )}
                        <h1 className="text-xl sm:text-2xl font-bold text-violet-800">Verificación de Email</h1>
                        <p className="text-gray-600">{message}</p>
                        <Link
                            to="/auth/login"
                            className="mt-2 inline-flex items-center justify-center bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-violet-800 transition-colors"
                        >
                            Ir a Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
