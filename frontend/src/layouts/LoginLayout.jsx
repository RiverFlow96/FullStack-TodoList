import { LoginInputs } from "../components/LoginInputs"


export default function LoginLayout() {
    return (
        <div className="min-w-max min-h-max flex justify-center items-center">
            <h1>Login</h1>
            <span>Your not have an account</span>
            <form>
                {/* Username - Input */}
                <LoginInputs label={"Username"} placeholder={"type your username"} type={"text"} />
                {/* Password - Input */}
                <LoginInputs label={"Password"} placeholder={"example1234"} type={"password"} />
                {/* Email - Input */}
                <LoginInputs label={"Email"} placeholder={"example@email.com"} type={"email"} />
            </form>
        </div>
    )
}
