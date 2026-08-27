import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './AdminStudents.css'

const statusLabels = {
  APPROVED: 'Aprovado',
  PENDING: 'Pendente',
  REJECTED: 'Rejeitado',
  INACTIVE: 'Inativo'
}

export default function AdminStudents() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [feedback, setFeedback] = useState(null)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => { fetchStudents() }, [])

  async function fetchStudents() {
    try {
      setLoading(true)
      const response = await api.get('/admin/students')
      setStudents(response.data)
    } catch (error) {
      setFeedback({ type: 'error', message: 'Não foi possível carregar os alunos.' })
    } finally {
      setLoading(false)
    }
  }

  function openStudentWeeks(student) {
    if (!student.studentId || student.status !== 'APPROVED') {
      navigate(`/admin/alunos/${student.id}`)
      return
    }
    navigate(`/admin/acompanhamentos?student=${encodeURIComponent(student.studentId)}`)
  }

  async function runAction(studentId, action, successMessage) {
    try {
      setBusyId(studentId)
      setFeedback(null)
      await api.put(`/admin/students/${studentId}/${action}`)
      setFeedback({ type: 'success', message: successMessage })
      await fetchStudents()
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Não foi possível concluir a ação.' })
    } finally {
      setBusyId(null)
    }
  }

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()
    return students.filter((student) => {
      const matchesTerm = !term || [student.name, student.email, student.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
      const matchesStatus = filter === 'all' || student.status === filter
      return matchesTerm && matchesStatus
    })
  }, [students, search, filter])

  if (loading) return <div className="admin-students-state">Carregando alunos...</div>

  return (
    <section className="admin-students-v2">
      <div className="admin-students-heading">
        <div>
          <span className="admin-eyebrow">Gestão de alunos</span>
          <h2>Alunos</h2>
          <p>Clique em um aluno aprovado para abrir diretamente suas semanas e acompanhar o preenchimento.</p>
        </div>
        <div className="students-count-card"><strong>{students.length}</strong><span>cadastrados</span></div>
      </div>

      {feedback && <div className={`admin-inline-feedback ${feedback.type}`}>{feedback.message}</div>}

      <div className="students-toolbar">
        <input type="search" placeholder="Buscar por nome, email ou telefone" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Buscar alunos" />
        <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filtrar por status">
          <option value="all">Todos os status</option>
          <option value="APPROVED">Aprovados</option>
          <option value="PENDING">Pendentes</option>
          <option value="REJECTED">Rejeitados</option>
          <option value="INACTIVE">Inativos</option>
        </select>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="admin-students-state">Nenhum aluno encontrado com esses filtros.</div>
      ) : (
        <div className="students-table-wrap">
          <table className="students-table-v2">
            <thead><tr><th>Aluno</th><th>Status</th><th>Contato</th><th>Cadastro</th><th>Ações</th></tr></thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className={student.status === 'APPROVED' ? 'student-row-clickable' : ''}>
                  <td>
                    <button className="student-identity" onClick={() => navigate(`/admin/alunos/${student.id}`)}>
                      <span className="student-avatar">{student.profilePhoto ? <img src={student.profilePhoto} alt={`Foto de ${student.name}`} /> : student.name?.charAt(0)?.toUpperCase()}</span>
                      <span><strong>{student.name}</strong><small>{student.email}</small></span>
                    </button>
                  </td>
                  <td><span className={`status-pill ${student.status.toLowerCase()}`}>{statusLabels[student.status] || student.status}</span></td>
                  <td>{student.phone || 'Não informado'}</td>
                  <td>{new Date(student.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <div className="student-row-actions">
                      {student.status === 'APPROVED' && <button onClick={() => openStudentWeeks(student)}>Ver semanas</button>}
                      <button onClick={() => navigate(`/admin/alunos/${student.id}`)}>Ver perfil</button>
                      {student.status === 'PENDING' && <button disabled={busyId === student.id} onClick={() => runAction(student.id, 'approve', 'Aluno aprovado com sucesso.')}>Aprovar</button>}
                      {student.status === 'PENDING' && <button className="danger" disabled={busyId === student.id} onClick={() => runAction(student.id, 'reject', 'Cadastro rejeitado.')}>Rejeitar</button>}
                      {student.status === 'APPROVED' && <button className="danger" disabled={busyId === student.id} onClick={() => runAction(student.id, 'deactivate', 'Aluno inativado.')}>Inativar</button>}
                      {student.status === 'INACTIVE' && <button disabled={busyId === student.id} onClick={() => runAction(student.id, 'reactivate', 'Aluno reativado.')}>Reativar</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
