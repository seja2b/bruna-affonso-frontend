import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentWeeklyTracking from '../components/StudentWeeklyTracking'
import StudentRanking from '../components/StudentRanking'
import './StudentDashboard.css'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchUserData()
  }, [token, navigate])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://bruna-affonso-backend-production.up.railway.app/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Não autorizado')
      
      const data = await response.json()
      setUser(data)
      
      if (data.status !== 'APPROVED') {
        setActiveTab('awaiting')
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      localStorage.removeItem('token')
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) {
    return <div className="student-dashboard-loading">Carregando...</div>
  }

  if (!user) {
    return <div className="student-dashboard-error">Erro ao carregar usuário</div>
  }

  if (user.status !== 'APPROVED') {
    return (
      <div className="student-dashboard">
        <div className="dashboard-header">
          <h1>Painel do Aluno</h1>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
        <div className="awaiting-approval">
          <div className="awaiting-icon">⏳</div>
          <h2>Aguardando Aprovação</h2>
          <p>Sua conta está em análise. Em breve você terá acesso completo!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="student-dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>👋 Bem-vindo, {user.name}!</h1>
          <p className="user-email">{user.email}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
      </div>

      {/* TABS */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          📝 Acompanhamento Semanal
        </button>
        <button
          className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveTab('ranking')}
        >
          🏆 Ranking
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="dashboard-content">
        {/* ABA 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-tab">
            <div className="welcome-card">
              <div className="welcome-icon">💪</div>
              <h2>Bem-vindo ao Acompanhamento de Treinos!</h2>
              <p>Aqui você pode registrar o progresso das suas semanas de treino, deixar observações e acompanhar seu desempenho.</p>
              
              <div className="features-grid">
                <div className="feature-box">
                  <span className="feature-icon">📝</span>
                  <h3>Registre seus Treinos</h3>
                  <p>Preencha as cargas e repetições de cada exercício</p>
                </div>
                
                <div className="feature-box">
                  <span className="feature-icon">💬</span>
                  <h3>Deixe Observações</h3>
                  <p>Compartilhe como você se sentiu em cada semana</p>
                </div>
                
                <div className="feature-box">
                  <span className="feature-icon">📸</span>
                  <h3>Adicione sua Foto</h3>
                  <p>Personalize seu perfil com uma foto</p>
                </div>
                
                <div className="feature-box">
                  <span className="feature-icon">🏆</span>
                  <h3>Ganhe Pontos</h3>
                  <p>Complete semanas e suba no ranking!</p>
                </div>
              </div>

              <div className="getting-started">
                <h3>Como Começar?</h3>
                <ol>
                  <li>Clique em "Acompanhamento Semanal"</li>
                  <li>Selecione a semana liberada</li>
                  <li>Preencha as cargas e repetições de cada exercício</li>
                  <li>Deixe suas observações (opcional)</li>
                  <li>Quando completar tudo, ganhe 100 pontos! 🎉</li>
                </ol>
              </div>

              <button className="cta-button" onClick={() => setActiveTab('tracking')}>
                ➡️ Ir para Acompanhamento Semanal
              </button>
            </div>
          </div>
        )}

        {/* ABA 2: ACOMPANHAMENTO SEMANAL */}
        {activeTab === 'tracking' && (
          <div className="tracking-tab">
            <StudentWeeklyTracking studentId={user.id} token={token} />
          </div>
        )}

        {/* ABA 3: RANKING */}
        {activeTab === 'ranking' && (
          <div className="ranking-tab">
            <StudentRanking token={token} />
          </div>
        )}
      </div>
    </div>
  )
}