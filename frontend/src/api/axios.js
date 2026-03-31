import axios from "axios";

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

export const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
    timeout: 10000,
})

export const fetchTasks = async () => {
    try {
        const response = await api.get('tasks/')
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error('Error fetching tasks: ', error)
    }
}

export const createTask = async (taskData) => {
    try {
        const response = await api.post('tasks/', {
            title: taskData.title,
            description: taskData.description,
            completed: false
        })
        return response.data
    } catch (error) {
        console.error("Error creating tasks: ", error)
    }
}

export const updateTask = async (taskData, taskId) => {
    try {
        const response = await api.put(`tasks/${taskId}`, {
            title: taskData.title,
            description: taskData.description,
            completed: taskData.completed
        })
        return response.data
    } catch (error) {
        console.error("Error updating task: ", error)
    }
}

export const deleteTask = async (taskId) => {
    try {
        await api.delete(`tasks/${taskId}`)
        return true
    } catch (error) {
        console.error('Error deleting task: ', error)
        throw error
    }
}

export const register = async (userData) => {
    try {
        const response = await api.post('users/', {
            username: userData.username,
            email: userData.email,
            password: userData.password
        })
        return response.data
    } catch (error) {
        console.error("Error registering user: ", error)
        throw error
    }
}

export const login = async (username, password) => {
    try {
        const response = await api.post('token/', { username, password })
        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access)
            localStorage.setItem('refresh_token', response.data.refresh)
        }
        return response.data
    } catch (error) {
        console.error('Error login: ', error)
        throw error
    }
}

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

