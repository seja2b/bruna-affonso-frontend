import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import './StudentWeeklyTracking.css'

export default function StudentWeeklyTracking({ studentId, token }) {
  const [weeks, setWeeks] = useState([])
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exercises, setExercises] = useState([])
  const [studentNote, setStudentNote] = useState('')
  const [profilePhoto, setProfilePhoto] = useState(null)

  useEffect(() => {
    if (!studentId) {
      console.error('studentId não foi passado!')
      return
    }
    loadWeeks()
  }, [studentId, token])

  const loadWeeks = async () => {
    try {
      setLoading(true)
      console.log('Carregando semanas para studentId:', studentId)
      
      const response = await api.get(`/tracking/student/${studentId}/weeks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('Semanas carregadas:', response.data)
      setWeeks(response.data)
      
      if (response.data.length > 0) {
        selectWeek(response.data[0])
      }
    } catch (error) {
      console.error('Erro ao carregar semanas:', error.response?.data || error.message)
      alert('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const selectWeek = (week) => {
    setSelectedWeek(week)
    setExercises(week.exercises || [])
    setStudentNote(week.observation?.studentNote || '')
  }

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...exercises]
    newExercises[index] = { ...newExercises[index], [field]: value }
    setExercises(newExercises)
  }

  const handleSaveExercise = async (exercise, index) => {
    try {
      setSaving(true)
      await api.post(
        '/tracking/exercise/save',
        {
          weeklyTrackingId: selectedWeek.id,
          exerciseName: exercise.exerciseName,
          trainingType: exercise.trainingType,
          weight: exercise.weight,
          reps: exercise.reps,
          notes: exercise.notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('✅ Exercício salvo com sucesso!')
      loadWeeks()
    } catch (error) {
      console.error('Erro ao salvar exercício:', error)
      alert('❌ Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNote = async () => {
    try {
      setSaving(true)
      await api.put(
        '/tracking/note/student',
        {
          weeklyTrackingId: selectedWeek.id,
          studentNote
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('✅ Observação salva!')
      loadWeeks()
    } catch (error) {
      console.error('Erro ao salvar nota:', error)
      alert('❌ Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        setSaving(true)
        const base64 = event.target.result
        
        await api.put(
          `/tracking/profile-photo/${studentId}`,
          { profilePhoto: base64 },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        setProfilePhoto(base64)
        alert('✅ Foto atualizada!')
      } catch (error) {
        console.error('Erro ao fazer upload:', error)
        alert('❌ Erro ao fazer upload')
      } finally {
        setSaving(false)
      }
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return <div className="tracking-loading">Carregando semanas...</div>
  }

  if (weeks.length === 0) {
    return <div className="tracking-loading">Nenhuma semana disponível</div>
  }

  return (
    <div className="weekly-tracking-container">
      {/* PERFIL DO ALUNO */}
      <div className="student-profile-section">
        <div className="profile-photo-wrapper">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Foto do perfil" className="profile-photo" />
          ) : (
            <div className="profile-photo-placeholder">📷</div>
          )}
          <label className="photo-upload-label">
            Adicionar Foto
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* SELETOR DE SEMANAS */}
      <div className="weeks-selector">
        {weeks.map((week) => (
          <button
            key={week.id}
            className={`week-btn ${selectedWeek?.id === week.id ? 'active' : ''} ${
              week.isReleased ? '' : 'blocked'
            }`}
            onClick={() => selectWeek(week)}
            disabled={!week.isReleased}
            title={!week.isReleased ? 'Semana não liberada' : ''}
          >
            <span className="week-number">Semana {week.weekNumber}</span>
            <span className="week-status">
              {!week.isReleased && '🔒'}
              {week.isCompleted && '✅'}
            </span>
          </button>
        ))}
      </div>

      {/* PROGRESSO DA SEMANA */}
      {selectedWeek && (
        <div className="week-progress">
          <h3>Progresso da Semana {selectedWeek.weekNumber}</h3>
          <div className="progress-info">
            <p>
              {selectedWeek.exercises.filter((e) => e.weight && e.reps).length} de{' '}
              {selectedWeek.exercises.length} exercícios completos
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    selectedWeek.exercises.length > 0
                      ? (selectedWeek.exercises.filter((e) => e.weight && e.reps).length /
                          selectedWeek.exercises.length) *
                        100
                      : 0
                  }%`
                }}
              />
            </div>
            {selectedWeek.isCompleted && (
              <p className="completed-badge">✅ Semana Completa! +100 pontos ganhos</p>
            )}
          </div>
        </div>
      )}

      {/* EXERCÍCIOS */}
      {selectedWeek && (
        <div className="exercises-section">
          <h3>Exercícios da Semana {selectedWeek.weekNumber}</h3>
          {exercises.length === 0 ? (
            <p className="no-exercises">Nenhum exercício para esta semana</p>
          ) : (
            <div className="exercises-list">
              {exercises.map((exercise, index) => (
                <div key={index} className="exercise-card">
                  <div className="exercise-header">
                    <h4>{exercise.exerciseName}</h4>
                    <span className="training-type">{exercise.trainingType}</span>
                  </div>

                  <div className="exercise-inputs">
                    <div className="input-group">
                      <label>Cargas / Repetições</label>
                      <input
                        type="text"
                        placeholder="Ex: 3x8"
                        value={exercise.reps || ''}
                        onChange={(e) =>
                          handleExerciseChange(index, 'reps', e.target.value)
                        }
                      />
                    </div>

                    <div className="input-group">
                      <label>Peso</label>
                      <input
                        type="text"
                        placeholder="Ex: 10kg"
                        value={exercise.weight || ''}
                        onChange={(e) =>
                          handleExerciseChange(index, 'weight', e.target.value)
                        }
                      />
                    </div>

                    <div className="input-group full-width">
                      <label>Observações</label>
                      <textarea
                        placeholder="Como foi o exercício?"
                        value={exercise.notes || ''}
                        onChange={(e) =>
                          handleExerciseChange(index, 'notes', e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <button
                    className="save-exercise-btn"
                    onClick={() => handleSaveExercise(exercise, index)}
                    disabled={saving}
                  >
                    {saving ? 'Salvando...' : '💾 Salvar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OBSERVAÇÃO DO ALUNO */}
      {selectedWeek && (
        <div className="student-note-section">
          <h3>Minhas Observações</h3>
          <textarea
            placeholder="Como você se sentiu nesta semana?"
            value={studentNote}
            onChange={(e) => setStudentNote(e.target.value)}
            className="student-note-input"
          />
          <button
            className="save-note-btn"
            onClick={handleSaveNote}
            disabled={saving}
          >
            {saving ? 'Salvando...' : '📝 Salvar Observação'}
          </button>
        </div>
      )}

      {/* OBSERVAÇÃO DO PROFESSOR */}
      {selectedWeek?.observation?.teacherNote && (
        <div className="teacher-note-section">
          <h3>Observação da Professora</h3>
          <div className="teacher-note-display">
            {selectedWeek.observation.teacherNote}
          </div>
        </div>
      )}
    </div>
  )
}