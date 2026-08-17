import React, { useState, useEffect } from 'react'
import api from '../services/api'
import AdminLayout from '../components/AdminLayout'
import './AdminStudents.css'

export default function AdminStudents({ user, token, onNavigate }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    try {
      const response = await api.get('/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(response.data)
    } catch (error) {
      console.error('Erro ao buscar alunos', error)
    } finally {
      setLoading(false)
    }
  }

  async function approveStudent(studentId) {
    try {
      await api.put(`/admin/students/${studentId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchStudents()
    } catch (error) {
      alert('Erro ao aprovar aluno')
    }
  }

  async function rejectStudent(studentId) {
    try {
      await api.put(`/admin/students/${studentId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchStudents()
    } catch (error) {
      alert('Erro ao rejeitar aluno')
    }
  }

  async function deactivateStudent(studentId) {
    try {
      await api.put(`/admin/students/${studentId}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchStudents()
    } catch (error) {
      alert('Erro ao inativar aluno')
    }
  }

  async function reactivateStudent(studentId) {
    try {
      await api.put(`/admin/students/${studentId}/reactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchStudents()
    } catch (error) {
      alert('Erro ao reativar aluno')
    }
  }

  const filteredStudents = students.filter(s => {
    if (filter === 'pending') return s.status === 'PENDING'
    if (filter === 'approved') return s.status === 'APPROVED'
    if (filter === 'inactive') return s.status === 'INACTIVE'
    return true
  })

  return (
    <AdminLayout user={user} token={token} onNavigate={onNavigate} currentPage="students">
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Gerenciar Alunos</h1>
            <p className="page-subtitle">Aprove, rejeite ou gerencie os alunos</p>
          </div>
          <div className="page-stats">
            <span className="stat-badge">{students.length} alunos</span>
          </div>
        </div>

        <div className="filter-bar">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos ({students.length})
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pendentes ({students.filter(s => s.status === 'PENDING').length})
          </button>
          <button
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Aprovados ({students.filter(s => s.status === 'APPROVED').length})
          </button>
          <button
            className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
          >
            Inativos ({students.filter(s => s.status === 'INACTIVE').length})
          </button>
        </div>

        {loading ? (
          <div className="loading">Carregando alunos...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum aluno encontrado</p>
          </div>
        ) : (
          <div className="students-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Data Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id} className={`status-${student.status.toLowerCase()}`}>
                    <td className="name-cell">
                      <div className="avatar">{student.name.charAt(0)}</div>
                      {student.name}
                    </td>
                    <td>{student.email}</td>
                    <td>{student.phone || '-'}</td>
                    <td>
                      <span className={`status-badge ${student.status.toLowerCase()}`}>
                        {student.status === 'PENDING' && 'Pendente'}
                        {student.status === 'APPROVED' && 'Aprovado'}
                        {student.status === 'REJECTED' && 'Rejeitado'}
                        {student.status === 'INACTIVE' && 'Inativo'}
                      </span>
                    </td>
                    <td>{new Date(student.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div className="actions-cell">
                        {student.status === 'PENDING' && (
                          <>
                            <button
                              className="action-btn approve"
                              onClick={() => approveStudent(student.id)}
                              title="Aprovar"
                            >
                              Aprovar
                            </button>
                            <button
                              className="action-btn reject"
                              onClick={() => rejectStudent(student.id)}
                              title="Rejeitar"
                            >
                              Rejeitar
                            </button>
                          </>
                        )}
                        {student.status === 'APPROVED' && (
                          <button
                            className="action-btn deactivate"
                            onClick={() => deactivateStudent(student.id)}
                            title="Inativar"
                          >
                            Inativar
                          </button>
                        )}
                        {student.status === 'INACTIVE' && (
                          <button
                            className="action-btn reactivate"
                            onClick={() => reactivateStudent(student.id)}
                            title="Reativar"
                          >
                            Reativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
