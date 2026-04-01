import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useStore";
import { LogOut, UserCircle2 } from "lucide-react";

export function NavbarLayout() {

    const { isLoggedIn, logout } = useAuthStore()

    const onLogout = async () => {
        await logout()
    }

    console.log(isLoggedIn)

    return (
        <div className="min-w-screen max-h-16 bg-violet-700 p-3 flex justify-center">
            <div className="w-full min-h-full">
                <h1 className="font-bold font-sans text-2xl text-white text-right">TodoList</h1>
            </div>
            <div className="w-full min-h-full flex items-center justify-end gap-8 text-white font-bold">
                {!isLoggedIn ?
                    < Link to="/auth/login" className="w-20 bg-white text-violet-700 text-center font-bold font-sans rounded-lg">Login</Link>
                    :
                    (
                        <>
                            <Link to="profile/">{<UserCircle2></UserCircle2>}</Link>
                            <LogOut onClick={onLogout} />
                        </>
                    )
                }
            </div>
        </div >
    )
}
