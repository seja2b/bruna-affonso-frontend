import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import './AdminStudentDetail.css'

export default function AdminStudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStudent() {
      try {
        setLoading(true)
        setError('')
        const response = await api.get(`/admin/students/${id}`)
        setStudent(response.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Não foi possível carregar este aluno.')
      } finally {
        setLoading(false)
      }
    }
    loadStudent()
  }, [id])

  const recentWeeks = useMemo(() => student?.weeks?.filter((week) => week.isReleased).slice(-6).reverse() || [], [student])

  if (loading) return <div className="admin-detail-state">Carregando perfil do aluno...</div>
  if (error || !student) return <div className="admin-detail-state error">{error || 'Aluno não encontrado.'}</div>

  const progress = student.metrics.totalWeeks
    ? Math.round((student.metrics.completedWeeks / student.metrics.totalWeeks) * 100)
    : 0

  return (
    <section className="admin-student-detail">
      <button className="detail-back" onClick={() => navigate('/admin/alunos')}>← Voltar para alunos</button>

      <div className="detail-hero">
        <div className="detail-avatar">
          {student.profilePhoto ? <img src={student.profilePhoto} alt={student.name} /> : student.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="detail-hero-copy">
          <span className={`status-pill ${student.status.toLowerCase()}`}>{student.status}</span>
          <h1>{student.name}</h1>
          <p>{student.email}</p>
          <small>{student.phone || 'Telefone não informado'} · cadastro em {new Date(student.createdAt).toLocaleDateString('pt-BR')}</small>
        </div>
      </div>

      <div className="detail-metrics-grid">
        <Metric label="Progresso" value={`${progress}%`} />
        <Metric label="Semanas concluídas" value={`${student.metrics.completedWeeks}/${student.metrics.totalWeeks}`} />
        <Metric label="Pontos" value={student.metrics.totalPoints} />
        <Metric label="Treinos concluídos" value={`${student.metrics.completedWorkouts}/${student.metrics.assignedWorkouts}`} />
        <Metric label="Perguntas pendentes" value={student.metrics.pendingQuestions} />
        <Metric label="Perguntas totais" value={student.metrics.totalQuestions} />
      </div>

      <div className="detail-grid-two">
        <section className="detail-card">
          <div className="detail-card-heading"><h2>Semanas recentes</h2><span>{student.metrics.releasedWeeks} liberadas</span></div>
          {recentWeeks.length === 0 ? (
            <p className="detail-empty">Nenhuma semana liberada ainda.</p>
          ) : (
            <div className="detail-week-list">
              {recentWeeks.map((week) => (
                <div key={week.id} className="detail-week-row">
                  <div><strong>Semana {week.weekNumber}</strong><small>{week.exercises.length} exercícios</small></div>
                  <span className={`week-state ${week.isCompleted ? 'done' : 'open'}`}>{week.isCompleted ? 'Concluída' : 'Em andamento'}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="detail-card">
          <div className="detail-card-heading"><h2>Perguntas</h2><span>{student.questions.length} registradas</span></div>
          {student.questions.length === 0 ? (
            <p className="detail-empty">Nenhuma pergunta registrada.</p>
          ) : (
            <div className="detail-question-list">
              {student.questions.slice(0, 6).map((question) => (
                <div key={question.id} className="detail-question-row">
                  <div><strong>{question.title || 'Pergunta'}</strong><p>{question.text}</p></div>
                  <span className={`question-state ${question.status.toLowerCase()}`}>{question.status === 'ANSWERED' ? 'Respondida' : 'Pendente'}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="detail-card">
        <div className="detail-card-heading"><h2>Treinos atribuídos</h2><span>{student.metrics.assignedWorkouts} no total</span></div>
        {student.workouts.length === 0 ? (
          <p className="detail-empty">Nenhum treino atribuído.</p>
        ) : (
          <div className="detail-workout-list">
            {student.workouts.map((item) => (
              <div key={item.id} className="detail-workout-row">
                <div><strong>{item.workout.title}</strong><small>{item.workout.module || (item.workout.week ? `Semana ${item.workout.week}` : 'Treino')}</small></div>
                <span>{item.completed ? 'Concluído' : `${item.progress || 0}%`}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

function Metric({ label, value }) {
  return <div className="detail-metric"><span>{label}</span><strong>{value}</strong></div>
}
