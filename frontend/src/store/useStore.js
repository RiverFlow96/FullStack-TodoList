import { create } from "zustand";
import { createTask, fetchTasks, updateTask, deleteTask, logout } from "../api/axios";
import { login as apiLogin, logout as apiLogout, register as apiRegister } from "../api/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    user: null,
    email: null,
    isLoggedIn: !!localStorage.getItem("access_token"),
    token: localStorage.getItem("access_token"),
    error: null,
    login: async (username, password) => {
        try {
            const data = await apiLogin(username, password)
            const userData = { username }
            set({
                user: userData,
                isLoggedIn: true,
                token: data.access,
                error: null
            })
            return true
        } catch (err) {
            set({
                user: null,
                isLoggedIn: false,
                token: null,
                error: `Usuario y contrasenias incorrectos ${err}`
            })
            return false
        }
    },
    logout: () => {
        apiLogout()
        localStorage.removeItem("user")
        set({
            user: null,
            isLoggedIn: false,
            token: null,
            error: null
        })
    },
    registerUser: async (username, password, email) => {
        try {
            const data = await apiRegister({ username, password, email })
            set({
                error: null
            })
        } catch (err) {
            set({
                error: `Error al registrarse: ${err.message}`
            })
            throw err
        }
    }
}))

export const useTaskStore = create((set, get) => ({
    tasks: [],
    loading: false,
    error: null,
    sort_by: "created_at",
    order_by: "desc",
    filter_by: "all",
    search_query: "",

    setSorterBy: (value) => set(() => ({ sort_by: value })),
    setOrderBy: (value) => set(() => ({ order_by: value })),
    setFilterBy: (value) => set(() => ({ filter_by: value })),
    setSearchQuery: (value) => set(() => ({ search_query: value })),

    fetchTasks: async () => {
        set({ loading: true, error: null })
        try {
            const tasks = await fetchTasks()
            set({ tasks, loading: false })
        } catch (err) {
            set({ error: err.message, loading: false })
        }
    },

    addTask: async (taskData) => {
        set({ loading: true, error: null })
        try {
            const newTask = await createTask(taskData)
            set({ tasks: [newTask, ...get().tasks], loading: false })
            return true
        } catch (err) {
            set({ error: err.message, loading: false })
            return false
        }
    },

    editTask: async (updates, id) => {
        try {
            const updated = await updateTask(updates, id)
            set({ tasks: get().tasks.map(t => t.id === id ? updated : t) })
            console.log("Created task")
        } catch (err) {
            console.error("Error updating task:", err)
        }
    },

    removeTask: async (id) => {
        set({ loading: true, error: null })
        try {
            await deleteTask(id)
            set({
                tasks: get().tasks.filter(t => t.id !== id),
                loading: false
            })
        } catch (err) {
            set({ error: err.message, loading: false })
        }
    }
}))