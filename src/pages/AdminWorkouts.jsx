import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminWorkouts.css'

export default function AdminWorkouts({ user, token, onNavigate }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    videoUrl: ''
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  async function fetchVideos() {
    try {
      const response = await api.get('/admin/videos', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setVideos(response.data)
    } catch (error) {
      console.error('Erro ao buscar vídeos', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddVideo(e) {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.videoUrl.trim()) {
      alert('❌ Preencha Título e URL do YouTube!')
      return
    }

    try {
      if (editingId) {
        await api.put(`/admin/videos/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        alert('✅ Vídeo atualizado com sucesso!')
      } else {
        await api.post('/admin/videos', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        alert('✅ Vídeo adicionado com sucesso!')
      }

      setFormData({
        title: '',
        description: '',
        category: '',
        videoUrl: ''
      })
      setShowForm(false)
      setEditingId(null)
      fetchVideos()
    } catch (error) {
      alert('❌ Erro ao salvar vídeo')
    }
  }

  async function handleDeleteVideo(videoId) {
    if (!window.confirm('🗑️ Tem certeza que deseja deletar este vídeo?')) return

    try {
      await api.delete(`/admin/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('✅ Vídeo deletado com sucesso!')
      fetchVideos()
    } catch (error) {
      alert('❌ Erro ao deletar vídeo')
    }
  }

  function startEdit(video) {
    setFormData({
      title: video.title,
      description: video.description || '',
      category: video.category || '',
      videoUrl: video.videoUrl
    })
    setEditingId(video.id)
    setShowForm(true)
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      category: '',
      videoUrl: ''
    })
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <div className="admin-videos">
      <div className="videos-header">
        <div>
          <h2>🎥 Gerenciar Vídeos</h2>
          <p>Adicione, edite ou delete vídeos de aula</p>
        </div>
        <button
          className="btn-novo-video"
          onClick={() => !showForm ? setShowForm(true) : resetForm()}
        >
          {showForm ? '✖️ Cancelar' : '➕ Novo Vídeo'}
        </button>
      </div>

      {/* FORMULÁRIO */}
      {showForm && (
        <div className="form-card">
          <h3>{editingId ? '✏️ Editar Vídeo' : '➕ Adicionar Novo Vídeo'}</h3>
          <form onSubmit={handleAddVideo}>
            <div className="form-group">
              <label>Título do Vídeo *</label>
              <input
                type="text"
                placeholder="Ex: Treino de Perna - Semana 1"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Força, Cardio, Flexibilidade"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                placeholder="Descreva o conteúdo do vídeo..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>URL do YouTube *</label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                required
              />
              <small>Cole o link do YouTube completo</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-salvar">
                💾 {editingId ? 'Atualizar' : 'Salvar'} Vídeo
              </button>
              <button type="button" className="btn-cancelar" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTA DE VÍDEOS */}
      {loading ? (
        <div className="loading">Carregando vídeos...</div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <p>📹 Nenhum vídeo adicionado ainda</p>
          <button className="btn-novo-video" onClick={() => setShowForm(true)}>
            ➕ Adicionar Primeiro Vídeo
          </button>
        </div>
      ) : (
        <div className="videos-table">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Descrição</th>
                <th style={{width: '150px'}}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {videos.map(video => (
                <tr key={video.id}>
                  <td className="video-title">
                    <span className="video-icon">🎥</span>
                    {video.title}
                  </td>
                  <td>
                    {video.category ? (
                      <span className="category-badge">{video.category}</span>
                    ) : (
                      <span style={{color: '#999'}}>-</span>
                    )}
                  </td>
                  <td className="video-description">
                    {video.description || '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => startEdit(video)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteVideo(video.id)}
                        title="Deletar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}