import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './Dashboard.css'

export default function Dashboard({ user, token, setToken }) {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    difficulty: 'Intermediário'
  })

  useEffect(() => {
    fetchWorkouts()
  }, [])

  async function fetchWorkouts() {
    try {
      const response = await api.get('/workouts')
      setWorkouts(response.data)
    } catch (error) {
      console.error('Erro ao buscar treinos', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddWorkout(e) {
    e.preventDefault()
    try {
      await api.post('/workouts', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFormData({ title: '', description: '', videoUrl: '', duration: '', difficulty: 'Intermediário' })
      setShowForm(false)
      fetchWorkouts()
    } catch (error) {
      alert('Erro ao adicionar treino')
    }
  }

  async function handleDeleteWorkout(id) {
    if (!confirm('Tem certeza?')) return
    try {
      await api.delete(`/workouts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchWorkouts()
    } catch (error) {
      alert('Erro ao deletar treino')
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>💪 BRUNA AFFONSO - Meus Treinos</h1>
          <div className="user-info">
            <span>{user.name}</span>
            <button className="logout-btn" onClick={() => { setToken(null); localStorage.removeItem('token') }}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {user.role === 'ADMIN' && (
          <div className="admin-section">
            <button 
              className="add-workout-btn"
              onClick={() => setShowForm(!showForm)}
            >
              + Adicionar Novo Treino
            </button>

            {showForm && (
              <form className="add-workout-form" onSubmit={handleAddWorkout}>
                <h3>Novo Treino</h3>
                <input
                  type="text"
                  placeholder="Título do Treino"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Descrição"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="4"
                />
                <input
                  type="url"
                  placeholder="URL do Vídeo (YouTube, Vimeo, etc)"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Duração (minutos)"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                />
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                  <option>Iniciante</option>
                  <option>Intermediário</option>
                  <option>Avançado</option>
                </select>
                <button type="submit" className="submit-btn">Salvar Treino</button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancelar</button>
              </form>
            )}
          </div>
        )}

        {loading ? (
          <div className="loading">Carregando treinos...</div>
        ) : (
          <div className="workouts-grid">
            {workouts.length === 0 ? (
              <div className="no-workouts">
                <p>Nenhum treino adicionado ainda</p>
                {user.role === 'ADMIN' && <p>Clique em "Adicionar Novo Treino" para começar!</p>}
              </div>
            ) : (
              workouts.map(workout => (
                <div key={workout.id} className="workout-card">
                  <div className="workout-header">
                    <h3>{workout.title}</h3>
                    <span className={`difficulty ${workout.difficulty?.toLowerCase()}`}>
                      {workout.difficulty}
                    </span>
                  </div>
                  
                  <p className="workout-description">{workout.description}</p>
                  
                  {workout.duration && (
                    <p className="workout-duration">⏱️ {workout.duration} min</p>
                  )}

                  <div className="workout-video">
                    {workout.videoUrl && (
                      <a href={workout.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                        ▶️ Assistir Vídeo
                      </a>
                    )}
                  </div>

                  {user.role === 'ADMIN' && (
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteWorkout(workout.id)}
                    >
                      Deletar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
