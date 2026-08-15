import React, { useState, useEffect } from 'react'
import StudentWeeklyTracking from '../components/StudentWeeklyTracking'
import StudentRanking from '../components/StudentRanking'
import './StudentDashboard.css'

export default function StudentDashboard({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userData, setUserData] = useState(user)

  useEffect(() => {
    if (user) {
      setUserData(user)
    }
  }, [user])

  if (userData.status !== 'APPROVED') {
    return (
      <div className="student-dashboard">
        <div className="dashboard-header">
          <h1>Painel do Aluno</h1>
          <button onClick={onLogout} className="logout-btn">Logout</button>
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
          <h1>👋 Bem-vindo, {userData.name}!</h1>
          <p className="user-email">{userData.email}</p>
        </div>
        <button onClick={onLogout} className="logout-btn">🚪 Logout</button>
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
                <div className="feature-box" onClick={() => setActiveTab('tracking')} style={{ cursor: 'pointer' }}>
                  <span className="feature-icon">📝</span>
                  <h3>Registre seus Treinos</h3>
                  <p>Preencha as cargas e repetições de cada exercício</p>
                </div>
                
                <div className="feature-box" onClick={() => setActiveTab('tracking')} style={{ cursor: 'pointer' }}>
                  <span className="feature-icon">💬</span>
                  <h3>Deixe Observações</h3>
                  <p>Compartilhe como você se sentiu em cada semana</p>
                </div>
                
                <div className="feature-box" onClick={() => setActiveTab('tracking')} style={{ cursor: 'pointer' }}>
                  <span className="feature-icon">📸</span>
                  <h3>Adicione sua Foto</h3>
                  <p>Personalize seu perfil com uma foto</p>
                </div>
                
                <div className="feature-box" onClick={() => setActiveTab('ranking')} style={{ cursor: 'pointer' }}>
                  <span className="feature-icon">🏆</span>
                  <h3>Ganhe Pontos</h3>
                  <p>Complete semanas e suba no ranking!</p>
                </div>
              </div>

              <div className="getting-started">
                <h3>Como Começar?</h3>
                <ol>
                  <li>Clique em "Registre seus Treinos"</li>
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
            <StudentWeeklyTracking studentId={userData.studentId} token={token} />
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