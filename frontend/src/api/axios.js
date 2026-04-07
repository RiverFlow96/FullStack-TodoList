import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/"
const API_AUTH_URL = API_URL.replace(/\/api\/?$/, "/api-auth/")
const TOKEN_REFRESH_URL = API_URL.replace(/\/api\/?$/, "/api/token/refresh/")

console.log("API URL:", API_URL)

export const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
})

// Instancia sin autenticación para registro y login
export const publicApi = axios.create({
    baseURL: API_URL,
    timeout: 30000,
})

export const auth = axios.create({
    baseURL: API_AUTH_URL,
    timeout: 10000,
})

// Flag para controlar si ya se está refrescando el token
let isRefreshing = false;
let failedQueue = [];

// Procesar peticiones en cola
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })

    isRefreshing = false;
    failedQueue = [];
}

// Interceptor de REQUEST: añade el token a cada petición
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

// Interceptor de RESPONSE: maneja errores 401 y refresca el token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si el error es 401 y no es una petición de refresco
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Si ya estamos refrescando, añade a la cola
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return api(originalRequest)
                })
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token')

                if (!refreshToken) {
                    // Sin refresh token, hacer logout
                    logout()
                    processQueue(new Error('No refresh token'), null)
                    return Promise.reject(error)
                }

                // Refrescar el token
                const response = await axios.post(
                    TOKEN_REFRESH_URL,
                    { refresh: refreshToken },
                    { timeout: 10000 }
                )

                const { access } = response.data
                localStorage.setItem('access_token', access)

                // Actualizar header de la petición original
                originalRequest.headers.Authorization = `Bearer ${access}`

                // Procesar peticiones en cola
                processQueue(null, access)

                // Reintentar petición original
                return api(originalRequest)

            } catch (refreshError) {
                // Error refrescando token
                logout()
                processQueue(refreshError, null)
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export const fetchTasks = async () => {
    try {
        const response = await api.get('tasks/')
        return response.data
    } catch (error) {
        console.error('Error fetching tasks: ', error)
    }
}

export const fetchTask = async (id) => {
    try {
        const response = await api.get(`tasks/${id}/`)
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
        const response = await api.patch(`tasks/${taskId}/`, {
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
        await api.delete(`tasks/${taskId}/`)
        return true
    } catch (error) {
        console.error('Error deleting task: ', error)
        throw error
    }
}

export const suggestTaskWithAI = async ({ prompt, context }) => {
    try {
        const response = await api.post("ai/suggest-task/", {
            prompt,
            context,
        })
        return response.data
    } catch (error) {
        const detail = error?.response?.data?.detail
        throw new Error(detail || "No se pudo generar la sugerencia con IA")
    }
}

export const register = async (userData) => {
    try {
        // Usar publicApi para el registro (sin requerir autenticación)
        const response = await publicApi.post('users/', {
            username: userData.username,
            email: userData.email,
            password: userData.password
        })

        return {
            user: response.data.user,
            detail: response.data.detail,
        }
    } catch (error) {
        toast.error(error.response?.data?.detail || "Error registering user")
        throw error
    }
}

//TODO Guardar username en storage para mostrar usuario en profile
export const login = async (username, password) => {
    try {
        console.log("Attempting login to:", API_URL + "token/")
        const response = await publicApi.post('token/', { username, password })
        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access)
            localStorage.setItem('refresh_token', response.data.refresh)
        }
        const userResponse = await api.get('users/me/')
        if (userResponse.data) {
            localStorage.setItem('username', userResponse.data.username)
            localStorage.setItem('email', userResponse.data.email)
        }
        console.log("Login successful")
        return true
    } catch (error) {
        console.error('Error login: ', error)
        throw error
    }
}

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username')
    localStorage.removeItem('email')
    // Opcionalmente: redirigir a login o limpiar estado global
};
