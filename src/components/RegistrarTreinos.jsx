import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './RegistrarTreinos.css'

export default function RegistrarTreinos({ isOpen, onClose, studentId, token }) {
  const [weeks, setWeeks] = useState([])
  const [weekData, setWeekData] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchWeeks()
    }
  }, [isOpen, studentId])

  async function fetchWeeks() {
    setLoading(true)
    try {
      const response = await api.get(`/tracking/student/${studentId}/weeks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const releasedWeeks = response.data.filter(w => w.isReleased || w.isCompleted)
      setWeeks(releasedWeeks)

      // Preparar dados das semanas
      const data = {}
      releasedWeeks.forEach(week => {
        data[week.id] = {
          exercises: week.exercises || [],
          isCompleted: week.isCompleted
        }
      })
      setWeekData(data)
    } catch (error) {
      console.error('Erro ao buscar semanas', error)
      alert('❌ Erro ao carregar as semanas')
    } finally {
      setLoading(false)
    }
  }

  function handleExerciseChange(weekId, exerciseIndex, field, value) {
    setWeekData(prev => {
      const updated = { ...prev }
      if (updated[weekId] && updated[weekId].exercises[exerciseIndex]) {
        updated[weekId].exercises[exerciseIndex][field] = value
      }
      return updated
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Salvar exercícios de cada semana
      for (let weekId in weekData) {
        if (weekData[weekId].exercises.length > 0) {
          await api.post(
            `/tracking/exercise/save`,
            { 
              weekId,
              exercises: weekData[weekId].exercises 
            },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        }
      }
      alert('✅ Treinos registrados com sucesso!')
      onClose()
    } catch (error) {
      console.error('Erro ao salvar treinos', error)
      alert('❌ Erro ao salvar treinos')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📝 Registre Seus Treinos - Todas as Semanas</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="modal-body">
            <div className="loading">Carregando semanas...</div>
          </div>
        ) : weeks.length === 0 ? (
          <div className="modal-body">
            <div className="empty-state">
              <p>Nenhuma semana liberada ainda</p>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-body spreadsheet-container">
              <div className="info-banner">
                💡 Preencha os pesos e repetições de cada exercício. Role horizontalmente para ver mais semanas.
              </div>

              <div className="spreadsheet-wrapper">
                <div className="spreadsheet-scroll">
                  {weeks.map(week => (
                    <div key={week.id} className="week-column">
                      <div className="week-header">
                        <div className="week-title">Semana {week.weekNumber}</div>
                        <div className="week-status">
                          {weekData[week.id]?.isCompleted ? '✅' : '🟢'}
                        </div>
                      </div>

                      <div className="exercises-column">
                        {!weekData[week.id] || weekData[week.id].exercises.length === 0 ? (
                          <div className="no-exercises">
                            <p>Sem exercícios</p>
                          </div>
                        ) : (
                          weekData[week.id].exercises.map((exercise, index) => (
                            <div key={exercise.id || index} className="exercise-item">
                              <div className="exercise-name">{exercise.exerciseName}</div>
                              <div className="exercise-type">{exercise.trainingType}</div>

                              <div className="input-group">
                                <input
                                  type="text"
                                  placeholder="kg"
                                  value={exercise.weight || ''}
                                  onChange={(e) => handleExerciseChange(week.id, index, 'weight', e.target.value)}
                                  className="input-weight"
                                />
                              </div>

                              <div className="input-group">
                                <input
                                  type="text"
                                  placeholder="reps"
                                  value={exercise.reps || ''}
                                  onChange={(e) => handleExerciseChange(week.id, index, 'reps', e.target.value)}
                                  className="input-reps"
                                />
                              </div>

                              <div className="input-group full">
                                <input
                                  type="text"
                                  placeholder="notas"
                                  value={exercise.notes || ''}
                                  onChange={(e) => handleExerciseChange(week.id, index, 'notes', e.target.value)}
                                  className="input-notes"
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancelar"
                onClick={onClose}
              >
                ✕ Cancelar
              </button>
              <button 
                className="btn-salvar"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '⏳ Salvando...' : '✅ Salvar Treinos'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}