import { Link } from "react-router-dom"
import { LoginInputs } from "../components/LoginInputs"
import { User, Lock, Mail } from "lucide-react"

export default function RegisterLayout() {
    return (
        <div className="w-full max-w-md md:max-w-lg bg-white p-4 sm:p-6 md:p-8 flex flex-col text-center rounded-2xl sm:rounded-3xl text-base sm:text-lg shadow-xl sm:shadow-2xl mx-auto">
            <h1 className="font-bold text-2xl sm:text-3xl w-full">Register</h1>
            <span className="font-bold text-black/40 text-xs sm:text-sm">Your have an account? {<Link to={'/auth/login'} className="text-blue-600">login</Link>}</span>
            <hr className="my-4 sm:my-5" />
            <form className="w-full h-full px-1 sm:px-3 md:px-6">
                {/* Username - Input */}
                <LoginInputs placeholder={`username`} type={"text"} icon={<User className="absolute left-3 top-1/2 -translate-y-2/3 h-5 w-5 text-black/60" />} />
                {/* Password - Input */}
                <LoginInputs placeholder={"password"} type={"password"} icon={<Lock className="absolute left-3 top-1/2 -translate-y-2/3 h-5 w-5 text-black/60" />} />
                <LoginInputs placeholder={"password"} type={"password"} icon={<Lock className="absolute left-3 top-1/2 -translate-y-2/3 h-5 w-5 text-black/60" />} />
                {/* Email - Input */}
                <LoginInputs placeholder={"example@email.com"} type={"email"} icon={<Mail className="absolute left-3 top-1/2 -translate-y-2/3 h-5 w-5 text-black/60" />} />
                <button type="submit" className="border-2 w-full mt-2 mb-3 rounded-lg h-10 sm:h-11 bg-violet-700 text-white font-bold hover:shadow-md hover:shadow-black hover:bg-violet-600 hover:text-white/80 transition-colors">Register</button>
                <button className="border-2 w-full mb-2 rounded-lg h-10 sm:h-11 text-black font-bold hover:shadow-md hover:shadow-black hover:bg-gray-200 hover:text-black/80 transition-colors">Google</button>
            </form>
        </div>
    )
}