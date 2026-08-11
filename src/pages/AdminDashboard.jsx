import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import AdminLayout from '../components/AdminLayout'
import './AdminDashboard.css'

export default function AdminDashboard({ user, token }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingStudents: 0,
    totalWorkouts: 0,
    pendingQuestions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const response = await api.get('/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Erro ao buscar stats', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout user={user} token={token}>
      <div className="admin-dashboard">
        <h1>📊 Dashboard Administrativo</h1>

        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total de Alunos</h3>
                <p className="stat-number">{stats.totalStudents}</p>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Alunos Pendentes</h3>
                <p className="stat-number">{stats.pendingStudents}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💪</div>
              <div className="stat-content">
                <h3>Total de Treinos</h3>
                <p className="stat-number">{stats.totalWorkouts}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">❓</div>
              <div className="stat-content">
                <h3>Perguntas Pendentes</h3>
                <p className="stat-number">{stats.pendingQuestions}</p>
              </div>
            </div>
          </div>
        )}

        <div className="quick-actions">
          <h2>Ações Rápidas</h2>
          <div className="actions-grid">
            <a href="/admin/students" className="action-button">
              👥 Gerenciar Alunos
            </a>
            <a href="/admin/workouts" className="action-button">
              💪 Gerenciar Treinos
            </a>
            <a href="/admin/questions" className="action-button">
              ❓ Responder Perguntas
            </a>
            <a href="/admin/settings" className="action-button">
              ⚙️ Configurações
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}