import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import './AdminTracking.css'

export default function AdminTracking({ token }) {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [teacherNotes, setTeacherNotes] = useState({})

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/tracking/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(response.data)
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
      alert('Erro ao carregar dados dos alunos')
    } finally {
      setLoading(false)
    }
  }

  const selectStudent = (student) => {
    setSelectedStudent(student)
    if (student.weeklyTrackings && student.weeklyTrackings.length > 0) {
      setSelectedWeek(student.weeklyTrackings[0])
    }
    setTeacherNotes({})
  }

  const selectWeek = (week) => {
    setSelectedWeek(week)
    setTeacherNotes({})
  }

  const handleTeacherNoteChange = (exerciseId, note) => {
    setTeacherNotes({
      ...teacherNotes,
      [exerciseId]: note
    })
  }

  const handleSaveTeacherNote = async (weekId) => {
    try {
      setSaving(true)
      
      // Itera sobre todas as notas e salva
      for (const [exerciseId, note] of Object.entries(teacherNotes)) {
        if (note) {
          await api.put(
            '/tracking/note/teacher',
            {
              weeklyTrackingId: weekId,
              teacherNote: note
            },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        }
      }

      alert('✅ Observações salvas com sucesso!')
      setTeacherNotes({})
      loadStudents()
    } catch (error) {
      console.error('Erro ao salvar observações:', error)
      alert('❌ Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="admin-tracking-loading">Carregando dados...</div>
  }

  return (
    <div className="admin-tracking-container">
      <div className="admin-tracking-header">
        <h2>👨‍🏫 Acompanhamento dos Alunos</h2>
        <p>Visualize o progresso e deixe feedback</p>
      </div>

      <div className="admin-tracking-content">
        {/* SIDEBAR - LISTA DE ALUNOS */}
        <div className="admin-students-sidebar">
          <h3>Alunos Aprovados</h3>
          <div className="students-list">
            {students.length === 0 ? (
              <p className="no-students">Nenhum aluno aprovado</p>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className={`student-item ${selectedStudent?.id === student.id ? 'active' : ''}`}
                  onClick={() => selectStudent(student)}
                >
                  <div className="student-item-header">
                    {student.profilePhoto ? (
                      <img
                        src={student.profilePhoto}
                        alt={student.name}
                        className="student-item-photo"
                      />
                    ) : (
                      <div className="student-item-photo-placeholder">👤</div>
                    )}
                    <div className="student-item-info">
                      <p className="student-item-name">{student.name}</p>
                      <p className="student-item-email">{student.email}</p>
                    </div>
                  </div>
                  {student.ranking && (
                    <div className="student-item-stats">
                      <span className="badge">{student.ranking.totalPoints} pts</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}
        {selectedStudent && (
          <div className="admin-tracking-main">
            {/* HEADER DO ALUNO */}
            <div className="selected-student-header">
              {selectedStudent.profilePhoto ? (
                <img
                  src={selectedStudent.profilePhoto}
                  alt={selectedStudent.name}
                  className="selected-student-photo"
                />
              ) : (
                <div className="selected-student-photo-placeholder">👤</div>
              )}
              <div className="selected-student-info">
                <h2>{selectedStudent.name}</h2>
                <p>{selectedStudent.email}</p>
                {selectedStudent.ranking && (
                  <p className="student-points">
                    💰 {selectedStudent.ranking.totalPoints} pontos •{' '}
                    {selectedStudent.ranking.weeksCompleted} semanas completas
                  </p>
                )}
              </div>
            </div>

            {/* SELETOR DE SEMANAS */}
            {selectedStudent.weeklyTrackings && selectedStudent.weeklyTrackings.length > 0 && (
              <div className="weeks-selector-admin">
                {selectedStudent.weeklyTrackings.map((week) => (
                  <button
                    key={week.id}
                    className={`week-btn-admin ${selectedWeek?.id === week.id ? 'active' : ''}`}
                    onClick={() => selectWeek(week)}
                  >
                    <span>Semana {week.weekNumber}</span>
                    {week.isCompleted && <span className="completed-badge">✅</span>}
                  </button>
                ))}
              </div>
            )}

            {/* DETALHES DA SEMANA */}
            {selectedWeek && (
              <div className="week-details-admin">
                <div className="week-header-admin">
                  <h3>Semana {selectedWeek.weekNumber}</h3>
                  <p className="week-dates">
                    {new Date(selectedWeek.startDate).toLocaleDateString('pt-BR')} -{' '}
                    {new Date(selectedWeek.endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* OBSERVAÇÃO DO ALUNO */}
                {selectedWeek.observation?.studentNote && (
                  <div className="observation-box student-obs">
                    <h4>📝 Observação do Aluno</h4>
                    <p>{selectedWeek.observation.studentNote}</p>
                  </div>
                )}

                {/* EXERCÍCIOS */}
                {selectedWeek.exercises && selectedWeek.exercises.length > 0 ? (
                  <div className="exercises-grid-admin">
                    {selectedWeek.exercises.map((exercise) => (
                      <div key={exercise.id} className="exercise-box-admin">
                        <div className="exercise-header-admin">
                          <h4>{exercise.exerciseName}</h4>
                          <span className="training-type-admin">{exercise.trainingType}</span>
                        </div>

                        <div className="exercise-data">
                          <div className="data-item">
                            <span className="label">Cargas:</span>
                            <span className="value">{exercise.reps || '—'}</span>
                          </div>
                          <div className="data-item">
                            <span className="label">Peso:</span>
                            <span className="value">{exercise.weight || '—'}</span>
                          </div>
                        </div>

                        {exercise.notes && (
                          <div className="exercise-notes">
                            <small>Obs: {exercise.notes}</small>
                          </div>
                        )}

                        <textarea
                          placeholder="Deixe um feedback para este exercício..."
                          className="teacher-feedback"
                          defaultValue={teacherNotes[exercise.id] || ''}
                          onChange={(e) => handleTeacherNoteChange(exercise.id, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-exercises-admin">Nenhum exercício registrado</p>
                )}

                {/* OBSERVAÇÃO GERAL DO PROFESSOR */}
                {selectedWeek.observation && (
                  <div className="teacher-general-note">
                    <h4>📌 Feedback Geral da Semana</h4>
                    <textarea
                      placeholder="Deixe um feedback geral para esta semana..."
                      defaultValue={selectedWeek.observation.teacherNote || ''}
                      onChange={(e) => setTeacherNotes({
                        ...teacherNotes,
                        general: e.target.value
                      })}
                      className="teacher-general-textarea"
                    />
                  </div>
                )}

                {/* BOTÃO SALVAR */}
                <button
                  className="save-teacher-notes-btn"
                  onClick={() => handleSaveTeacherNote(selectedWeek.id)}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : '✅ Salvar Observações'}
                </button>
              </div>
            )}
          </div>
        )}

        {!selectedStudent && (
          <div className="no-selection">
            <p>Selecione um aluno para ver o progresso</p>
          </div>
        )}
      </div>
    </div>
  )
}