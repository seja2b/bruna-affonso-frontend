import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import './StudentDashboard.css'

export default function StudentDashboard({ user, token, onLogout }) {
  const [workouts, setWorkouts] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [completedWorkouts, setCompletedWorkouts] = useState(0)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [questionData, setQuestionData] = useState({ title: '', text: '' })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [workoutsRes, settingsRes] = await Promise.all([
        api.get('/workouts', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      ])
      setWorkouts(workoutsRes.data)
      setSettings(settingsRes.data)
      setCompletedWorkouts(Math.floor(workoutsRes.data.length * 0.3))
    } catch (error) {
      console.error('Erro ao buscar dados', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendQuestion(e) {
    e.preventDefault()
    try {
      await api.post(
        '/questions',
        questionData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setQuestionData({ title: '', text: '' })
      setShowQuestionForm(false)
      alert('Pergunta enviada com sucesso!')
    } catch (error) {
      alert('Erro ao enviar pergunta')
    }
  }

  const todayWorkouts = workouts.slice(0, 3)
  const totalProgress = Math.round((completedWorkouts / (workouts.length || 1)) * 100)

  return (
    <div className="student-dashboard">
      <header className="student-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Bruna Affonso</h1>
            <p className="header-subtitle">Sua assistente de treino</p>
          </div>
          <div className="header-right">
            <div className="user-card">
              <div className="user-avatar">{user.name.charAt(0)}</div>
              <div className="user-details">
                <p className="user-name">{user.name}</p>
                <button className="logout-link" onClick={onLogout}>Sair</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {selectedWorkout ? (
        <div className="workout-player-page">
          <button className="back-button" onClick={() => setSelectedWorkout(null)}>
            ← Voltar para biblioteca
          </button>
          
          <div className="player-container">
            <div className="video-wrapper">
              {selectedWorkout.videoUrl.includes('youtube') ? (
                <iframe
                  width="100%"
                  height="600"
                  src={`https://www.youtube.com/embed/${selectedWorkout.videoUrl.split('v=')[1]}`}
                  title={selectedWorkout.title}
                  frameBorder="0"
                  allowFullScreen
                />
              ) : (
                <a href={selectedWorkout.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                  Abrir vídeo →
                </a>
              )}
            </div>

            <div className="workout-details">
              <h1>{selectedWorkout.title}</h1>
              
              {selectedWorkout.week && (
                <div className="workout-meta">
                  <span className="meta-badge">Semana {selectedWorkout.week}</span>
                  {selectedWorkout.module && (
                    <span className="meta-badge">{selectedWorkout.module}</span>
                  )}
                </div>
              )}

              <p className="workout-description">{selectedWorkout.description}</p>

              <div className="workout-actions">
                <button 
                  className="btn-complete"
                  onClick={() => setSelectedWorkout(null)}
                >
                  ✓ Treino Concluído
                </button>
                <button 
                  className="btn-doubt"
                  onClick={() => setShowQuestionForm(true)}
                >
                  ? Tenho uma dúvida
                </button>
              </div>

              {showQuestionForm && (
                <form className="question-form" onSubmit={handleSendQuestion}>
                  <input
                    type="text"
                    placeholder="Título da sua pergunta..."
                    value={questionData.title}
                    onChange={(e) => setQuestionData({...questionData, title: e.target.value})}
                    required
                  />
                  <textarea
                    placeholder="Descreva sua dúvida..."
                    value={questionData.text}
                    onChange={(e) => setQuestionData({...questionData, text: e.target.value})}
                    rows="4"
                    required
                  />
                  <div className="form-buttons">
                    <button type="submit" className="btn-send">Enviar</button>
                    <button type="button" className="btn-cancel" onClick={() => setShowQuestionForm(false)}>Cancelar</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : (
        <main className="student-main">
          {loading ? (
            <div className="loading">Carregando seus treinos...</div>
          ) : (
            <>
              {/* SEÇÃO 1: BEM-VINDO + FRASE MOTIVACIONAL */}
              <section className="welcome-section">
                <div className="welcome-card">
                  <h2>Bem-vindo, {user.name.split(' ')[0]}!</h2>
                  {settings?.motivationalPhrase && (
                    <p className="motivational-phrase">{settings.motivationalPhrase}</p>
                  )}
                </div>
              </section>

              {/* SEÇÃO 2: PROGRESSO */}
              <section className="progress-section">
                <div className="progress-card">
                  <div className="progress-header">
                    <h3>Seu Progresso</h3>
                    <span className="progress-percent">{totalProgress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${totalProgress}%` }} />
                  </div>
                  <p className="progress-text">{completedWorkouts} de {workouts.length} treinos completados</p>
                </div>
              </section>

              {/* SEÇÃO 3: ESTATÍSTICAS */}
              <section className="stats-section">
                <div className="stat-card">
                  <div className="stat-icon">💪</div>
                  <div className="stat-info">
                    <p className="stat-value">{workouts.length}</p>
                    <p className="stat-label">Treinos Disponíveis</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✓</div>
                  <div className="stat-info">
                    <p className="stat-value">{completedWorkouts}</p>
                    <p className="stat-label">Concluídos</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-info">
                    <p className="stat-value">{workouts.length - completedWorkouts}</p>
                    <p className="stat-label">Faltam</p>
                  </div>
                </div>
              </section>

              {/* SEÇÃO 4: TREINOS DE HOJE */}
              {todayWorkouts.length > 0 && (
                <section className="today-section">
                  <div className="section-header">
                    <h3>Sugestão de Treino para Hoje</h3>
                    <span className="badge-new">Novo</span>
                  </div>
                  <div className="today-workout">
                    <div className="today-info">
                      <h4>{todayWorkouts[0].title}</h4>
                      <p>{todayWorkouts[0].description}</p>
                      {todayWorkouts[0].module && (
                        <span className="difficulty-badge">{todayWorkouts[0].module}</span>
                      )}
                    </div>
                    <button
                      className="btn-start"
                      onClick={() => setSelectedWorkout(todayWorkouts[0])}
                    >
                      Começar Treino →
                    </button>
                  </div>
                </section>
              )}

              {/* SEÇÃO 5: BIBLIOTECA DE TREINOS */}
              <section className="library-section">
                <div className="section-header">
                  <h3>Biblioteca Completa</h3>
                  <span className="badge-count">{workouts.length} treinos</span>
                </div>

                <div className="workouts-grid">
                  {workouts.map(workout => (
                    <div
                      key={workout.id}
                      className="workout-card"
                      onClick={() => setSelectedWorkout(workout)}
                    >
                      <div className="card-header">
                        <div className="card-icon">🎯</div>
                        {workout.module && (
                          <span className="card-module">{workout.module}</span>
                        )}
                      </div>

                      <div className="card-body">
                        <h4>{workout.title}</h4>
                        <p>{workout.description}</p>
                      </div>

                      <div className="card-footer">
                        <span className="card-week">Semana {workout.week || '-'}</span>
                        <span className="play-icon">▶</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SEÇÃO 6: FALE COM A BRUNA */}
              <section className="contact-section">
                <div className="contact-card">
                  <div className="contact-left">
                    <h3>Tem uma dúvida?</h3>
                    <p>Envie sua pergunta direto para Bruna e ela responderá assim que possível!</p>
                  </div>
                  <button 
                    className="btn-ask"
                    onClick={() => setShowQuestionForm(true)}
                  >
                    Fazer Pergunta
                  </button>
                </div>
              </section>

              {/* SEÇÃO 7: CONTATO */}
              {settings?.phone || settings?.whatsappUrl && (
                <section className="info-section">
                  <h3>Entre em Contato</h3>
                  <div className="contact-options">
                    {settings?.phone && (
                      <a href={`tel:${settings.phone}`} className="contact-btn phone">
                        <span className="contact-icon">📞</span>
                        <span>{settings.phone}</span>
                      </a>
                    )}
                    {settings?.whatsappUrl && (
                      <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="contact-btn whatsapp">
                        <span className="contact-icon">💬</span>
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      )}
    </div>
  )
}