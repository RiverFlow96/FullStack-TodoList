import { Link, useNavigate } from "react-router-dom";
import { useAuthStore, useTaskStore } from "../store/useStore";
import { LogOut, UserCircle2, ListTodo, Menu, X, ArrowUpDown, ArrowUp, ArrowDown, Filter, Search, CheckCircle, Circle } from "lucide-react";
import { useState } from "react";

export function NavbarLayout() {

    const { setSorterBy, setOrderBy, setFilterBy, order_by } = useTaskStore()
    const { isLoggedIn, logout } = useAuthStore()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    const onLogout = async () => {
        await logout()
        navigate("/auth/login")
    }

    return (
        <nav className="bg-violet-700 px-4 py-3 w-full fixed">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/home" className="font-bold font-sans text-xl md:text-3xl text-white flex items-center gap-2 hover:text-violet-200 transition-colors">
                    <ListTodo className="w-6 h-6" />
                    <span className="hidden sm:inline">TodoList</span>
                </Link>

                {/* Filters - Desktop */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Sort By */}
                    <div className="relative group">
                        <select
                            className="appearance-none bg-white/90 backdrop-blur-sm text-violet-700 pl-4 pr-10 py-2 rounded-xl border-2 border-white/30 font-semibold cursor-pointer hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-violet-400"
                            onChange={(e) => setSorterBy(e.target.value)}
                        >
                            <option value="created_at">Created</option>
                            <option value="updated_at">Updated</option>
                            <option value="title">Title</option>
                        </select>
                        <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 pointer-events-none" />
                    </div>

                    {/* Order By */}
                    <button
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/30 text-violet-700 hover:bg-white transition-all"
                        onClick={() => {
                            const currentOrder = useTaskStore.getState().order_by
                            setOrderBy(currentOrder === 'desc' ? 'asc' : 'desc')
                        }}
                    >
                        {order_by === "asc" ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                    </button>

                    {/* Filter By */}
                    <div className="relative group">
                        <select
                            className="appearance-none bg-white/90 backdrop-blur-sm text-violet-700 pl-4 pr-10 py-2 rounded-xl border-2 border-white/30 font-semibold cursor-pointer hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-violet-400"
                            onChange={(e) => setFilterBy(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="completed">Completed</option>
                            <option value="uncompleted">Pending</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 pointer-events-none" />
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="bg-white/90 backdrop-blur-sm text-violet-700 pl-10 pr-4 py-2 rounded-xl border-2 border-white/30 font-semibold placeholder-violet-400 hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-violet-400 w-48"
                            onChange={(e) => useTaskStore.getState().setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                    </div>
                </div>

                {/* Mobile Filter Button */}
                <button
                    className="md:hidden p-2 text-white"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    {showFilters ? <X className="w-6 h-6" /> : <Filter className="w-6 h-6" />}
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-white font-bold">
                    {!isLoggedIn ? (
                        <Link to="/auth/login" className="px-4 py-2 bg-white text-violet-700 rounded-lg hover:bg-violet-100 transition-colors">
                            Login
                        </Link>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/profile/" className="p-2 hover:bg-violet-600 rounded-lg transition-colors">
                                <UserCircle2 className="w-8 h-8" />
                            </Link>
                            <button onClick={onLogout} className="p-2 hover:bg-violet-600 rounded-lg transition-colors">
                                <LogOut className="w-8 h-8" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-white"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Mobile Filters Panel */}
                {showFilters && (
                    <div className="absolute top-16 left-0 right-0 bg-violet-600 p-4 md:hidden flex flex-col gap-3 shadow-lg z-50">
                        <select
                            className="w-full bg-white text-violet-700 px-4 py-3 rounded-xl font-semibold"
                            onChange={(e) => setSorterBy(e.target.value)}
                        >
                            <option value="created_at">Sort by: Created</option>
                            <option value="updated_at">Sort by: Updated</option>
                            <option value="title">Sort by: Title</option>
                        </select>
                        <button
                            className="w-full bg-white text-violet-700 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                            onClick={() => {
                                const currentOrder = useTaskStore.getState().order_by
                                setOrderBy(currentOrder === 'desc' ? 'asc' : 'desc')
                            }}
                        >
                            <ArrowUp className="w-5 h-5" />
                            Toggle Order
                        </button>
                        <select
                            className="w-full bg-white text-violet-700 px-4 py-3 rounded-xl font-semibold"
                            onChange={(e) => setFilterBy(e.target.value)}
                        >
                            <option value="all">Filter: All</option>
                            <option value="completed">Filter: Completed</option>
                            <option value="uncompleted">Filter: Pending</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="w-full bg-white text-violet-700 px-4 py-3 rounded-xl font-semibold placeholder-violet-400"
                            onChange={(e) => useTaskStore.getState().setSearchQuery(e.target.value)}
                        />
                    </div>
                )}

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="absolute top-16 left-0 right-0 bg-violet-700 p-4 md:hidden flex flex-col gap-4 shadow-lg">
                        {!isLoggedIn ? (
                            <Link
                                to="/auth/login"
                                className="block w-full px-4 py-2 bg-white text-violet-700 text-center rounded-lg"
                                onClick={() => setMenuOpen(false)}
                            >
                                Login
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="profile/"
                                    className="flex items-center gap-2 px-4 py-2 text-white hover:bg-violet-600 rounded-lg"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <UserCircle2 className="w-5 h-5" />
                                    Profile
                                </Link>
                                <button
                                    onClick={() => { onLogout(); setMenuOpen(false); }}
                                    className="flex items-center gap-2 px-4 py-2 text-white hover:bg-violet-600 rounded-lg"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}
