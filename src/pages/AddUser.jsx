import React, { useState } from 'react'
import { api } from '../services/api'
import AdminLayout from '../components/AdminLayout'
import './AddUser.css'

export default function AddUser({ user, token, onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      })

      // Se for admin, aprova automaticamente
      if (formData.role === 'ADMIN') {
        const users = await api.get('/admin/students', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const newUser = users.data.find(u => u.email === formData.email)
        
        if (newUser) {
          await api.put(
            `/admin/students/${newUser.id}/approve`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        }
      }

      setMessage(`✅ ${formData.role === 'ADMIN' ? 'Admin' : 'Aluno'} criado com sucesso!`)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT'
      })

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.error || 'Erro ao criar usuário'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout user={user} token={token} onNavigate={onNavigate} currentPage="add-user">
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Adicionar Usuário</h1>
            <p className="page-subtitle">Crie um novo aluno ou administrador</p>
          </div>
        </div>

        <div className="add-user-form-container">
          <form onSubmit={handleSubmit} className="add-user-form">
            <div className="form-section">
              <h2>Informações Básicas</h2>
              
              <div className="form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Bruna Affonso"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="bruna@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  placeholder="Senha segura"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo de Usuário</label>
                <div className="role-options">
                  <button
                    type="button"
                    className={`role-btn ${formData.role === 'STUDENT' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, role: 'STUDENT'})}
                  >
                    <span className="role-icon">👥</span>
                    <span className="role-name">Aluno</span>
                    <span className="role-desc">Acesso aos treinos</span>
                  </button>

                  <button
                    type="button"
                    className={`role-btn ${formData.role === 'ADMIN' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, role: 'ADMIN'})}
                  >
                    <span className="role-icon">👑</span>
                    <span className="role-name">Admin</span>
                    <span className="role-desc">Acesso total ao painel</span>
                  </button>
                </div>
              </div>
            </div>

            {message && (
              <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Usuário'}
            </button>
          </form>

          <div className="info-panel">
            <h3>Informações</h3>
            <div className="info-item">
              <strong>Aluno:</strong>
              <p>Pode acessar os treinos após aprovação. Começa com status "Pendente".</p>
            </div>
            <div className="info-item">
              <strong>Admin:</strong>
              <p>Tem acesso total ao painel administrativo. Aprovado automaticamente.</p>
            </div>
            <div className="info-item">
              <strong>Senha:</strong>
              <p>Após criar, o usuário pode alterar a senha ao fazer login.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}