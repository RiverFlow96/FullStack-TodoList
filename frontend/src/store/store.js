import { create } from "zustand";
import { createTask, fetchTasks, updateTask, deleteTask, logout } from "../api/axios";
import { login as apiLogin, logout as apiLogout, register as apiRegister } from "../api/axios";

export const useAuthStore = create((set) => ({
    user: null,
    isLoggedIn: !!localStorage.getItem("access_token"),
    token: localStorage.getItem("access_token"),
    error: null,
    login: async (username, password) => {
        try {
            const data = await apiLogin(username, password)
            set({
                user: { username },
                isLoggedIn: true,
                token: data.access,
                error: null
            })
        } catch (err) {
            set({
                user: null,
                isLoggedIn: false,
                token: null,
                error: `Usuario y contrasenias incorrectos ${err}`
            })
        }
    },
    logout: async () => {
        apiLogout()
        set({
            user: null,
            isLoggedIn: false,
            token: null,
            error: null
        })
    },
    register: async (username, password, email) => {
        try {
            const data = await apiRegister({ username, password, email })
            set({
                user: { username },
                isLoggedIn: true,
                token: data.tokens.access,
                error: null
            })
        } catch (err) {
            set({
                user: null,
                isLoggedIn: false,
                token: null,
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
        } catch (err) {
            set({ error: err.message, loading: false })
        }
    },

    editTask: async (id, updates) => {
        set({ loading: true, error: null })
        try {
            const updated = await updateTask(updates, id)
            set({
                tasks: get().tasks.map(t => t.id === id ? updated : t),
                loading: false
            })
        } catch (err) {
            set({ error: err.message, loading: false })
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