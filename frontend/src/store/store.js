import { create } from "zustand";
import { createTask, fetchTasks, updateTask } from "../api/axios";

export const useAuthStore = create((set) => ({
    user: null,
    isLoggedIn: false,
    token: null,
    login: (userData, token) => set({
        user: userData,
        isLoggedIn: true,
        token: token
    }),
    logout: () => set({
        user: null,
        isLoggedIn: false,
        token: null
    })
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
            const updated = await updateTask(updates, taskId)
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