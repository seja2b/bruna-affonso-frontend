import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminTracking.css'

export default function AdminTracking({ token }) {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [weeks, setWeeks] = useState([])
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [weekData, setWeekData] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    try {
      const response = await api.get('/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(response.data.filter(s => s.status === 'APPROVED'))
    } catch (error) {
      console.error('Erro ao buscar alunos', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleStudentSelect(studentId) {
    setSelectedStudent(studentId)
    setSelectedWeek(null)
    setWeekData(null)
    setAdminNote('')
    
    try {
      const response = await api.get(`/tracking/weeks/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWeeks(response.data)
    } catch (error) {
      console.error('Erro ao buscar semanas', error)
    }
  }

  async function handleWeekSelect(weekId) {
    setSelectedWeek(weekId)
    try {
      const response = await api.get(`/tracking/week/${weekId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWeekData(response.data)
      setAdminNote(response.data.observation?.teacherNote || '')
    } catch (error) {
      console.error('Erro ao buscar dados da semana', error)
    }
  }

  async function handleSaveAdminNote() {
    if (!selectedWeek) {
      alert('❌ Selecione uma semana!')
      return
    }

    setSaving(true)
    try {
      await api.put(
        `/tracking/week/${selectedWeek}/observation`,
        { teacherNote: adminNote },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('✅ Observação da professora salva com sucesso!')
      handleWeekSelect(selectedWeek)
    } catch (error) {
      console.error('Erro ao salvar observação', error)
      alert('❌ Erro ao salvar observação')
    } finally {
      setSaving(false)
    }
  }

  const studentName = students.find(s => s.id === selectedStudent)?.name

  if (loading) {
    return <div className="loading">Carregando...</div>
  }

  return (
    <div className="admin-tracking">
      <div className="tracking-header">
        <h2>📋 Acompanhamento de Treinos</h2>
        <p>Visualize os treinos dos alunos e deixe suas observações</p>
      </div>

      <div className="tracking-container">
        {/* LISTA DE ALUNOS */}
        <div className="students-list-section">
          <h3>👥 Selecione um Aluno</h3>
          <div className="students-list">
            {students.map(student => (
              <button
                key={student.id}
                className={`student-item ${selectedStudent === student.id ? 'active' : ''}`}
                onClick={() => handleStudentSelect(student.id)}
              >
                <span className="student-avatar">👤</span>
                <div className="student-info">
                  <div className="student-name">{student.name}</div>
                  <div className="student-email">{student.email}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="tracking-content">
          {!selectedStudent ? (
            <div className="empty-placeholder">
              <p>📌 Selecione um aluno para ver seus treinos</p>
            </div>
          ) : !selectedWeek ? (
            <div className="weeks-section">
              <h3>📅 {studentName} - Selecione uma Semana</h3>
              
              {weeks.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhuma semana encontrada</p>
                </div>
              ) : (
                <div className="weeks-grid">
                  {weeks.map(week => (
                    <button
                      key={week.id}
                      className={`week-card ${week.isCompleted ? 'completed' : ''}`}
                      onClick={() => handleWeekSelect(week.id)}
                    >
                      <div className="week-icon">
                        {week.isCompleted ? '✅' : week.isReleased ? '🟢' : '🔒'}
                      </div>
                      <div className="week-label">Semana {week.weekNumber}</div>
                      {week.isCompleted && (
                        <div className="week-badge">Completa</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="week-details-section">
              <button 
                className="btn-voltar-semanas"
                onClick={() => {
                  setSelectedWeek(null)
                  setWeekData(null)
                  setAdminNote('')
                }}
              >
                ← Voltar para Semanas
              </button>

              <h3>Semana {weeks.find(w => w.id === selectedWeek)?.weekNumber} - {studentName}</h3>

              {/* EXERCÍCIOS DO ALUNO */}
              <div className="week-exercises-card">
                <h4>📝 Exercícios Registrados</h4>
                
                {!weekData || weekData.exercises.length === 0 ? (
                  <div className="empty-exercises">
                    <p>Nenhum exercício registrado ainda</p>
                  </div>
                ) : (
                  <div className="exercises-table">
                    <div className="table-header">
                      <div>Exercício</div>
                      <div>Tipo</div>
                      <div>Peso</div>
                      <div>Reps</div>
                      <div>Notas</div>
                    </div>
                    {weekData.exercises.map((exercise, index) => (
                      <div key={exercise.id} className="table-row">
                        <div className="col-exercise">
                          <strong>{exercise.exerciseName}</strong>
                        </div>
                        <div className="col-type">{exercise.trainingType}</div>
                        <div className="col-weight">{exercise.weight || '-'} kg</div>
                        <div className="col-reps">{exercise.reps || '-'}</div>
                        <div className="col-notes">{exercise.notes || '-'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* OBSERVAÇÃO DO ALUNO */}
              {weekData?.observation?.studentNote && (
                <div className="student-observation-card">
                  <h4>💬 Observação do Aluno</h4>
                  <div className="observation-text">
                    {weekData.observation.studentNote}
                  </div>
                </div>
              )}

              {/* OBSERVAÇÃO DA PROFESSORA */}
              <div className="admin-observation-card">
                <h4>📝 Sua Observação (Professora)</h4>
                <textarea
                  className="admin-note-textarea"
                  placeholder="Deixe seu feedback sobre o treino do aluno..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows="5"
                />
                <div className="char-count">
                  {adminNote.length} caracteres
                </div>
                <button 
                  className="btn-salvar-nota"
                  onClick={handleSaveAdminNote}
                  disabled={saving}
                >
                  {saving ? '⏳ Salvando...' : '✅ Salvar Observação'}
                </button>

                {weekData?.observation?.teacherNote && (
                  <div className="admin-note-preview">
                    <div className="preview-label">Observação atual:</div>
                    <div className="preview-text">{weekData.observation.teacherNote}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}