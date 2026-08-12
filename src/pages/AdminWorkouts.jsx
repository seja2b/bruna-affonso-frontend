import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import AdminLayout from '../components/AdminLayout'
import './AdminWorkouts.css'

export default function AdminWorkouts({ user, token, onNavigate }) {
  const [workouts, setWorkouts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    videoUrl: '',
    week: '',
    module: '',
    status: 'ACTIVE'
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [workoutsRes, categoriesRes] = await Promise.all([
        api.get('/workouts'),
        api.get('/admin/categories', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      setWorkouts(workoutsRes.data)
      setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Erro ao buscar dados', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateWorkout(e) {
    e.preventDefault()
    try {
      await api.post('/admin/workouts', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        videoUrl: '',
        week: '',
        module: '',
        status: 'ACTIVE'
      })
      setShowForm(false)
      fetchData()
    } catch (error) {
      alert('Erro ao criar treino')
    }
  }

  async function handleDeleteWorkout(workoutId) {
    if (!window.confirm('Tem certeza que deseja deletar este treino?')) return
    try {
      await api.delete(`/admin/workouts/${workoutId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchData()
    } catch (error) {
      alert('Erro ao deletar treino')
    }
  }

  return (
    <AdminLayout user={user} token={token} onNavigate={onNavigate} currentPage="workouts">
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Gerenciar Treinos</h1>
            <p className="page-subtitle">Crie, edite ou delete treinos da plataforma</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : 'Novo Treino'}
          </button>
        </div>

        {showForm && (
          <div className="form-card">
            <h2>Adicionar Novo Treino</h2>
            <form onSubmit={handleCreateWorkout}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    placeholder="Ex: Treino de Perna"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Semana</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={formData.week}
                    onChange={(e) => setFormData({...formData, week: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Módulo</label>
                  <input
                    type="text"
                    placeholder="Ex: Iniciante"
                    value={formData.module}
                    onChange={(e) => setFormData({...formData, module: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  placeholder="Descreva o treino em detalhes..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>URL do Vídeo</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Salvar Treino</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading">Carregando treinos...</div>
        ) : workouts.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum treino adicionado ainda</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>Criar Primeiro Treino</button>
          </div>
        ) : (
          <div className="workouts-grid">
            {workouts.map(workout => (
              <div key={workout.id} className="workout-card">
                <div className="card-header">
                  <h3>{workout.title}</h3>
                  <span className={`status-badge ${workout.status?.toLowerCase()}`}>
                    {workout.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <p className="card-description">{workout.description}</p>

                {workout.week && (
                  <div className="card-meta">
                    <span>Semana {workout.week}</span>
                    {workout.module && <span>•</span>}
                    {workout.module && <span>{workout.module}</span>}
                  </div>
                )}

                <div className="card-actions">
                  <a href={workout.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-view">
                    Ver Vídeo
                  </a>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteWorkout(workout.id)}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}