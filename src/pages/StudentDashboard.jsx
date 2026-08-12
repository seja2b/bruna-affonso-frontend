import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import './StudentDashboard.css'

export default function StudentDashboard({ user, token, onLogout }) {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchWorkouts()
  }, [])

  async function fetchWorkouts() {
    try {
      const response = await api.get('/workouts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWorkouts(response.data)
    } catch (error) {
      console.error('Erro ao buscar treinos', error)
    } finally {
      setLoading(false)
    }
  }

  const groupedWorkouts = workouts.reduce((acc, workout) => {
    const week = workout.week || 'Sem categoria'
    if (!acc[week]) acc[week] = []
    acc[week].push(workout)
    return acc
  }, {})

  const filteredWorkouts = filter === 'all' 
    ? groupedWorkouts 
    : { [filter]: groupedWorkouts[filter] || [] }

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
        <div className="workout-player">
          <button className="back-button" onClick={() => setSelectedWorkout(null)}>
            ← Voltar
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

              <button 
                className="btn-complete"
                onClick={() => setSelectedWorkout(null)}
              >
                Treino Concluído
              </button>
            </div>
          </div>
        </div>
      ) : (
        <main className="student-main">
          <div className="library-header">
            <h2>Biblioteca de Treinos</h2>
            <p>Escolha um treino e comece a se exercitar</p>
          </div>

          {loading ? (
            <div className="loading">Carregando treinos...</div>
          ) : Object.keys(filteredWorkouts).length === 0 ? (
            <div className="empty-state">
              <p>Nenhum treino disponível</p>
            </div>
          ) : (
            <div className="workouts-by-week">
              {Object.entries(filteredWorkouts).map(([week, weekWorkouts]) => (
                <div key={week} className="week-section">
                  <h3 className="week-title">Semana {week}</h3>
                  <div className="workouts-row">
                    {weekWorkouts.map(workout => (
                      <div
                        key={workout.id}
                        className="workout-item"
                        onClick={() => setSelectedWorkout(workout)}
                      >
                        <div className="workout-thumbnail">
                          <div className="play-icon">▶</div>
                        </div>
                        <div className="workout-info">
                          <h4>{workout.title}</h4>
                          <p>{workout.description}</p>
                          {workout.module && (
                            <span className="module-badge">{workout.module}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  )
}