import React, { useState, useEffect } from 'react'
import AdminTracking from '../components/AdminTracking'
import './AdminDashboard.css'

export default function AdminDashboard({ user, token, onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userData, setUserData] = useState(user)

  useEffect(() => {
    if (user) {
      setUserData(user)
    }
  }, [user])

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <div className="admin-dashboard-header">
        <div className="header-left">
          <h1>👨‍💼 Painel de Administrador</h1>
          <p className="admin-email">{userData.email}</p>
        </div>
        <button onClick={onLogout} className="logout-btn">🚪 Logout</button>
      </div>

      {/* TABS */}
      <div className="admin-tabs">
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
          👨‍🏫 Acompanhamento dos Alunos
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="admin-content">
        {/* ABA 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="admin-dashboard-tab">
            <div className="welcome-card-admin">
              <div className="welcome-icon-admin">⚙️</div>
              <h2>Bem-vindo ao Painel Administrativo!</h2>
              <p>Gerencie o programa de treino de Bruna Affonso e acompanhe o progresso dos seus alunos.</p>
              
              <div className="features-grid-admin">
                <div className="feature-box-admin">
                  <span className="feature-icon-admin">👥</span>
                  <h3>Gerenciar Alunos</h3>
                  <p>Visualize e aprove novos alunos</p>
                </div>
                
                <div className="feature-box-admin">
                  <span className="feature-icon-admin">📋</span>
                  <h3>Acompanhar Progresso</h3>
                  <p>Veja o desempenho semanal de cada aluno</p>
                </div>
                
                <div className="feature-box-admin">
                  <span className="feature-icon-admin">💬</span>
                  <h3>Deixar Feedback</h3>
                  <p>Envie observações e sugestões</p>
                </div>
                
                <div className="feature-box-admin">
                  <span className="feature-icon-admin">🏆</span>
                  <h3>Acompanhar Ranking</h3>
                  <p>Veja o ranking de alunos por pontuação</p>
                </div>
              </div>

              <div className="quick-links-admin">
                <h3>Atalhos Rápidos</h3>
                <button 
                  className="quick-link-btn"
                  onClick={() => setActiveTab('tracking')}
                >
                  ➡️ Ir para Acompanhamento dos Alunos
                </button>
              </div>

              <div className="admin-stats">
                <h3>Sistema de Pontuação</h3>
                <div className="stats-box">
                  <p><strong>100 pontos</strong> por semana completa</p>
                  <p><strong>+1 semana</strong> contabilizada no ranking</p>
                  <p>Alunos ganham pontos automaticamente ao completar todas as atividades</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: ACOMPANHAMENTO DOS ALUNOS */}
        {activeTab === 'tracking' && (
          <div className="admin-tracking-tab">
            <AdminTracking token={token} />
          </div>
        )}
      </div>
    </div>
  )
}