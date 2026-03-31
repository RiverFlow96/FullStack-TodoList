import { useState, useEffect } from "react"
import { useAuthStore } from "../store/store"   // tu slice de auth
import { useTaskStore } from "../store/store"   // tu slice de tareas

export function LoginForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const { login, isLoggedIn, error } = useAuthStore()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await login(username, password) // Asume que tu action auth login recibe (username, password)
    }

    if (isLoggedIn) return null

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="usuario"
                value={username}
                onChange={e => setUsername(e.target.value)}
            />
            <input
                placeholder="contraseña"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button type="submit">Entrar</button>
            {error && <div>{error}</div>}
        </form>
    )
}

export function RegisterForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const { register, error, isLoggedIn } = useAuthStore()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await register(username, password, email)
            console.log(`Registered successfully`)
        } catch (err) {
            console.error(`Registration failed:`, err)
        }
    }

    // No mostrar si ya está logueado
    if (isLoggedIn) return null

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="usuario"
                value={username}
                onChange={e => setUsername(e.target.value)}
            />
            <input
                placeholder="contraseña"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <input
                placeholder="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <button type="submit">Register</button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
    )
}

export function TaskList() {
    const { tasks, fetchTasks, loading, error } = useTaskStore()
    const { isLoggedIn, logout } = useAuthStore()

    useEffect(() => {
        if (isLoggedIn) {
            fetchTasks()
        }
    }, [isLoggedIn, fetchTasks])

    if (!isLoggedIn) return null

    if (loading) return <div>Cargando tareas...</div>
    if (error) return <div>Error: {error}</div>
    if (!tasks.length) return <div>No hay tareas</div>

    if (!isLoggedIn) return null

    return (
        <div>
            <ul>
                {tasks.map(t => (
                    <li key={t.id}>
                        <b>{t.title}</b> {t.completed ? "✅" : "❌"}
                    </li>
                ))}
            </ul>
            <button onClick={logout}>Logout</button>
        </div>
    )
}