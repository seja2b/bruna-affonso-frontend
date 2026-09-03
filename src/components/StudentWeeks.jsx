import React, { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import './StudentWeeks.css'
import './StudentWeeksCalendar.css'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit'
})

const emptyExercise = () => ({ exerciseName: '', trainingType: '', weight: '', reps: '', notes: '' })

export default function StudentWeeks({ studentId }) {
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [exercises, setExercises] = useState([])
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => { fetchWeeks() }, [studentId])

  async function fetchWeeks(preferredWeekId) {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/tracking/student/${studentId}/weeks`)
      const nextWeeks = response.data || []
      setWeeks(nextWeeks)

      if (preferredWeekId) {
        const refreshed = nextWeeks.find((week) => week.id === preferredWeekId)
        if (refreshed) openWeek(refreshed)
      }
    } catch (err) {
      console.error('Erro ao buscar semanas', err)
      setError('Não foi possível carregar suas semanas agora.')
    } finally {
      setLoading(false)
    }
  }

  function openWeek(week) {
    setSelectedWeek(week)
    setExercises((week.exercises || []).length ? week.exercises.map((exercise) => ({ ...exercise })) : [emptyExercise()])
    setFeedback('')
  }

  function updateExercise(index, field, value) {
    setExercises((current) => current.map((exercise, itemIndex) => itemIndex === index ? { ...exercise, [field]: value } : exercise))
  }

  function addExercise() {
    if (exercises.length >= 30) return
    setExercises((current) => [...current, emptyExercise()])
  }

  function removeExercise(index) {
    setExercises((current) => current.length === 1 ? [emptyExercise()] : current.filter((_, itemIndex) => itemIndex !== index))
  }

  async function saveWeek() {
    if (!selectedWeek || selectedWeek.isCompleted) return
    try {
      setSaving(true)
      setFeedback('')
      await api.post('/tracking/exercise/save', { weekId: selectedWeek.id, exercises })
      setFeedback('Treino salvo com sucesso.')
      await fetchWeeks(selectedWeek.id)
    } catch (err) {
      setFeedback(err.response?.data?.error || 'Não foi possível salvar o treino.')
    } finally {
      setSaving(false)
    }
  }

  async function completeSelectedWeek() {
    if (!selectedWeek || selectedWeek.isCompleted) return
    try {
      setCompleting(true)
      setFeedback('')
      await api.post('/tracking/exercise/save', { weekId: selectedWeek.id, exercises })
      const response = await api.post(`/tracking/week/${selectedWeek.id}/complete`)
      const message = response.data.awardedPoints === 100 ? 'Treino concluído. Você ganhou 100 pontos pelas 6 semanas!' : response.data.message
      await fetchWeeks(selectedWeek.id)
      setFeedback(message)
    } catch (err) {
      setFeedback(err.response?.data?.error || 'Não foi possível concluir a semana.')
    } finally {
      setCompleting(false)
    }
  }

  const progress = useMemo(() => {
    const completed = weeks.filter((week) => week.isCompleted).length
    return { completed, percentage: weeks.length ? Math.round((completed / weeks.length) * 100) : 0 }
  }, [weeks])

  const canComplete = exercises.length > 0 && exercises.every((exercise) =>
    exercise.exerciseName?.trim() && exercise.trainingType?.trim() && exercise.weight?.trim() && exercise.reps?.trim()
  )

  if (loading && weeks.length === 0) return <div className="loading">Carregando semanas...</div>
  if (error) return <div className="student-weeks-error"><p>{error}</p><button onClick={() => fetchWeeks()}>Tentar novamente</button></div>

  return (
    <div className="student-weeks">
      <div className="weeks-hero">
        <div className="weeks-header-copy">
          <span className="weeks-kicker">Ciclos de 6 semanas</span>
          <h2>Meus treinos</h2>
          <p>Preencha seus exercícios por semana. Cada treino completo de 6 semanas vale 100 pontos.</p>
        </div>
        <div className="weeks-summary"><span>Progresso geral</span><strong>{progress.percentage}%</strong><small>{progress.completed} de {weeks.length} semanas concluídas</small></div>
      </div>

      <div className="weeks-progress" aria-label={`${progress.percentage}% concluído`}><span style={{ width: `${progress.percentage}%` }} /></div>

      {[...new Set(weeks.map(week=>week.trainingNumber||1))].map(training=>{const trainingWeeks=weeks.filter(week=>(week.trainingNumber||1)===training);const done=trainingWeeks.filter(week=>week.isCompleted).length;return <section className="student-training-group" key={training}><header className="training-group-header"><div><span>Programa de treino</span><h3>Treino {String(training).padStart(2,'0')}</h3></div><div className="training-status"><strong>{done}/6</strong><span>{done===6?'Treino concluído':'semanas concluídas'}</span></div></header><div className="weeks-grid">
        {trainingWeeks.map((week) => {
          const state = week.isCompleted ? 'completed' : week.isReleased ? 'released' : 'locked'
          const isSelected=selectedWeek?.id===week.id
          const start = dateFormatter.format(new Date(week.startDate))
          const end = dateFormatter.format(new Date(week.endDate))
          return (
            <button key={week.id} className={`week-card ${state} ${isSelected?'selected':''}`} aria-expanded={isSelected} onClick={() => isSelected?setSelectedWeek(null):openWeek(week)}>
              <span className="week-card-top"><span className="week-step">{week.isCompleted?'✓':String(week.weekNumber).padStart(2,'0')}</span><span className={`week-status-chip ${state}`}>{week.isCompleted?'Concluída':week.isReleased?'Disponível':'Bloqueada'}</span></span>
              <span className="week-number">Semana {week.weekNumber}</span><span className="week-calendar">{start} — {end}</span>
              <span className="week-label">{week.isCompleted?'Preenchimento finalizado':week.isReleased?'Clique para preencher':`Liberação em ${start}`}</span>
              <span className="week-open-hint">{isSelected?'Fechar detalhes':'Ver semana'} <b>{isSelected?'↑':'→'}</b></span>
            </button>
          )
        })}
      </div>{selectedWeek&&(selectedWeek.trainingNumber||1)===training&&<WeekEditor selectedWeek={selectedWeek} exercises={exercises} updateExercise={updateExercise} addExercise={addExercise} removeExercise={removeExercise} saveWeek={saveWeek} completeSelectedWeek={completeSelectedWeek} canComplete={canComplete} saving={saving} completing={completing} feedback={feedback} close={()=>setSelectedWeek(null)}/>}</section>})}

    </div>
  )
}

function WeekEditor({selectedWeek,exercises,updateExercise,addExercise,removeExercise,saveWeek,completeSelectedWeek,canComplete,saving,completing,feedback,close}){return (
        <div className="week-details week-editor" id={`week-details-${selectedWeek.id}`}>
          <div className="details-header">
            <div>
              <span className="weeks-kicker">{selectedWeek.isCompleted ? 'Semana concluída' : 'Preenchimento manual'}</span>
              <h3>Semana {selectedWeek.weekNumber}</h3>
              <p>{dateFormatter.format(new Date(selectedWeek.startDate))} a {dateFormatter.format(new Date(selectedWeek.endDate))} · segunda a sexta</p>
            </div>
            <button className="close-btn" onClick={close} aria-label="Fechar">×</button>
          </div>

          {!selectedWeek.isReleased && <div className="week-locked-notice" role="status"><strong>Semana ainda bloqueada</strong><p>Esta semana será liberada automaticamente na segunda-feira correspondente, às 00:00, ou poderá ser antecipada pela professora.</p></div>}

          {selectedWeek.isReleased && <div className="manual-exercises">
            <div className="manual-exercises-heading">
              <div><strong>Exercícios realizados</strong><span>Informe exercício, tipo, carga e repetições. Observações são opcionais.</span></div>
              {!selectedWeek.isCompleted && <button type="button" onClick={addExercise}>+ Adicionar exercício</button>}
            </div>

            {exercises.map((exercise, index) => (
              <div className="manual-exercise-row" key={exercise.id || index}>
                <span className="manual-exercise-index">{index + 1}</span>
                <input disabled={selectedWeek.isCompleted} value={exercise.exerciseName || ''} onChange={(e) => updateExercise(index, 'exerciseName', e.target.value)} placeholder="Exercício" />
                <input disabled={selectedWeek.isCompleted} value={exercise.trainingType || ''} onChange={(e) => updateExercise(index, 'trainingType', e.target.value)} placeholder="Tipo de treino" />
                <input disabled={selectedWeek.isCompleted} value={exercise.weight || ''} onChange={(e) => updateExercise(index, 'weight', e.target.value)} placeholder="Carga (kg)" />
                <input disabled={selectedWeek.isCompleted} value={exercise.reps || ''} onChange={(e) => updateExercise(index, 'reps', e.target.value)} placeholder="Repetições" />
                <input disabled={selectedWeek.isCompleted} value={exercise.notes || ''} onChange={(e) => updateExercise(index, 'notes', e.target.value)} placeholder="Observação (opcional)" />
                {!selectedWeek.isCompleted && <button className="manual-remove" type="button" onClick={() => removeExercise(index)} aria-label="Remover exercício">×</button>}
              </div>
            ))}
          </div>}

          {selectedWeek.observation?.teacherNote && <div className="week-teacher-feedback"><strong>Feedback da professora</strong><p>{selectedWeek.observation.teacherNote}</p></div>}
          {feedback && <div className="week-action-feedback">{feedback}</div>}

          {selectedWeek.isReleased && !selectedWeek.isCompleted && (
            <div className="week-editor-actions">
              <button type="button" className="week-save" onClick={saveWeek} disabled={saving || completing}>{saving ? 'Salvando...' : 'Salvar preenchimento'}</button>
              <button type="button" className="week-complete" onClick={completeSelectedWeek} disabled={!canComplete || saving || completing}>{completing ? 'Concluindo...' : 'Concluir semana'}</button>
            </div>
          )}
        </div>)}
