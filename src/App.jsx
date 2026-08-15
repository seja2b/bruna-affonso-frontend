import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchUserData()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://bruna-affonso-backend-production.up.railway.app/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Não autorizado')

      const userData = await response.json()
      setUser(userData)
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  if (loading) {
    return <div className="app-loading">Carregando...</div>
  }

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  if (user.role === 'STUDENT') {
    return <StudentDashboard user={user} token={token} onLogout={handleLogout} />
  }

  if (user.role === 'ADMIN') {
    return <AdminDashboard user={user} token={token} onLogout={handleLogout} />
  }

  return <Login onLoginSuccess={handleLoginSuccess} />
}

export default App