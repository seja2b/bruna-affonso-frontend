import React, { useState, useEffect } from 'react'
import './App.css'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AdminStudents from './pages/AdminStudents'
import AdminWorkouts from './pages/AdminWorkouts'
import AdminQuestions from './pages/AdminQuestions'
import AdminSettings from './pages/AdminSettings'
import StudentDashboard from './pages/StudentDashboard'
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

  function handleNavigate(page) {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    )
  }

  if (!token || !user) {
    return <Login onLoginSuccess={(newToken) => { setToken(newToken); localStorage.setItem('token', newToken) }} />
  }

  // ADMIN
  if (user.role === 'ADMIN') {
    return (
      <>
        {currentPage === 'dashboard' && <AdminDashboard user={user} token={token} onNavigate={handleNavigate} />}
        {currentPage === 'students' && <AdminStudents user={user} token={token} onNavigate={handleNavigate} />}
        {currentPage === 'workouts' && <AdminWorkouts user={user} token={token} onNavigate={handleNavigate} />}
        {currentPage === 'questions' && <AdminQuestions user={user} token={token} onNavigate={handleNavigate} />}
        {currentPage === 'settings' && <AdminSettings user={user} token={token} onNavigate={handleNavigate} />}
      </>
    )
  }

  // STUDENT
  if (user.status !== 'APPROVED') {
    return (
      <div className="approval-screen">
        <div className="approval-card">
          <h2>Aguardando Aprovação</h2>
          <p>Seu cadastro está sendo analisado por Bruna. Você receberá um email quando for aprovado!</p>
          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </div>
      </div>
    )
  }

  return <StudentDashboard user={user} token={token} onLogout={handleLogout} />
}