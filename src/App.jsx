import React, { useState, useEffect } from 'react'
import './App.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminStudents from './pages/AdminStudents'
import AdminWorkouts from './pages/AdminWorkouts'
import AdminQuestions from './pages/AdminQuestions'
import AdminSettings from './pages/AdminSettings'
import { api } from './services/api'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')

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

  function handleLogout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    setCurrentPage('dashboard')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #E91E63 0%, #7C4DFF 100%)' }}>
        <div style={{ color: 'white', fontSize: '24px' }}>Carregando...</div>
      </div>
    )
  }

  if (!token || !user) {
    return <Login onLoginSuccess={(newToken) => { setToken(newToken); localStorage.setItem('token', newToken) }} />
  }

  // Se for ADMIN
  if (user.role === 'ADMIN') {
    return (
      <div className="app">
        {currentPage === 'dashboard' && (
          <AdminDashboard user={user} token={token} setCurrentPage={setCurrentPage} />
        )}
        {currentPage === 'students' && (
          <AdminStudents user={user} token={token} />
        )}
        {currentPage === 'workouts' && (
          <AdminWorkouts user={user} token={token} />
        )}
        {currentPage === 'questions' && (
          <AdminQuestions user={user} token={token} />
        )}
        {currentPage === 'settings' && (
          <AdminSettings user={user} token={token} />
        )}
      </div>
    )
  }

  // Se for STUDENT
  if (user.status !== 'APPROVED') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #E91E63 0%, #7C4DFF 100%)', flexDirection: 'column' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: '#E91E63', margin: '0 0 16px 0' }}>⏳ Aguardando Aprovação</h2>
          <p style={{ color: '#666', margin: '0 0 20px 0' }}>Seu cadastro está sendo analisado por Bruna. Você receberá um email quando for aprovado!</p>
          <button onClick={handleLogout} style={{ background: '#E91E63', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Sair
          </button>
        </div>
      </div>
    )
  }

  return <Dashboard user={user} token={token} setToken={handleLogout} />
}