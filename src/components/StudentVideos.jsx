import React, { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import './StudentVideos.css'

function getYouTubeId(url = '') {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\n?#/]+)/)
  return match ? match[1] : null
}

export default function StudentVideos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedVideo, setSelectedVideo] = useState(null)

  useEffect(() => { fetchVideos() }, [])

  async function fetchVideos() {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/videos')
      setVideos(response.data || [])
    } catch (err) {
      console.error('Erro ao buscar VideoAulas', err)
      setError('Não foi possível carregar as VideoAulas agora.')
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(() => [...new Set(videos.map((video) => video.category).filter(Boolean))], [videos])

  const filteredVideos = useMemo(() => {
    const term = search.trim().toLowerCase()
    return videos.filter((video) => {
      const matchesCategory = category === 'all' || video.category === category
      const matchesSearch = !term || [video.title, video.description, video.category].filter(Boolean).some((value) => value.toLowerCase().includes(term))
      return matchesCategory && matchesSearch
    })
  }, [videos, category, search])

  const selectedYouTubeId = selectedVideo ? getYouTubeId(selectedVideo.videoUrl) : null

  return (
    <section className="student-video-classes">
      <div className="video-classes-hero">
        <div><span className="video-kicker">Conteúdo exclusivo</span><h2>VideoAulas</h2><p>Aulas e orientações da professora para você consultar quando precisar, em qualquer dispositivo.</p></div>
        <div className="video-library-count"><strong>{videos.length}</strong><span>aulas disponíveis</span></div>
      </div>

      <div className="video-library-controls">
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar VideoAula" aria-label="Buscar VideoAula" />
        <div className="video-category-tabs">
          <button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>Todas</button>
          {categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
      </div>

      {loading ? <div className="video-library-state">Carregando VideoAulas...</div> : error ? <div className="video-library-state error"><p>{error}</p><button onClick={fetchVideos}>Tentar novamente</button></div> : filteredVideos.length === 0 ? <div className="video-library-state"><strong>Nenhuma VideoAula encontrada</strong><p>Quando novas aulas forem publicadas pela professora, elas aparecerão aqui.</p></div> : (
        <div className="video-classes-grid">
          {filteredVideos.map((video) => {
            const youtubeId = getYouTubeId(video.videoUrl)
            return <article key={video.id} className="student-video-card">
              <button className="student-video-cover" onClick={() => setSelectedVideo(video)} aria-label={`Assistir ${video.title}`}>
                {youtubeId ? <img src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} alt="" /> : <div className="video-generic-cover"><span>VideoAula</span></div>}
                <span className="video-play-mark"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7Z"/></svg></span>
              </button>
              <div className="student-video-content">
                <div className="student-video-meta">{video.category && <span>{video.category}</span>}<small>{new Date(video.createdAt).toLocaleDateString('pt-BR')}</small></div>
                <h3>{video.title}</h3>
                <p>{video.description || 'Aula em vídeo disponível para os alunos.'}</p>
                <button className="watch-class-button" onClick={() => setSelectedVideo(video)}>Assistir VideoAula</button>
              </div>
            </article>
          })}
        </div>
      )}

      {selectedVideo && <div className="student-video-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedVideo(null) }}>
        <div className="student-video-dialog">
          <div className="student-video-dialog-header"><div>{selectedVideo.category && <span>{selectedVideo.category}</span>}<h3>{selectedVideo.title}</h3></div><button onClick={() => setSelectedVideo(null)} aria-label="Fechar">×</button></div>
          <div className="student-video-player">{selectedYouTubeId ? <iframe src={`https://www.youtube-nocookie.com/embed/${selectedYouTubeId}`} title={selectedVideo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <div className="external-video-player"><p>Esta VideoAula está hospedada em um serviço externo.</p><a href={selectedVideo.videoUrl} target="_blank" rel="noreferrer">Abrir VideoAula</a></div>}</div>
          {selectedVideo.description && <p className="student-video-description">{selectedVideo.description}</p>}
        </div>
      </div>}
    </section>
  )
}
