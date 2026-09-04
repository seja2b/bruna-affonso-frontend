import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, {
  clearAccessToken,
  getAccessToken,
  hasLegacyRefreshToken,
  refreshAccessToken,
  revokeServerSession,
  setAccessToken
} from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const clearSession = useCallback(() => {
    clearAccessToken()
    setUser(null)
  }, [])

  const loadUser = useCallback(async () => {
    try {
      // Em reloads, o access token vive apenas em memória. O cookie HttpOnly renova
      // a sessão. Durante a transição, um refresh token legado é migrado uma única vez.
      if (!getAccessToken() || hasLegacyRefreshToken()) {
        await refreshAccessToken()
      }

      const { data } = await api.get('/auth/me')
      setUser(data)
    } catch (error) {
      clearSession()
    } finally {
      setLoading(false)
    }
  }, [clearSession])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const establishSession = useCallback(async ({ token, refreshToken, user: loginUser }) => {
    setAccessToken(token)

    // Compatibilidade temporária se o frontend novo conversar por alguns minutos
    // com o backend antigo durante o rollout. O próximo refresh migra e remove isso.
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)

    setUser(loginUser || null)

    try {
      const { data } = await api.get('/auth/me')
      setUser(data)
      return data
    } catch (error) {
      if (!loginUser) throw error
      return loginUser
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await revokeServerSession()
    } catch (error) {
      // A sessão local deve ser encerrada mesmo que a API esteja indisponível.
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    establishSession,
    logout,
    refreshUser: loadUser
  }), [user, loading, establishSession, logout, loadUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
