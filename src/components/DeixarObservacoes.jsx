import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './DeixarObservacoes.css'

export default function DeixarObservacoes({ isOpen, onClose, studentId, token }) {
  const [weeks, setWeeks] = useState([])
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [studentNote, setStudentNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Carregar semanas
  useEffect(() => {
    if (isOpen && studentId) {
      fetchWeeks()
    }
  }, [isOpen, studentId])

  const fetchWeeks = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/tracking/weeks/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWeeks(response.data)
      if (response.data.length > 0) {
        setSelectedWeek(response.data[0])
        fetchObservation(response.data[0].id)
      }
    } catch (error) {
      console.error('Erro ao carregar semanas:', error)
      setMessage('Erro ao carregar semanas')
    } finally {
      setLoading(false)
    }
  }

  const fetchObservation = async (weeklyTrackingId) => {
    try {
      const response = await api.get(`/tracking/note/${weeklyTrackingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudentNote(response.data.studentNote || '')
    } catch (error) {
      console.error('Erro ao carregar observação:', error)
      setStudentNote('')
    }
  }

  const handleWeekChange = (weekId) => {
    const week = weeks.find(w => w.id === weekId)
    setSelectedWeek(week)
    fetchObservation(weekId)
  }

  const handleSave = async () => {
    if (!selectedWeek) {
      setMessage('Selecione uma semana')
      return
    }

    try {
      setLoading(true)
      
      await api.put(
        `/tracking/note/student`,
        {
          weeklyTrackingId: selectedWeek.id,
          studentNote: studentNote
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('✅ Observação salva com sucesso!')
      setTimeout(() => {
        onClose()
        setMessage('')
      }, 1500)
    } catch (error) {
      console.error('Erro ao salvar observação:', error)
      setMessage('❌ Erro ao salvar observação')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content deixar-observacoes-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💬 Deixe suas Observações</h2>
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
                    Semana {week.weekNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Textarea para Observação */}
            {selectedWeek && (
              <div className="observation-input">
                <label>Sua Observação (Semana {selectedWeek.weekNumber}):</label>
                <textarea
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Como você se sentiu? Teve alguma dificuldade? Deixe suas observações aqui..."
                  rows="6"
                  maxLength="500"
                />
                <div className="char-count">{studentNote.length}/500</div>
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
                💾 Salvar Observação
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
