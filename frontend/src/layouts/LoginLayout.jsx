import { Link } from "react-router-dom"
import { LoginInputs } from "../components/LoginInputs"
import { User, Lock, Mail } from "lucide-react"

export default function LoginLayout() {
    return (
        <div className="w-[25dvw] h-[60dvh] bg-white p-3 flex flex-col text-center rounded-3xl text-[1.2rem] shadow-2xl">
            <h1 className="font-bold text-3xl w-full">LOGIN</h1>
            <span className="font-bold text-black/40 text-sm">Your not have an account? {<Link className="text-blue-600">register</Link>}</span>
            <hr className="my-5" />
            <form className="w-full h-full px-20">
                {/* Username - Input */}
                <LoginInputs placeholder={`username`} type={"text"} icon={<User className="absolute left-3 top-1/2 -translate-y-2/3 h-5 w-5 text-black/60" />} />
                {/* Password - Input */}
                <LoginInputs placeholder={"password"} type={"password"} icon={<Mail className="absolute left-3 top-1/2 -translate-y-2/3 h-5 w-5 text-black/60" />} />
                {/* Email - Input */}
                <LoginInputs placeholder={"example@email.com"} type={"email"} icon={<Lock className="absolute left-3 top-1/2 -translate-y-2/3 h-5 w-5 text-black/60" />} />
                <button className="border-2 w-full my-3 rounded-lg h-9 bg-violet-700 text-white font-bold hover:shadow-md hover:shadow-black hover:bg-violet-600 hover:text-white/80">Login</button>
                <button className="border-2 w-full my-3 rounded-lg h-9 white text-black font-bold hover:shadow-md hover:shadow-black hover:bg-gray-200 hover:text-black/80">Google</button>
            </form>
        </div>
    )
}
