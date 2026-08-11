import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import AdminLayout from '../components/AdminLayout'
import './AdminWorkouts.css'

export default function AdminWorkouts({ user, token }) {
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
    if (!confirm('Tem certeza que deseja deletar este treino?')) return
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
    <AdminLayout user={user} token={token}>
      <div className="admin-workouts">
        <div className="workouts-header">
          <h1>💪 Gerenciar Treinos</h1>
          <button className="btn-add-workout" onClick={() => setShowForm(!showForm)}>
            + Adicionar Novo Treino
          </button>
        </div>

        {showForm && (
          <form className="workout-form" onSubmit={handleCreateWorkout}>
            <h3>Novo Treino</h3>
            <input
              type="text"
              placeholder="Título"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <textarea
              placeholder="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
            />
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
            <input
              type="url"
              placeholder="URL do Vídeo"
              value={formData.videoUrl}
              onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Semana"
              value={formData.week}
              onChange={(e) => setFormData({...formData, week: e.target.value})}
            />
            <input
              type="text"
              placeholder="Módulo"
              value={formData.module}
              onChange={(e) => setFormData({...formData, module: e.target.value})}
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
            </select>
            <div className="form-actions">
              <button type="submit" className="btn-save">Salvar</button>
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="loading">Carregando treinos...</div>
        ) : workouts.length === 0 ? (
          <div className="no-data">Nenhum treino adicionado ainda</div>
        ) : (
          <div className="workouts-grid">
            {workouts.map(workout => (
              <div key={workout.id} className="workout-card">
                <div className="workout-header-card">
                  <h3>{workout.title}</h3>
                  <span className={`status ${workout.status?.toLowerCase()}`}>
                    {workout.status === 'ACTIVE' ? '✅' : '⛔'}
                  </span>
                </div>
                <p className="workout-desc">{workout.description}</p>
                {workout.week && <p className="workout-info">📅 Semana {workout.week}</p>}
                {workout.module && <p className="workout-info">📂 {workout.module}</p>}
                <div className="workout-actions">
                  <a href={workout.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-video">
                    ▶️ Ver Vídeo
                  </a>
                  <button className="btn-delete" onClick={() => handleDeleteWorkout(workout.id)}>
                    🗑️ Deletar
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