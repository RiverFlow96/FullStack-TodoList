import { Outlet } from "react-router-dom"

function AuthPage({ layout }) {

    return (
        <div className="min-h-dvh w-full grid place-items-center font-mono bg-gray-100 px-4 py-6 sm:px-6">
            <div className="w-full max-w-md md:max-w-lg flex justify-center">
                <Outlet />
            </div>
        </div>
    )
}

export default AuthPage