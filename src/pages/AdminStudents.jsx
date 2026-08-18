import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminStudents.css'

export default function AdminStudents({ user, token, onNavigate }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isAdmin, setIsAdmin] = useState({})

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    try {
      const response = await api.get('/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(response.data)
      
      // Criar objeto com status de admin para cada aluno
      const adminStatus = {}
      response.data.forEach(student => {
        adminStatus[student.id] = student.isAdmin || false
      })
      setIsAdmin(adminStatus)
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

  async function toggleAdminStatus(studentId) {
    try {
      const newStatus = !isAdmin[studentId]
      await api.put(`/admin/students/${studentId}/admin`, 
        { isAdmin: newStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setIsAdmin({...isAdmin, [studentId]: newStatus})
      fetchStudents()
    } catch (error) {
      alert('Erro ao alterar status de admin')
    }
  }

  async function handlePhotoUpload(studentId) {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('photo', file)

      try {
        await api.put(`/admin/students/${studentId}/photo`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        fetchStudents()
        alert('✅ Foto do aluno atualizada!')
      } catch (error) {
        alert('Erro ao fazer upload da foto')
      }
    }
    fileInput.click()
  }

  const filteredStudents = students.filter(s => {
    if (filter === 'pending') return s.status === 'PENDING'
    if (filter === 'approved') return s.status === 'APPROVED'
    if (filter === 'canceled') return s.status === 'REJECTED' || s.status === 'INACTIVE'
    return true
  })

  return (
    <div className="admin-students">
      <div className="students-header">
        <div>
          <h2>👥 Gerenciar Alunos</h2>
          <p>Aprove, rejeite ou gerencie os alunos</p>
        </div>
        <div className="header-stats">
          <span className="stat-badge">{students.length} alunos</span>
        </div>
      </div>

      {/* ABAS DE FILTRO */}
      <div className="students-tabs">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          ✅ Aprovados ({students.filter(s => s.status === 'APPROVED').length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          📩 Pendentes ({students.filter(s => s.status === 'PENDING').length})
        </button>
        <button
          className={`filter-btn ${filter === 'canceled' ? 'active' : ''}`}
          onClick={() => setFilter('canceled')}
        >
          ❌ Cancelados ({students.filter(s => s.status === 'REJECTED' || s.status === 'INACTIVE').length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Carregando alunos...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum aluno encontrado nesta categoria</p>
        </div>
      ) : (
        <div className="students-grid">
          {filteredStudents.map(student => (
            <div key={student.id} className="student-card">
              {/* FOTO DO ALUNO */}
              <div className="student-photo-container">
                <div 
                  className="student-photo"
                  onClick={() => handlePhotoUpload(student.id)}
                  style={{cursor: 'pointer'}}
                  title="Clique para alterar foto"
                >
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt={student.name} />
                  ) : (
                    <div className="photo-placeholder">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* INFORMAÇÕES */}
              <div className="student-info">
                <h3>{student.name}</h3>
                <p className="email">{student.email}</p>
                {student.phone && <p className="phone">📱 {student.phone}</p>}
              </div>

              {/* STATUS */}
              <div className="student-status">
                <span className={`status-badge ${student.status.toLowerCase()}`}>
                  {student.status === 'PENDING' && '📩 Pendente'}
                  {student.status === 'APPROVED' && '✅ Aprovado'}
                  {student.status === 'REJECTED' && '❌ Rejeitado'}
                  {student.status === 'INACTIVE' && '⛔ Inativo'}
                </span>
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="student-actions">
                {student.status === 'PENDING' && (
                  <>
                    <button 
                      className="btn-approve"
                      onClick={() => approveStudent(student.id)}
                    >
                      ✅ Aprovar
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => rejectStudent(student.id)}
                    >
                      ❌ Rejeitar
                    </button>
                  </>
                )}

                {student.status === 'APPROVED' && (
                  <button 
                    className={`btn-admin ${isAdmin[student.id] ? 'active' : ''}`}
                    onClick={() => toggleAdminStatus(student.id)}
                  >
                    {isAdmin[student.id] ? '⚙️ Remover ADM' : '⚙️ Tornar ADM'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}