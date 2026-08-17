import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './StudentWeeklyTracking.css'

export default function StudentWeeklyTracking({ studentId, token }) {
  const [weeks, setWeeks] = useState([])
  const [exercises, setExercises] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (studentId) {
      fetchWeeks()
    }
  }, [studentId])

  const fetchWeeks = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/tracking/weeks/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWeeks(response.data)
      
      // Carregar exercícios de cada semana
      response.data.forEach(week => {
        fetchExercisesForWeek(week.id)
      })
    } catch (err) {
      console.error('Erro ao carregar semanas:', err)
      setError('Erro ao carregar semanas de treino')
    } finally {
      setLoading(false)
    }
  }

  const fetchExercisesForWeek = async (weekId) => {
    try {
      const response = await api.get(`/tracking/exercises/${weekId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setExercises(prev => ({
        ...prev,
        [weekId]: response.data
      }))
    } catch (err) {
      console.error(`Erro ao carregar exercícios da semana ${weekId}:`, err)
    }
  }

  if (loading) {
    return (
      <div className="tracking-loading">
        <div className="spinner"></div>
        <p>Carregando semanas de treino...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tracking-error">
        <p>❌ {error}</p>
        <button onClick={fetchWeeks} className="retry-btn">
          Tentar Novamente
        </button>
      </div>
    )
  }

  if (weeks.length === 0) {
    return (
      <div className="tracking-empty">
        <p>📋 Nenhuma semana de treino disponível ainda.</p>
      </div>
    )
  }

  // Pegar todos os nomes de exercícios únicos
  const allExerciseNames = Array.from(
    new Set(
      Object.values(exercises)
        .flat()
        .map(ex => ex.exerciseName)
    )
  )

  return (
    <div className="weekly-tracking">
      <h2>📊 Acompanhamento Semanal de Treinos</h2>
      
      <div className="tracking-table-wrapper">
        <table className="tracking-table">
          <thead>
            <tr>
              <th>Exercício</th>
              {weeks.map(week => (
                <th key={week.id} className="week-header">
                  <div className="week-title">Semana {week.weekNumber}</div>
                  <div className="week-status">
                    {week.isReleased ? '🔓 Liberada' : '🔒 Bloqueada'}
                  </div>
                  <div className="week-completion">
                    {week.isCompleted ? '✅ Completa' : '⏳ Pendente'}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allExerciseNames.length > 0 ? (
              allExerciseNames.map((exerciseName, index) => (
                <tr key={index}>
                  <td className="exercise-name">{exerciseName}</td>
                  {weeks.map(week => {
                    const weekExercises = exercises[week.id] || []
                    const exercise = weekExercises.find(
                      ex => ex.exerciseName === exerciseName
                    )
                    return (
                      <td key={`${week.id}-${exerciseName}`} className="exercise-data">
                        {exercise ? (
                          <div className="exercise-info">
                            <div className="exercise-detail">
                              <span className="label">Carga:</span>
                              <span className="value">{exercise.weight || '-'} kg</span>
                            </div>
                            <div className="exercise-detail">
                              <span className="label">Reps:</span>
                              <span className="value">{exercise.reps || '-'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="no-data">-</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={weeks.length + 1} className="no-exercises-message">
                  Nenhum exercício registrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="tracking-info">
        <div className="info-box">
          <span className="info-icon">📌</span>
          <div>
            <p><strong>Como funciona:</strong></p>
            <ul>
              <li>Semana 1 está sempre liberada no primeiro acesso</li>
              <li>As próximas semanas são liberadas 7 dias após completar a anterior</li>
              <li>Complete uma semana preenchendo todos os exercícios</li>
              <li>Você ganha 100 pontos a cada semana completa!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
