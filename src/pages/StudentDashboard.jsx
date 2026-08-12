import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import './StudentDashboard.css'

export default function StudentDashboard({ user, token, onLogout }) {
  const [workouts, setWorkouts] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [completedWorkouts, setCompletedWorkouts] = useState(0)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [questionData, setQuestionData] = useState({ title: '', text: '' })
  const [questionLoading, setQuestionLoading] = useState(false)
  const [questionMessage, setQuestionMessage] = useState('')

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
    
    if (!questionData.title.trim() || !questionData.text.trim()) {
      setQuestionMessage('Preencha todos os campos')
      return
    }

    setQuestionLoading(true)
    setQuestionMessage('')

    try {
      await api.post(
        '/questions',
        {
          title: questionData.title,
          text: questionData.text
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setQuestionMessage('Pergunta enviada com sucesso!')
      setQuestionData({ title: '', text: '' })
      setTimeout(() => {
        setShowQuestionModal(false)
        setQuestionMessage('')
      }, 2000)
    } catch (error) {
      setQuestionMessage('Erro ao enviar pergunta. Tente novamente.')
    } finally {
      setQuestionLoading(false)
    }
  }

  const totalProgress = Math.round((completedWorkouts / (workouts.length || 1)) * 100)

  return (
    <div className="student-dashboard">
      <header className="student-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <img 
                src="https://i.imgur.com/RU6wtlH.jpg" 
                alt="Bruna Affonso" 
                className="header-logo"
              />
              <div className="logo-text">
                <h1>Bruna Affonso</h1>
                <p>Plataforma de Treinos</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <span className="user-name">{user.name}</span>
            <button className="logout-btn" onClick={onLogout}>Sair</button>
          </div>
        </div>
      </header>

      {selectedWorkout ? (
        <div className="workout-player-page">
          <div className="player-wrapper">
            <button className="back-button" onClick={() => setSelectedWorkout(null)}>
              ← Voltar
            </button>
            
            <div className="player-container">
              <div className="video-section">
                <div className="video-wrapper">
                  {selectedWorkout.videoUrl.includes('youtube') ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selectedWorkout.videoUrl.split('v=')[1]}`}
                      title={selectedWorkout.title}
                      frameBorder="0"
                      allowFullScreen
                    />
                  ) : (
                    <a href={selectedWorkout.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                      Abrir Vídeo
                    </a>
                  )}
                </div>

                <div className="video-info">
                  <h2>{selectedWorkout.title}</h2>
                  <p>{selectedWorkout.description}</p>
                  
                  {selectedWorkout.week && (
                    <div className="workout-meta">
                      <span>Semana {selectedWorkout.week}</span>
                      {selectedWorkout.module && <span>•</span>}
                      {selectedWorkout.module && <span>{selectedWorkout.module}</span>}
                    </div>
                  )}

                  <div className="video-actions">
                    <button className="btn-complete" onClick={() => setSelectedWorkout(null)}>
                      Marcar como Concluído
                    </button>
                    <button className="btn-question" onClick={() => setShowQuestionModal(true)}>
                      Enviar Dúvida
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <main className="student-main">
          {loading ? (
            <div className="loading">Carregando treinos...</div>
          ) : (
            <>
              {/* HERO SECTION */}
              <section className="hero-section">
                <div className="hero-content">
                  <h2>Olá, {user.name.split(' ')[0]}</h2>
                  {settings?.motivationalPhrase && (
                    <p className="hero-quote">{settings.motivationalPhrase}</p>
                  )}
                </div>
              </section>

              {/* PROGRESS SECTION */}
              <section className="progress-section">
                <div className="progress-info">
                  <h3>Progresso</h3>
                  <span className="progress-value">{totalProgress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${totalProgress}%` }} />
                </div>
                <p className="progress-text">{completedWorkouts} de {workouts.length} treinos completados</p>
              </section>

              {/* STATS SECTION */}
              <section className="stats-section">
                <div className="stat-item">
                  <span className="stat-label">Disponíveis</span>
                  <span className="stat-number">{workouts.length}</span>
                </div>
                <div className="divider" />
                <div className="stat-item">
                  <span className="stat-label">Concluídos</span>
                  <span className="stat-number">{completedWorkouts}</span>
                </div>
                <div className="divider" />
                <div className="stat-item">
                  <span className="stat-label">Faltam</span>
                  <span className="stat-number">{workouts.length - completedWorkouts}</span>
                </div>
              </section>

              {/* WORKOUTS SECTION */}
              <section className="workouts-section">
                <div className="section-title">
                  <h3>Meus Treinos</h3>
                  <span className="count">{workouts.length}</span>
                </div>

                {workouts.length === 0 ? (
                  <div className="empty-state">
                    <p>Nenhum treino disponível no momento</p>
                  </div>
                ) : (
                  <div className="workouts-list">
                    {workouts.map((workout, index) => (
                      <div
                        key={workout.id}
                        className="workout-item"
                        onClick={() => setSelectedWorkout(workout)}
                      >
                        <div className="workout-number">{index + 1}</div>
                        <div className="workout-content">
                          <h4>{workout.title}</h4>
                          <p>{workout.description}</p>
                        </div>
                        <div className="workout-meta-inline">
                          {workout.week && <span className="meta-tag">S{workout.week}</span>}
                          {workout.module && <span className="meta-tag">{workout.module}</span>}
                        </div>
                        <div className="arrow">→</div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* CONTACT SECTION */}
              {settings?.phone || settings?.whatsappUrl ? (
                <section className="contact-section">
                  <h3>Entre em Contato</h3>
                  <div className="contact-links">
                    {settings?.phone && (
                      <a href={`tel:${settings.phone}`} className="contact-link">
                        <span className="contact-icon">📞</span>
                        <span>{settings.phone}</span>
                      </a>
                    )}
                    {settings?.whatsappUrl && (
                      <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="contact-link">
                        <span className="contact-icon">💬</span>
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </section>
              ) : null}

              {/* QUESTION BUTTON */}
              <button 
                className="floating-question-btn"
                onClick={() => setShowQuestionModal(true)}
              >
                Enviar Dúvida
              </button>
            </>
          )}
        </main>
      )}

      {/* QUESTION MODAL */}
      {showQuestionModal && (
        <div className="modal-overlay" onClick={() => setShowQuestionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Enviar Dúvida</h2>
              <button className="modal-close" onClick={() => setShowQuestionModal(false)}>×</button>
            </div>

            <form onSubmit={handleSendQuestion} className="question-form">
              <div className="form-group">
                <label>Assunto</label>
                <input
                  type="text"
                  placeholder="Qual é sua dúvida?"
                  value={questionData.title}
                  onChange={(e) => setQuestionData({...questionData, title: e.target.value})}
                  disabled={questionLoading}
                />
              </div>

              <div className="form-group">
                <label>Mensagem</label>
                <textarea
                  placeholder="Descreva sua dúvida com detalhes..."
                  value={questionData.text}
                  onChange={(e) => setQuestionData({...questionData, text: e.target.value})}
                  rows="5"
                  disabled={questionLoading}
                />
              </div>

              {questionMessage && (
                <div className={`message ${questionMessage.includes('sucesso') ? 'success' : 'error'}`}>
                  {questionMessage}
                </div>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn-send" disabled={questionLoading}>
                  {questionLoading ? 'Enviando...' : 'Enviar'}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setShowQuestionModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}