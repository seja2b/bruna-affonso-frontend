import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'https://bruna-affonso-backend-production.up.railway.app/api'

let accessToken = localStorage.getItem('token') || null
if (accessToken) localStorage.removeItem('token')

const sessionHeaders = { 'X-Requested-With': 'XMLHttpRequest' }

const api = axios.create({
  baseURL,
  withCredentials: true
})

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: sessionHeaders
})

// Usado somente para transformar uma sessão antiga, já existente no navegador,
// em cookie HttpOnly. Não é usado após a migração.
const legacyRefreshClient = axios.create({
  baseURL,
  withCredentials: true
})

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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

  // O backend novo pode usar esta marca no payload durante o período de rollout.
  // Backends antigos simplesmente ignoram o campo.
  if (config.method?.toLowerCase() === 'post' && config.url?.startsWith('/auth/login')) {
    config.data = { ...(config.data || {}), clientVersion: 2 }
  }

  return config
})

let refreshPromise = null

async function requestRefresh() {
  const legacyRefreshToken = localStorage.getItem('refreshToken')

  try {
    return legacyRefreshToken
      ? await legacyRefreshClient.post('/auth/refresh', { refreshToken: legacyRefreshToken })
      : await refreshClient.post('/auth/refresh', {})
  } catch (error) {
    if (error.response?.status === 409 && error.response?.data?.retry) {
      // Outra aba pode ter acabado de rotacionar o cookie compartilhado. Aguarda a
      // resposta dela atualizar o cookie e tenta uma única vez com o modo seguro.
      await wait(250)
      return refreshClient.post('/auth/refresh', {})
    }
    throw error
  }
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestRefresh()
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

export async function revokeServerSession() {
  return api.post('/auth/logout', {}, { headers: sessionHeaders })
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
