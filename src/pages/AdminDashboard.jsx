import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import AdminLayout from '../components/AdminLayout'
import './AdminDashboard.css'

export default function AdminDashboard({ user, token, onNavigate }) {
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
    <AdminLayout user={user} token={token} onNavigate={onNavigate} currentPage="dashboard">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Bem-vindo ao painel de controle</p>
        </div>

        {loading ? (
          <div className="loading">Carregando dados...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon students">👥</div>
                <div className="stat-content">
                  <h3>Total de Alunos</h3>
                  <p className="stat-number">{stats.totalStudents}</p>
                </div>
                <button 
                  className="stat-action"
                  onClick={() => onNavigate('students')}
                >
                  Ver →
                </button>
              </div>

              <div className="stat-card">
                <div className="stat-icon pending">⏳</div>
                <div className="stat-content">
                  <h3>Aguardando Aprovação</h3>
                  <p className="stat-number">{stats.pendingStudents}</p>
                </div>
                <button 
                  className="stat-action"
                  onClick={() => onNavigate('students')}
                >
                  Aprovar →
                </button>
              </div>

              <div className="stat-card">
                <div className="stat-icon workouts">💪</div>
                <div className="stat-content">
                  <h3>Total de Treinos</h3>
                  <p className="stat-number">{stats.totalWorkouts}</p>
                </div>
                <button 
                  className="stat-action"
                  onClick={() => onNavigate('workouts')}
                >
                  Gerenciar →
                </button>
              </div>

              <div className="stat-card">
                <div className="stat-icon questions">💬</div>
                <div className="stat-content">
                  <h3>Perguntas Pendentes</h3>
                  <p className="stat-number">{stats.pendingQuestions}</p>
                </div>
                <button 
                  className="stat-action"
                  onClick={() => onNavigate('questions')}
                >
                  Responder →
                </button>
              </div>
            </div>

            <div className="quick-actions">
              <h2>Ações Rápidas</h2>
              <div className="actions-grid">
                <button 
                  className="action-btn"
                  onClick={() => onNavigate('students')}
                >
                  <span className="action-icon">👥</span>
                  <span>Gerenciar Alunos</span>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => onNavigate('workouts')}
                >
                  <span className="action-icon">💪</span>
                  <span>Adicionar Treino</span>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => onNavigate('questions')}
                >
                  <span className="action-icon">💬</span>
                  <span>Ver Perguntas</span>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => onNavigate('settings')}
                >
                  <span className="action-icon">⚙️</span>
                  <span>Configurações</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}