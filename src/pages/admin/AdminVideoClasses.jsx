import React, { useEffect, useMemo, useRef, useState } from 'react'
import api from '../../services/api'
import './AdminVideoClasses.css'

const emptyForm = { title: '', category: '', description: '', videoUrl: '' }

function getYouTubeId(url = '') {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\n?#/]+)/)
  return match ? match[1] : null
}

export default function AdminVideoClasses() {
  const [videos, setVideos] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [draggedId, setDraggedId] = useState(null)
  const [dropId, setDropId] = useState(null)
  const orderLock = useRef(false)
  const canReorder = !search.trim() && !loading && !saving && !ordering && !deleteId

  useEffect(() => { loadVideos() }, [])

  async function loadVideos() {
    try {
      setLoading(true)
      const response = await api.get('/videos')
      setVideos(response.data || [])
    } catch (error) {
      setFeedback({ type: 'error', message: 'Não foi possível carregar as VideoAulas.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      setSaving(true)
      setFeedback(null)
      if (editingId) {
        await api.put(`/videos/${editingId}`, form)
        setFeedback({ type: 'success', message: 'VideoAula atualizada com sucesso.' })
      } else {
        await api.post('/videos', form)
        setFeedback({ type: 'success', message: 'VideoAula publicada com sucesso.' })
      }
      setForm(emptyForm)
      setEditingId(null)
      await loadVideos()
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Não foi possível salvar a VideoAula.' })
    } finally {
      setSaving(false)
    }
  }

  function startEdit(video) {
    setEditingId(video.id)
    setForm({
      title: video.title || '',
      category: video.category || '',
      description: video.description || '',
      videoUrl: video.videoUrl || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function confirmDelete() {
    try {
      await api.delete(`/videos/${deleteId}`)
      setDeleteId(null)
      setFeedback({ type: 'success', message: 'VideoAula excluída.' })
      await loadVideos()
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Não foi possível excluir a VideoAula.' })
    }
  }

  async function moveVideo(id, targetId) {
    if (!canReorder || orderLock.current || id === targetId) return
    const from = videos.findIndex(video => video.id === id)
    const to = videos.findIndex(video => video.id === targetId)
    if (from < 0 || to < 0) return
    const previous = videos
    const next = [...videos]
    next.splice(to, 0, next.splice(from, 1)[0])
    orderLock.current = true
    setOrdering(true)
    setVideos(next)
    setFeedback({ type: 'success', message: 'Salvando ordem…' })
    try {
      const { data } = await api.put('/videos/order', { ids: next.map(v => v.id), previousIds: previous.map(v => v.id) })
      setVideos(data)
      setFeedback({ type: 'success', message: 'Ordem salva. As alunas verão os vídeos nessa sequência.' })
    } catch (error) {
      setVideos(previous)
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Não foi possível salvar a ordem. Tente novamente.' })
      if (error.response?.status === 409) await loadVideos()
    } finally {
      orderLock.current = false
      setOrdering(false)
      setDraggedId(null)
      setDropId(null)
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return videos
    return videos.filter((video) => [video.title, video.category, video.description].filter(Boolean).some((value) => value.toLowerCase().includes(term)))
  }, [videos, search])

  const youtubePreview = getYouTubeId(form.videoUrl)

  return (
    <section className="admin-video-classes">
      <div className="video-admin-heading">
        <div><span className="admin-eyebrow">Conteúdo para alunos</span><h2>VideoAulas</h2><p>Publique aulas em vídeo, organize por categoria e mantenha a biblioteca dos alunos sempre atualizada.</p></div>
        <div className="video-count"><strong>{videos.length}</strong><span>aulas publicadas</span></div>
      </div>

      {feedback && <div role="status" aria-live="polite" className={`video-feedback ${feedback.type}`}>{feedback.message}</div>}

      <div className="video-admin-grid">
        <form className="video-editor-card" onSubmit={handleSubmit}>
          <div className="video-editor-title"><div><span>{editingId ? 'Editando aula' : 'Nova aula'}</span><h3>{editingId ? 'Atualizar VideoAula' : 'Publicar VideoAula'}</h3></div>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancelar edição</button>}</div>

          <label>Título da aula<input required minLength="3" maxLength="120" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex.: Como executar o agachamento corretamente" /></label>
          <label>Categoria<input maxLength="80" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex.: Mobilidade, Técnica, Nutrição" /></label>
          <label>Link do vídeo<input required type="url" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://youtube.com/..." /></label>
          <label>Descrição<textarea maxLength="5000" rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Explique o objetivo da aula e o que o aluno deve observar." /></label>

          {youtubePreview && <div className="video-form-preview"><img src={`https://img.youtube.com/vi/${youtubePreview}/hqdefault.jpg`} alt="Prévia do vídeo" /><div><span>Prévia</span><strong>{form.title || 'Título da VideoAula'}</strong></div></div>}

          <button className="video-primary-action" disabled={saving || ordering}>{saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Publicar VideoAula'}</button>
        </form>

        <div className="video-library-admin">
          <div className="video-library-toolbar"><div><h3>Biblioteca publicada</h3><p>Arraste pela alça para definir a sequência. A ordem é salva automaticamente.</p></div><input type="search" placeholder="Buscar VideoAula" value={search} onChange={(e) => setSearch(e.target.value)} /></div>

          {search.trim() && <p className="video-order-help">Limpe a busca para reorganizar a biblioteca completa.</p>}
          {loading ? <div className="video-admin-state">Carregando VideoAulas...</div> : filtered.length === 0 ? <div className="video-admin-state">Nenhuma VideoAula encontrada.</div> : (
            <div className="video-admin-list">{filtered.map((video, index) => {
              const youtubeId = getYouTubeId(video.videoUrl)
              return <article className={`video-admin-row ${dropId === video.id ? 'video-drop-target' : ''} ${draggedId === video.id ? 'video-dragging' : ''}`} key={video.id}
                onDragOver={event => { if (canReorder && draggedId && draggedId !== video.id) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDropId(video.id) } }}
                onDrop={event => { event.preventDefault(); if (draggedId) moveVideo(draggedId, video.id); setDraggedId(null); setDropId(null) }}>
                <div className="video-order-controls">
                  <button type="button" className="video-drag-handle" draggable={canReorder} disabled={!canReorder} aria-label={`Arrastar ${video.title} para reordenar`}
                    onDragStart={event => { if (!canReorder) { event.preventDefault(); return } setDraggedId(video.id); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', video.id) }}
                    onDragEnd={() => { setDraggedId(null); setDropId(null) }}>⠿ <span>{videos.findIndex(v => v.id === video.id) + 1}º</span></button>
                  <button type="button" disabled={!canReorder || index === 0} aria-label={`Mover ${video.title} para cima`} onClick={() => moveVideo(video.id, videos[index - 1]?.id)}>↑</button>
                  <button type="button" disabled={!canReorder || index === videos.length - 1} aria-label={`Mover ${video.title} para baixo`} onClick={() => moveVideo(video.id, videos[index + 1]?.id)}>↓</button>
                </div>
                <div className="video-admin-thumb">{youtubeId ? <img src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} alt="" /> : <span>Play</span>}</div>
                <div className="video-admin-info"><div>{video.category && <span className="video-category-pill">{video.category}</span>}<small>{new Date(video.createdAt).toLocaleDateString('pt-BR')}</small></div><h4>{video.title}</h4><p>{video.description || 'Sem descrição.'}</p></div>
                <div className="video-admin-actions"><a href={video.videoUrl} target="_blank" rel="noreferrer">Abrir</a><button disabled={ordering} onClick={() => startEdit(video)}>Editar</button><button disabled={ordering} className="danger" onClick={() => setDeleteId(video.id)}>Excluir</button></div>
              </article>
            })}</div>
          )}
        </div>
      </div>

      {deleteId && <div className="video-confirm-backdrop"><div className="video-confirm-dialog"><span>Excluir VideoAula</span><h3>Tem certeza?</h3><p>A aula deixará de aparecer imediatamente para todos os alunos.</p><div><button onClick={() => setDeleteId(null)}>Cancelar</button><button className="danger" onClick={confirmDelete}>Excluir VideoAula</button></div></div></div>}
    </section>
  )
}
