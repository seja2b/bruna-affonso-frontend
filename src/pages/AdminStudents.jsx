import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import AdminLayout from '../components/AdminLayout'
import './AdminStudents.css'

export default function AdminStudents({ user, token }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <AdminLayout user={user} token={token}>
      <div className="admin-students">
        <h1>👥 Gerenciar Alunos</h1>

        {loading ? (
          <div className="loading">Carregando alunos...</div>
        ) : students.length === 0 ? (
          <div className="no-data">Nenhum aluno registrado</div>
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
                {students.map(student => (
                  <tr key={student.id} className={`status-${student.status}`}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.phone || '-'}</td>
                    <td>
                      <span className={`status-badge ${student.status.toLowerCase()}`}>
                        {student.status === 'PENDING' && '⏳ Pendente'}
                        {student.status === 'APPROVED' && '✅ Aprovado'}
                        {student.status === 'REJECTED' && '❌ Rejeitado'}
                        {student.status === 'INACTIVE' && '🚫 Inativo'}
                      </span>
                    </td>
                    <td>{new Date(student.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="actions">
                      {student.status === 'PENDING' && (
                        <>
                          <button className="btn-approve" onClick={() => approveStudent(student.id)}>
                            ✅ Aprovar
                          </button>
                          <button className="btn-reject" onClick={() => rejectStudent(student.id)}>
                            ❌ Rejeitar
                          </button>
                        </>
                      )}
                      {student.status === 'APPROVED' && (
                        <button className="btn-deactivate" onClick={() => deactivateStudent(student.id)}>
                          🚫 Inativar
                        </button>
                      )}
                      {student.status === 'INACTIVE' && (
                        <button className="btn-reactivate" onClick={() => reactivateStudent(student.id)}>
                          🔄 Reativar
                        </button>
                      )}
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