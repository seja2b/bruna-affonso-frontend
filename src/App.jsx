import React, { useState, useEffect } from 'react'
import './App.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { api } from './services/api'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  async function fetchUser() {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data)
    } catch (error) {
      setToken(null)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #E91E63 0%, #7C4DFF 100%)' }}>
        <div style={{ color: 'white', fontSize: '24px' }}>Carregando...</div>
      </div>
    )
  }

  return token && user ? (
    <Dashboard user={user} token={token} setToken={setToken} />
  ) : (
    <Login onLoginSuccess={(newToken) => { setToken(newToken); localStorage.setItem('token', newToken) }} />
  )
}