import { useParams } from "react-router-dom"
import LoginLayout from "../layouts/LoginLayout"

function LoginPage() {
    const { login, register } = useParams()

    return (
        <div className="w-full h-dvh flex justify-center items-center font-mono bg-gray-200">
            <LoginLayout />
        </div>
    )
}

export default LoginPage