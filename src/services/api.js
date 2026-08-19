import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'https://bruna-affonso-backend-production.up.railway.app/api'

const api = axios.create({ baseURL })
const refreshClient = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise = null

async function refreshAccessToken() {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) throw new Error('Refresh token ausente')

    refreshPromise = refreshClient.post('/auth/refresh', { refreshToken })
      .then(({ data }) => {
        localStorage.setItem('token', data.token)
        return data.token
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isUnauthorized = error.response?.status === 401
    const isAuthRequest = originalRequest?.url?.startsWith('/auth/login') || originalRequest?.url?.startsWith('/auth/register')

    if (isUnauthorized && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true
      try {
        const newToken = await refreshAccessToken()
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        if (window.location.pathname !== '/login') window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  }
)

export default api
