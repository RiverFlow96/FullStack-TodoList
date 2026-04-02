import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useStore";
import { LogOut, UserCircle2, ListTodo } from "lucide-react";

export function NavbarLayout() {

    const { isLoggedIn, logout } = useAuthStore()
    const navigate = useNavigate()

    const onLogout = async () => {
        await logout()
    }

    return (
        <div>
            <div className="min-w-screen max-h-16 bg-violet-700 p-3 flex justify-center">
                <div className="w-full min-h-full flex items-center">
                    <h1 className="font-bold font-sans text-2xl text-white flex items-center gap-2">
                        <ListTodo className="w-6 h-6" />
                        TodoList
                    </h1>
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

                <div>

                </div>

            </div >
        </div>
    )
}
