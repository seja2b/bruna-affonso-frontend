import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminTracking.css'

export default function AdminTracking({ token }) {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [weeks, setWeeks] = useState([])
  const [exercises, setExercises] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [teacherNote, setTeacherNote] = useState('')
  const [selectedWeek, setSelectedWeek] = useState(null)

  useEffect(() => {
    fetchApprovedStudents()
  }, [])

  const fetchApprovedStudents = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/tracking/students', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(response.data)
    } catch (err) {
      console.error('Erro ao carregar alunos:', err)
      setError('Erro ao carregar alunos')
    } finally {
      setLoading(false)
    }
  }

  const handleStudentSelect = async (studentId) => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/tracking/weeks/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWeeks(response.data)
      setSelectedStudent(studentId)
      setExercises({})
      
      // Carregar exercícios de cada semana
      response.data.forEach(week => {
        fetchExercisesForWeek(week.id)
      })
    } catch (err) {
      console.error('Erro ao carregar semanas:', err)
      setError('Erro ao carregar semanas do aluno')
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

  const handleWeekSelect = async (weekId) => {
    setSelectedWeek(weekId)
    try {
      const response = await api.get(`/tracking/note/${weekId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTeacherNote(response.data.teacherNote || '')
    } catch (err) {
      console.error('Erro ao carregar observação:', err)
      setTeacherNote('')
    }
  }

  const handleSaveTeacherNote = async () => {
    if (!selectedWeek) {
      setError('Selecione uma semana')
      return
    }

    try {
      setLoading(true)
      await api.put(
        `/tracking/note/teacher`,
        {
          weeklyTrackingId: selectedWeek,
          teacherNote: teacherNote
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setError('')
      alert('✅ Observação salva com sucesso!')
    } catch (err) {
      console.error('Erro ao salvar observação:', err)
      setError('Erro ao salvar observação')
    } finally {
      setLoading(false)
    }
  }

  if (loading && students.length === 0) {
    return (
      <div className="admin-tracking-loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="admin-tracking">
      <h2>📊 Acompanhamento de Alunos</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-layout">
        {/* LISTA DE ALUNOS */}
        <div className="students-list">
          <h3>Alunos Aprovados</h3>
          <div className="students-container">
            {students.length > 0 ? (
              students.map(student => (
                <div
                  key={student.id}
                  className={`student-item ${selectedStudent === student.id ? 'active' : ''}`}
                  onClick={() => handleStudentSelect(student.id)}
                >
                  <span className="student-name">{student.name}</span>
                  <span className="student-email">{student.email}</span>
                </div>
              ))
            ) : (
              <p className="no-students">Nenhum aluno aprovado</p>
            )}
          </div>
        </div>

        {/* TRACKING DO ALUNO SELECIONADO */}
        <div className="tracking-details">
          {selectedStudent ? (
            <>
              <h3>Semanas do Aluno</h3>
              <div className="weeks-tabs">
                {weeks.length > 0 ? (
                  weeks.map(week => (
                    <button
                      key={week.id}
                      className={`week-tab ${selectedWeek === week.id ? 'active' : ''}`}
                      onClick={() => handleWeekSelect(week.id)}
                    >
                      Semana {week.weekNumber}
                    </button>
                  ))
                ) : (
                  <p>Sem semanas disponíveis</p>
                )}
              </div>

              {selectedWeek && (
                <>
                  <h4>Exercícios - Semana {weeks.find(w => w.id === selectedWeek)?.weekNumber}</h4>
                  <div className="exercises-display">
                    {exercises[selectedWeek]?.length > 0 ? (
                      <table className="admin-exercises-table">
                        <thead>
                          <tr>
                            <th>Exercício</th>
                            <th>Carga (kg)</th>
                            <th>Repetições</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercises[selectedWeek].map((ex, idx) => (
                            <tr key={idx}>
                              <td>{ex.exerciseName}</td>
                              <td>{ex.weight || '-'}</td>
                              <td>{ex.reps || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-exercises">Nenhum exercício registrado</p>
                    )}
                  </div>

                  <h4>Deixar Observação</h4>
                  <div className="teacher-note-section">
                    <textarea
                      value={teacherNote}
                      onChange={(e) => setTeacherNote(e.target.value)}
                      placeholder="Digite sua observação sobre o desempenho do aluno..."
                      rows="6"
                      maxLength="500"
                    />
                    <div className="char-count">{teacherNote.length}/500</div>
                    <button
                      onClick={handleSaveTeacherNote}
                      className="save-btn"
                      disabled={loading}
                    >
                      💾 Salvar Observação
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="select-student">Selecione um aluno para ver os detalhes</p>
          )}
        </div>
      </div>
    </div>
  )
}
