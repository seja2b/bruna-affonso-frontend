import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './StudentVideos.css'

export default function StudentVideos({ token }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchVideos()
  }, [])

  async function fetchVideos() {
    try {
      const response = await api.get('/videos', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setVideos(response.data)
      
      // Extrair categorias únicas
      const uniqueCategories = [...new Set(response.data.map(v => v.category).filter(Boolean))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Erro ao buscar vídeos', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === selectedCategory)

  function extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  return (
    <div className="student-videos">
      <div className="videos-header">
        <h2>🎥 Biblioteca de Vídeos</h2>
        <p>Assista aos vídeos de aula e domine cada exercício</p>
      </div>

      {/* FILTRO DE CATEGORIA */}
      {categories.length > 0 && (
        <div className="category-filter">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Todos ({videos.length})
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category} ({videos.filter(v => v.category === category).length})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading">Carregando vídeos...</div>
      ) : filteredVideos.length === 0 ? (
        <div className="empty-state">
          <p>📹 Nenhum vídeo disponível ainda</p>
        </div>
      ) : (
        <div className="videos-grid">
          {filteredVideos.map(video => {
            const youtubeId = extractYouTubeId(video.videoUrl)
            return (
              <div key={video.id} className="video-card">
                <div className="video-thumbnail">
                  {youtubeId ? (
                    <img 
                      src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                      alt={video.title}
                      onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                      }}
                    />
                  ) : (
                    <div className="no-thumbnail">
                      <span>▶️</span>
                    </div>
                  )}
                  <a 
                    href={video.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="play-button"
                  >
                    ▶️ Assistir
                  </a>
                </div>

                <div className="video-info">
                  <h3>{video.title}</h3>
                  {video.category && (
                    <span className="category-badge">{video.category}</span>
                  )}
                  {video.description && (
                    <p className="description">{video.description}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}