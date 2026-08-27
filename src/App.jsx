import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Privacy from './pages/Privacy'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { ProtectedRoute, RoleRoute } from './components/RouteGuards'
import { useAuth } from './context/AuthContext'
import './App.css'

function HomeRedirect() {
  const { loading, user } = useAuth()
  if (loading) return <div className="app-loading">Carregando sua experiência...</div>
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/aluno'} replace />
}

function StudentArea() {
  const { user, logout } = useAuth()
  return <StudentDashboard user={user} token={localStorage.getItem('token')} onLogout={logout} />
}

function AdminArea() {
  const { user, logout } = useAuth()
  return <AdminDashboard user={user} token={localStorage.getItem('token')} onLogout={logout} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/privacidade" element={<Privacy />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute role="STUDENT" />}>
          <Route path="/aluno/*" element={<StudentArea />} />
        </Route>

        <Route element={<RoleRoute role="ADMIN" />}>
          <Route path="/admin/*" element={<AdminArea />} />
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
