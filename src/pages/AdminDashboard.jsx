import React, { useState, useEffect } from 'react'
import api from '../services/api'
import AdminTracking from '../components/AdminTracking'
import StudentRanking from '../components/StudentRanking'
import AdminRanking from '../components/AdminRanking'
import AddUser from './AddUser'
import AdminStudents from './AdminStudents'
import AdminWorkouts from './AdminWorkouts'
import AdminQuestions from './AdminQuestions'
import AdminSettings from './AdminSettings'
import './AdminDashboard.css'

export default function AdminDashboard({ user, token, onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userData, setUserData] = useState(user)
  const [settings, setSettings] = useState({
    profileImage: '',
    logo: '',
    motivationalPhrase: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setUserData(user)
    }
    fetchSettings()
  }, [user])

  async function fetchSettings() {
    try {
      const response = await api.get('/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSettings(response.data)
    } catch (error) {
      console.error('Erro ao buscar settings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <div className="admin-dashboard-header">
        <div className="header-left">
          {/* FOTO OU BA */}
          <div className="header-profile">
            {settings.profileImage && !loading ? (
              <img src={settings.profileImage} alt="Perfil" className="header-photo" />
            ) : (
              <div className="header-logo">BA</div>
            )}
          </div>

          <div>
            <h1>Painel de Administrador</h1>
            <p className="admin-email">{userData.email}</p>
          </div>
        </div>

        <div className="header-right">
          {/* LOGO PEQUENA */}
          {settings.logo && !loading && (
            <div className="header-logo-small">
              <img src={settings.logo} alt="Logo" />
            </div>
          )}
          
          <button onClick={onLogout} className="logout-btn">🚪 Logout</button>
        </div>
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
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          👥 Alunos
        </button>
        <button
          className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          📋 Acompanhamento
        </button>
        <button
          className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          ❓ Perguntas
        </button>
        <button
          className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveTab('ranking')}
        >
          🏆 Ranking
        </button>
        <button
          className={`tab-btn ${activeTab === 'workouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('workouts')}
        >
          🎥 Vídeos
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Configurações
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="admin-content">
        {/* ABA 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="admin-dashboard-tab">
            <div className="banner">
              <h2>✨ Bem-vinda ao seu Painel!</h2>
              <p>Gerencie seus alunos, acompanhe treinos, responda perguntas e controle tudo do seu programa.</p>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card" onClick={() => setActiveTab('students')}>
                <div className="card-icon">👥</div>
                <div className="card-number">5</div>
                <div className="card-label">ALUNOS APROVADOS</div>
              </div>

              <div className="dashboard-card" onClick={() => setActiveTab('tracking')}>
                <div className="card-icon">📋</div>
                <div className="card-number">8</div>
                <div className="card-label">SEMANAS COMPLETAS</div>
              </div>

              <div className="dashboard-card" onClick={() => setActiveTab('questions')}>
                <div className="card-icon">❓</div>
                <div className="card-number">3</div>
                <div className="card-label">PERGUNTAS PENDENTES</div>
              </div>

              <div className="dashboard-card" onClick={() => setActiveTab('workouts')}>
                <div className="card-icon">🎥</div>
                <div className="card-number">6</div>
                <div className="card-label">VÍDEOS CADASTRADOS</div>
              </div>
            </div>

            <div className="section">
              <h3>📌 Atividades Recentes</h3>
              <div style={{display: 'grid', gap: '12px'}}>
                <div style={{background: '#fafafa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #4caf50'}}>
                  <div style={{fontWeight: 600, color: '#333', marginBottom: '4px'}}>✅ Bruna Goeiro completou a Semana 2</div>
                  <div style={{fontSize: '12px', color: '#999'}}>Hoje às 14:30 | 200 pontos acumulados</div>
                </div>
                <div style={{background: '#fafafa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ff9800'}}>
                  <div style={{fontWeight: 600, color: '#333', marginBottom: '4px'}}>💬 Maria Santos fez uma pergunta</div>
                  <div style={{fontSize: '12px', color: '#999'}}>Há 2 horas | Aguardando sua resposta</div>
                </div>
                <div style={{background: '#fafafa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #2196F3'}}>
                  <div style={{fontWeight: 600, color: '#333', marginBottom: '4px'}}>📝 João Silva registrou treino</div>
                  <div style={{fontSize: '12px', color: '#999'}}>Há 4 horas | Terça-feira</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: ALUNOS */}
        {activeTab === 'students' && (
          <AdminStudents user={user} token={token} onNavigate={onNavigate} />
        )}

        {/* ABA 3: ACOMPANHAMENTO */}
        {activeTab === 'tracking' && (
          <div className="admin-tracking-tab">
            <AdminTracking token={token} />
          </div>
        )}

        {/* ABA 4: PERGUNTAS */}
        {activeTab === 'questions' && (
          <AdminQuestions user={user} token={token} onNavigate={onNavigate} />
        )}

        {/* ABA 5: RANKING */}
        {activeTab === 'ranking' && (
          <AdminRanking token={token} />
        )}

        {/* ABA 6: VÍDEOS */}
        {activeTab === 'workouts' && (
          <AdminWorkouts user={user} token={token} onNavigate={onNavigate} />
        )}

        {/* ABA 7: CONFIGURAÇÕES */}
        {activeTab === 'settings' && (
          <AdminSettings user={user} token={token} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  )
}