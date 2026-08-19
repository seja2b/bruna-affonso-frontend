import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function FullPageLoader() {
  return <div className="app-loading">Carregando sua experiência...</div>
}

export function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export function RoleRoute({ role }) {
  const { loading, user } = useAuth()

  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/aluno'} replace />
  }

  return <Outlet />
}
