import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './RegistrarTreinos.css'

export default function RegistrarTreinos({ isOpen, onClose, studentId, token }) {
  const [weeks, setWeeks] = useState([])
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Carregar semanas liberadas
  useEffect(() => {
    if (isOpen && studentId) {
      fetchWeeks()
    }
  }, [isOpen, studentId])

  const fetchWeeks = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/tracking/student/${studentId}/weeks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWeeks(response.data)
      if (response.data.length > 0) {
        setSelectedWeek(response.data[0])
        fetchExercises(response.data[0].id)
      }
    } catch (error) {
      console.error('Erro ao carregar semanas:', error)
      setMessage('Erro ao carregar semanas')
    } finally {
      setLoading(false)
    }
  }

  const fetchExercises = async (weeklyTrackingId) => {
    try {
      const response = await api.get(`/tracking/exercises/${weeklyTrackingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setExercises(response.data)
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error)
      setExercises([])
    }
  }

  const handleWeekChange = (weekId) => {
    const week = weeks.find(w => w.id === weekId)
    setSelectedWeek(week)
    fetchExercises(weekId)
  }

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...exercises]
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    }
    setExercises(updatedExercises)
  }

  const handleSave = async () => {
    if (!selectedWeek) {
      setMessage('Selecione uma semana')
      return
    }

    // Validar se pelo menos um exercício foi preenchido
    const hasData = exercises.some(ex => ex.weight || ex.reps)
    if (!hasData) {
      setMessage('Preencha pelo menos um exercício')
      return
    }

    try {
      setLoading(true)
      
      // Salvar exercícios
      await api.put(
        `/tracking/exercises/${selectedWeek.id}`,
        { exercises },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('✅ Treinos registrados com sucesso!')
      setTimeout(() => {
        onClose()
        setMessage('')
      }, 1500)
    } catch (error) {
      console.error('Erro ao salvar exercícios:', error)
      setMessage('❌ Erro ao salvar treinos')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content registrar-treinos-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📝 Registre seus Treinos</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading && <div className="loading">Carregando...</div>}

        {!loading && (
          <>
            {/* Seletor de Semana */}
            <div className="week-selector">
              <label>Selecione a Semana:</label>
              <select 
                value={selectedWeek?.id || ''} 
                onChange={(e) => handleWeekChange(e.target.value)}
                disabled={weeks.length === 0}
              >
                <option value="">-- Selecione --</option>
                {weeks.map(week => (
                  <option key={week.id} value={week.id}>
                    Semana {week.weekNumber} {!week.isReleased ? '🔒 (Bloqueada)' : '🔓 (Liberada)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Tabela de Exercícios */}
            {selectedWeek && (
              <div className="exercises-table">
                <h3>Exercícios - Semana {selectedWeek.weekNumber}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Exercício</th>
                      <th>Carga (kg)</th>
                      <th>Repetições</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercises.length > 0 ? (
                      exercises.map((exercise, index) => (
                        <tr key={index}>
                          <td>{exercise.exerciseName}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={exercise.weight || ''}
                              onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={exercise.reps || ''}
                              onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="no-exercises">Nenhum exercício para esta semana</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {message && <div className="message">{message}</div>}

            {/* Botões */}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>Cancelar</button>
              <button 
                className="btn-save" 
                onClick={handleSave}
                disabled={loading || !selectedWeek}
              >
                💾 Salvar Treinos
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}