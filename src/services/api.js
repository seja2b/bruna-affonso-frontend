import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'https://bruna-affonso-backend-production.up.railway.app/api'

let accessToken = localStorage.getItem('token') || null
if (accessToken) localStorage.removeItem('token')

const sessionHeaders = { 'X-Requested-With': 'XMLHttpRequest' }

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: sessionHeaders
})

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: sessionHeaders
})

export function setAccessToken(token) {
  accessToken = token || null
  localStorage.removeItem('token')
}

export function getAccessToken() {
  return accessToken
}

export function hasLegacyRefreshToken() {
  return Boolean(localStorage.getItem('refreshToken'))
}

export function clearAccessToken() {
  accessToken = null
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

let refreshPromise = null

export async function refreshAccessToken() {
  if (!refreshPromise) {
    const legacyRefreshToken = localStorage.getItem('refreshToken')
    const payload = legacyRefreshToken ? { refreshToken: legacyRefreshToken } : {}

    refreshPromise = refreshClient.post('/auth/refresh', payload)
      .then(({ data }) => {
        setAccessToken(data.token)
        localStorage.removeItem('refreshToken')
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
    const isAuthRequest = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/logout'
    ].some((path) => originalRequest?.url?.startsWith(path))

    if (isUnauthorized && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true
      try {
        const newToken = await refreshAccessToken()
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        clearAccessToken()
        if (window.location.pathname !== '/login') window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  }
)

export default api
