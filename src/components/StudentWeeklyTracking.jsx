import React, { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import './StudentWeeklyTracking.css'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: 'short'
})

function StatusIcon({ type }) {
  const paths = {
    completed: <><path d="M20 6 9 17l-5-5" /><circle cx="12" cy="12" r="9" /></>,
    released: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 7.5-2" /></>,
    locked: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>
}

export default function StudentWeeklyTracking({ studentId }) {
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedWeekId, setSelectedWeekId] = useState(null)

  useEffect(() => {
    if (studentId) fetchWeeks()
  }, [studentId])

  async function fetchWeeks() {
    try {
      setLoading(true)
      setError('')
      const { data } = await api.get('/tracking/student/' + studentId + '/weeks')
      setWeeks(data || [])
    } catch (requestError) {
      console.error('Erro ao carregar acompanhamento:', requestError)
      setError('Não foi possível carregar seu acompanhamento agora.')
    } finally {
      setLoading(false)
    }
  }

  const summary = useMemo(() => {
    const completed = weeks.filter((week) => week.isCompleted)
    const released = weeks.filter((week) => week.isReleased && !week.isCompleted)
    const completedTrainings = [...new Set(weeks.map((week) => week.trainingNumber || 1))].filter((training) => weeks.filter((week) => (week.trainingNumber || 1) === training && week.isCompleted).length === 6).length
    return {
      completed: completed.length,
      released: released.length,
      points: completedTrainings * 100,
      exercises: completed.reduce((total, week) => total + (week.exercises?.length || 0), 0),
      progress: weeks.length ? Math.round((completed.length / weeks.length) * 100) : 0
    }
  }, [weeks])

  const filteredWeeks = useMemo(() => weeks.filter((week) => {
    if (filter === 'completed') return week.isCompleted
    if (filter === 'released') return week.isReleased && !week.isCompleted
    if (filter === 'locked') return !week.isReleased
    return true
  }), [weeks, filter])

  if (loading) return <div className="tracking-state" aria-live="polite"><span className="tracking-spinner" />Carregando seu histórico...</div>
  if (error) return <div className="tracking-state tracking-state-error" role="alert"><strong>Não conseguimos abrir esta área.</strong><p>{error}</p><button onClick={fetchWeeks}>Tentar novamente</button></div>

  return (
    <section className="student-tracking">
      <header className="tracking-hero">
        <div><span className="tracking-kicker">Sua jornada</span><h2>Acompanhamento</h2><p>Visualize sua consistência, consulte exercícios registrados e acompanhe os feedbacks da professora.</p></div>
        <div className="tracking-progress-ring" style={{ '--progress': summary.progress * 3.6 + 'deg' }}><div><strong>{summary.progress}%</strong><span>do programa</span></div></div>
      </header>

      <div className="tracking-metrics">
        <article><span>Semanas concluídas</span><strong>{summary.completed}</strong><small>de {weeks.length} semanas</small></article>
        <article><span>Pontos em treinos</span><strong>{summary.points}</strong><small>100 por treino de 6 semanas</small></article>
        <article><span>Exercícios registrados</span><strong>{summary.exercises}</strong><small>nas semanas concluídas</small></article>
        <article><span>Disponíveis agora</span><strong>{summary.released}</strong><small>para preencher ou concluir</small></article>
      </div>

      <div className="tracking-content-card">
        <div className="tracking-card-head">
          <div><span className="tracking-kicker">Histórico real</span><h3>Semanas do programa</h3></div>
          <div className="tracking-filters" aria-label="Filtrar semanas">
            {[['all', 'Todas'], ['completed', 'Concluídas'], ['released', 'Disponíveis'], ['locked', 'Bloqueadas']].map(([value, label]) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}</button>)}
          </div>
        </div>

        {filteredWeeks.length === 0 ? <div className="tracking-empty">Nenhuma semana encontrada neste filtro.</div> : <div className="tracking-week-list">
          {filteredWeeks.map((week) => {
            const state = week.isCompleted ? 'completed' : week.isReleased ? 'released' : 'locked'
            const isOpen = selectedWeekId === week.id
            return <article key={week.id} className={'tracking-week ' + state + (isOpen ? ' is-open' : '')}>
              <button className="tracking-week-summary" onClick={() => setSelectedWeekId(isOpen ? null : week.id)} aria-expanded={isOpen}>
                <span className="tracking-status-icon"><StatusIcon type={state} /></span>
                <span className="tracking-week-title"><strong>Semana {week.weekNumber}</strong><small>{dateFormatter.format(new Date(week.startDate))} — {dateFormatter.format(new Date(week.endDate))}</small></span>
                <span className="tracking-week-count">{week.exercises?.length || 0}<small>exercícios</small></span>
                <span className={'tracking-status-label ' + state}>{state === 'completed' ? 'Concluída' : state === 'released' ? 'Disponível' : 'Bloqueada'}</span>
              </button>
              {isOpen && <div className="tracking-week-details">
                {week.exercises?.length ? week.exercises.map((exercise, index) => <div className="tracking-exercise" key={exercise.id || index}>
                  <span>{String(index + 1).padStart(2, '0')}</span><div><strong>{exercise.exerciseName}</strong><small>{exercise.trainingType || 'Tipo não informado'}</small></div><div><small>Carga</small><strong>{exercise.weight || '—'}{exercise.weight ? ' kg' : ''}</strong></div><div><small>Repetições</small><strong>{exercise.reps || '—'}</strong></div>
                </div>) : <div className="tracking-empty compact">Nenhum exercício registrado nesta semana.</div>}
                {week.observation?.teacherNote && <div className="tracking-teacher-note"><span>Feedback da professora</span><p>{week.observation.teacherNote}</p></div>}
              </div>}
            </article>
          })}
        </div>}
      </div>

      <aside className="tracking-rule-note"><StatusIcon type="released" /><div><strong>Liberação baseada no calendário real</strong><p>Uma nova semana é liberada automaticamente toda segunda-feira às 00:00. A professora também pode antecipar uma liberação quando necessário.</p></div></aside>
    </section>
  )
}
