import React, { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import './StudentWeeks.css'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit'
})

export default function StudentWeeks({ studentId }) {
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedWeek, setSelectedWeek] = useState(null)

  useEffect(() => { fetchWeeks() }, [studentId])

  async function fetchWeeks() {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/tracking/student/${studentId}/weeks`)
      setWeeks(response.data || [])
    } catch (err) {
      console.error('Erro ao buscar semanas', err)
      setError('Não foi possível carregar suas semanas agora.')
    } finally {
      setLoading(false)
    }
  }

  const progress = useMemo(() => {
    const completed = weeks.filter((week) => week.isCompleted).length
    return { completed, percentage: weeks.length ? Math.round((completed / weeks.length) * 100) : 0 }
  }, [weeks])

  if (loading) return <div className="loading">Carregando semanas...</div>
  if (error) return <div className="student-weeks-error"><p>{error}</p><button onClick={fetchWeeks}>Tentar novamente</button></div>

  return (
    <div className="student-weeks">
      <div className="weeks-header">
        <div>
          <span className="weeks-kicker">Programa anual</span>
          <h2>Minhas semanas</h2>
          <p>Cada ciclo vai de segunda a sexta. A próxima semana é liberada automaticamente na segunda-feira, às 00:00.</p>
        </div>
        <div className="weeks-summary"><strong>{progress.percentage}%</strong><span>concluído</span></div>
      </div>

      <div className="weeks-progress"><span style={{ width: `${progress.percentage}%` }} /></div>

      <div className="weeks-grid">
        {weeks.map((week) => {
          const state = week.isCompleted ? 'completed' : week.isReleased ? 'released' : 'locked'
          const start = dateFormatter.format(new Date(week.startDate))
          const end = dateFormatter.format(new Date(week.endDate))

          return (
            <button key={week.id} className={`week-card ${state}`} disabled={!week.isReleased} onClick={() => setSelectedWeek(week)}>
              <span className="week-state-dot" />
              <span className="week-number">Semana {week.weekNumber}</span>
              <span className="week-calendar">{start} a {end}</span>
              <span className="week-label">
                {week.isCompleted ? 'Concluída' : week.isReleased ? 'Disponível' : `Libera em ${start} às 00:00`}
              </span>
              {week.calendarWeek && <span className="week-calendar-index">Semana {week.calendarWeek} de {week.calendarYear}</span>}
              {week.isCompleted && <span className="week-badge">100 pts</span>}
            </button>
          )
        })}
      </div>

      {selectedWeek && (
        <div className="week-details">
          <div className="details-header">
            <div>
              <span className="weeks-kicker">Detalhes</span>
              <h3>Semana {selectedWeek.weekNumber}</h3>
              <p>{dateFormatter.format(new Date(selectedWeek.startDate))} a {dateFormatter.format(new Date(selectedWeek.endDate))} · segunda a sexta</p>
            </div>
            <button className="close-btn" onClick={() => setSelectedWeek(null)} aria-label="Fechar">×</button>
          </div>
          {(selectedWeek.exercises || []).length === 0 ? <div className="no-exercises">Nenhum exercício registrado ainda.</div> : (
            <div className="exercises-list">{selectedWeek.exercises.map((exercise, index) => (
              <div key={exercise.id || index} className="exercise-item"><div className="exercise-number">{index + 1}</div><div className="exercise-info"><strong>{exercise.exerciseName}</strong><span>{exercise.trainingType}</span></div><div className="exercise-stats">{exercise.weight && <span>{exercise.weight} kg</span>}{exercise.reps && <span>{exercise.reps} reps</span>}</div></div>
            ))}</div>
          )}
          {selectedWeek.observation?.teacherNote && (
            <div className="week-teacher-feedback">
              <strong>Feedback da professora</strong>
              <p>{selectedWeek.observation.teacherNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
