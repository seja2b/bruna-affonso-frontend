import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './DeixarObservacoes.css'

export default function DeixarObservacoes({ isOpen, onClose, studentId, token }) {
  const [weeks, setWeeks] = useState([])
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [observation, setObservation] = useState('')
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
      setWeeks(response.data.filter(w => w.isReleased || w.isCompleted))
    } catch (error) {
      console.error('Erro ao buscar semanas', error)
      alert('❌ Erro ao carregar as semanas')
    } finally {
      setLoading(false)
    }
  }

  async function handleWeekSelect(week) {
    setSelectedWeek(week.id)
    setObservation(week.studentNote || '')
  }

  async function handleSave() {
    if (!selectedWeek) {
      alert('❌ Selecione uma semana!')
      return
    }

    setSaving(true)
    try {
      await api.put(
        `/tracking/note/student`,
        { 
          weekId: selectedWeek,
          studentNote: observation 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('✅ Observação salva com sucesso!')
      onClose()
    } catch (error) {
      console.error('Erro ao salvar observação', error)
      alert('❌ Erro ao salvar observação')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💬 Deixe Suas Observações</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {!selectedWeek ? (
          <div className="modal-body">
            <p className="modal-text">Selecione a semana para deixar suas observações:</p>
            
            {loading ? (
              <div className="loading">Carregando semanas...</div>
            ) : weeks.length === 0 ? (
              <div className="empty-state">
                <p>Nenhuma semana disponível</p>
              </div>
            ) : (
              <div className="weeks-list">
                {weeks.map(week => (
                  <button
                    key={week.id}
                    className="week-option"
                    onClick={() => handleWeekSelect(week)}
                  >
                    <span className="week-badge">
                      {week.isCompleted ? '✅' : '🟢'}
                    </span>
                    <span className="week-text">Semana {week.weekNumber}</span>
                    <span className="week-arrow">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="modal-body">
            <div className="back-button">
              <button 
                onClick={() => setSelectedWeek(null)}
                className="btn-voltar"
              >
                ← Voltar para Semanas
              </button>
            </div>

            <h3>Observações - Semana {weeks.find(w => w.id === selectedWeek)?.weekNumber}</h3>

            <div className="observation-section">
              <p className="observation-hint">
                💭 Como você se sentiu nesta semana? Teve dificuldades? 
                Quer compartilhar algo com sua personal?
              </p>

              <textarea
                className="observation-textarea"
                placeholder="Digite suas observações aqui..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows="8"
              />

              <div className="char-count">
                {observation.length} caracteres
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancelar"
                onClick={() => setSelectedWeek(null)}
              >
                ← Voltar
              </button>
              <button 
                className="btn-salvar"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '⏳ Salvando...' : '✅ Salvar Observação'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}