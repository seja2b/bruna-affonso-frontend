import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './StudentWeeks.css'

export default function StudentWeeks({ studentId, token }) {
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [weekExercises, setWeekExercises] = useState([])

  useEffect(() => {
    fetchWeeks()
  }, [])

  async function fetchWeeks() {
    try {
      const response = await api.get(`/tracking/weeks/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWeeks(response.data)
    } catch (error) {
      console.error('Erro ao buscar semanas', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchWeekExercises(weekId) {
    try {
      const response = await api.get(`/tracking/week/${weekId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWeekExercises(response.data.exercises || [])
      setSelectedWeek(weekId)
    } catch (error) {
      console.error('Erro ao buscar exercícios da semana', error)
    }
  }

  function getWeekStatus(week) {
    if (week.isCompleted) return '✅'
    if (week.isReleased) return '🟢'
    return '🔒'
  }

  function getWeekLabel(week) {
    if (week.isCompleted) return 'Completa'
    if (week.isReleased) return 'Liberada'
    return 'Bloqueada'
  }

  if (loading) {
    return <div className="loading">Carregando semanas...</div>
  }

  return (
    <div className="student-weeks">
      <div className="weeks-header">
        <h2>📅 Minhas 52 Semanas</h2>
        <p>Acompanhe seu progresso semana a semana</p>
      </div>

      {/* GRID DE SEMANAS */}
      <div className="weeks-grid">
        {weeks.map(week => (
          <div
            key={week.id}
            className={`week-card ${week.isCompleted ? 'completed' : ''} ${week.isReleased ? 'released' : 'locked'}`}
            onClick={() => week.isReleased && fetchWeekExercises(week.id)}
            style={{ cursor: week.isReleased ? 'pointer' : 'not-allowed' }}
          >
            <div className="week-status">{getWeekStatus(week)}</div>
            <div className="week-number">Semana {week.weekNumber}</div>
            <div className="week-label">{getWeekLabel(week)}</div>
            {week.isCompleted && (
              <div className="week-badge">✨ 100 pts</div>
            )}
          </div>
        ))}
      </div>

      {/* DETALHES DA SEMANA SELECIONADA */}
      {selectedWeek && (
        <div className="week-details">
          <div className="details-header">
            <h3>📋 Exercícios da Semana {weeks.find(w => w.id === selectedWeek)?.weekNumber}</h3>
            <button 
              className="close-btn"
              onClick={() => {
                setSelectedWeek(null)
                setWeekExercises([])
              }}
            >
              ✕
            </button>
          </div>

          {weekExercises.length === 0 ? (
            <div className="no-exercises">
              <p>Nenhum exercício registrado ainda.</p>
            </div>
          ) : (
            <div className="exercises-list">
              {weekExercises.map((exercise, index) => (
                <div key={exercise.id} className="exercise-item">
                  <div className="exercise-number">{index + 1}</div>
                  <div className="exercise-info">
                    <div className="exercise-name">{exercise.exerciseName}</div>
                    <div className="exercise-type">{exercise.trainingType}</div>
                  </div>
                  <div className="exercise-stats">
                    {exercise.weight && (
                      <span className="stat">
                        <strong>{exercise.weight}</strong> kg
                      </span>
                    )}
                    {exercise.reps && (
                      <span className="stat">
                        <strong>{exercise.reps}</strong> reps
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {weekExercises.length > 0 && (
            <div className="week-summary">
              <div className="summary-item">
                <span>Total de Exercícios:</span>
                <strong>{weekExercises.length}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PROGRESS BAR */}
      <div className="progress-section">
        <div className="progress-header">
          <h3>📊 Seu Progresso</h3>
          <span className="progress-text">
            {weeks.filter(w => w.isCompleted).length} de {weeks.length} semanas completas
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{
              width: `${(weeks.filter(w => w.isCompleted).length / weeks.length) * 100}%`
            }}
          />
        </div>
        <div className="progress-stats">
          <div className="stat">
            <span className="stat-label">Completas</span>
            <span className="stat-value">{weeks.filter(w => w.isCompleted).length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Liberadas</span>
            <span className="stat-value">{weeks.filter(w => w.isReleased && !w.isCompleted).length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Bloqueadas</span>
            <span className="stat-value">{weeks.filter(w => !w.isReleased).length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}