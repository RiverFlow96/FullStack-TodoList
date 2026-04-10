import { create } from "zustand";
import { createTask, fetchTasks, updateTask, deleteTask, fetchGroups, createGroup, updateGroup, deleteGroup, reorderGroups } from "../api/axios";
import { login as apiLogin, logout as apiLogout, register as apiRegister } from "../api/axios";

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
            const errorMessage = err?.message || "Usuario y contrasenia incorrectos"
            set({
                user: null,
                isLoggedIn: false,
                token: null,
                error: errorMessage
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
            return data
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
    groups: [],
    activeGroup: null,
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
    setActiveGroup: (groupId) => {
        localStorage.setItem('last_active_group', groupId)
        set(() => ({ activeGroup: groupId }))
    },

    fetchGroups: async () => {
        try {
            const groups = await fetchGroups() || []
            const lastActive = localStorage.getItem('last_active_group')
            const activeGroup = lastActive && groups.some(g => g.id.toString() === lastActive)
                ? parseInt(lastActive)
                : (groups.length > 0 ? groups[0].id : null)
            set({ groups, activeGroup })
        } catch (err) {
            console.error('Error fetching groups:', err)
            set({ groups: [], activeGroup: null })
        }
    },

    addGroup: async (groupData) => {
        try {
            const newGroup = await createGroup(groupData)
            set({ groups: [...get().groups, newGroup] })
            return newGroup
        } catch (err) {
            console.error('Error creating group:', err)
        }
    },

    editGroup: async (updates, groupId) => {
        try {
            const updated = await updateGroup(updates, groupId)
            set({ groups: get().groups.map(g => g.id === groupId ? updated : g) })
        } catch (err) {
            console.error('Error updating group:', err)
        }
    },

    removeGroup: async (groupId) => {
        try {
            await deleteGroup(groupId)
            const remaining = get().groups.filter(g => g.id !== groupId)
            const newActive = get().activeGroup === groupId
                ? (remaining.length > 0 ? remaining[0].id : null)
                : get().activeGroup
            set({ groups: remaining, activeGroup: newActive })
            if (get().activeGroup === null) {
                localStorage.removeItem('last_active_group')
            }
        } catch (err) {
            console.error('Error deleting group:', err)
        }
    },

    reorderGroups: async (groupIds) => {
        try {
            await reorderGroups(groupIds)
            const reordered = groupIds.map((id, idx) => {
                const group = get().groups.find(g => g.id === id)
                return group && { ...group, position: idx }
            })
            set({ groups: reordered })
        } catch (err) {
            console.error('Error reordering groups:', err)
        }
    },

    fetchTasks: async () => {
        set({ loading: true, error: null })
        try {
            const activeGroup = get().activeGroup
            let tasks
            if (activeGroup) {
                tasks = await fetchTasks()
                tasks = tasks.filter(t => t.group === activeGroup)
            } else {
                tasks = await fetchTasks()
            }
            set({ tasks, loading: false })
        } catch (err) {
            set({ error: err.message, loading: false })
        }
    },

    addTask: async (taskData) => {
        set({ loading: true, error: null })
        try {
            const groupId = get().activeGroup
            const newTask = await createTask(taskData, groupId)
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
