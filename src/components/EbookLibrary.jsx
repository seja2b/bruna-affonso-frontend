import React, { useEffect, useRef, useState } from 'react'
import api from '../services/api'
import { createPdfCover } from '../utils/pdfCover'
import './EbookLibrary.css'

const MAX_EBOOK_BYTES = 60 * 1024 * 1024

function EbookCover({ ebook }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    let active = true
    let objectUrl = ''
    if (!ebook.coverUrl) return undefined
    api.get(ebook.coverUrl, { responseType: 'blob' }).then(({ data }) => {
      if (!active) return
      objectUrl = URL.createObjectURL(data)
      setSrc(objectUrl)
    }).catch(() => {})
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [ebook.coverUrl])

  return src
    ? <img className="ebook-cover" src={src} alt={`Capa de ${ebook.title}`} />
    : <span className="ebook-cover ebook-cover-placeholder">PDF</span>
}

export default function EbookLibrary({ admin = false }) {
  const [ebooks, setEbooks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [viewer, setViewer] = useState(null)
  const backfillAttempted = useRef(new Set())

  async function backfillCovers(items) {
    if (!admin) return
    const missing = items.filter(ebook => !ebook.coverUrl && !backfillAttempted.current.has(ebook.id))
    if (!missing.length) return
    setMessage(`Gerando ${missing.length === 1 ? 'a capa do e-book existente' : 'as capas dos e-books existentes'}...`)
    for (const ebook of missing) {
      backfillAttempted.current.add(ebook.id)
      try {
        const { data: pdf } = await api.get(ebook.url, { responseType: 'blob' })
        const cover = await createPdfCover(pdf)
        const body = new FormData()
        body.append('cover', cover, `${ebook.id}.webp`)
        const { data: updated } = await api.post(`/ebooks/${ebook.id}/cover`, body)
        setEbooks(current => current.map(item => item.id === ebook.id ? updated : item))
      } catch (error) {
        console.error(`Não foi possível gerar a capa de ${ebook.title}`, error)
      }
    }
    setMessage('Capas dos e-books atualizadas.')
  }

  async function load() {
    try {
      const { data } = await api.get('/ebooks')
      const items = data || []
      setEbooks(items)
      await backfillCovers(items)
    } catch {
      setMessage('Não foi possível carregar os e-books.')
    }
  }

  useEffect(() => { load() }, [])

  async function upload(event) {
    event.preventDefault()
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setMessage('Selecione um arquivo PDF válido.')
      return
    }
    if (file.size > MAX_EBOOK_BYTES) {
      setMessage('O PDF deve ter no máximo 60 MB.')
      return
    }
    try {
      setBusy(true)
      setMessage('Gerando capa e enviando PDF...')
      const cover = await createPdfCover(file)
      const body = new FormData()
      body.append('title', title)
      body.append('description', description)
      body.append('file', file)
      body.append('cover', cover, `${file.name.replace(/\.pdf$/i, '')}-capa.webp`)
      await api.post('/ebooks', body)
      setTitle('')
      setDescription('')
      setFile(null)
      setMessage('E-book publicado com capa.')
      await load()
    } catch (error) {
      setMessage(error.response?.data?.error || 'Não foi possível publicar o e-book.')
    } finally {
      setBusy(false)
    }
  }

  async function fetchPdf(ebook) {
    const { data } = await api.get(ebook.url, { responseType: 'blob' })
    return URL.createObjectURL(data)
  }

  async function open(ebook) {
    try {
      const url = await fetchPdf(ebook)
      setViewer({ ebook, url })
    } catch {
      setMessage('Não foi possível abrir o PDF.')
    }
  }

  function closeViewer() {
    if (viewer?.url) URL.revokeObjectURL(viewer.url)
    setViewer(null)
  }

  async function download(ebook) {
    try {
      const url = await fetchPdf(ebook)
      const link = document.createElement('a')
      link.href = url
      link.download = ebook.originalName || `${ebook.title}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setMessage('Não foi possível baixar o PDF.')
    }
  }

  async function remove(id) {
    if (!window.confirm('Excluir este e-book?')) return
    await api.delete(`/ebooks/${id}`)
    setMessage('E-book excluído.')
    await load()
  }

  return <section className="ebook-page">
    <header><div><span>Biblioteca digital</span><h2>E-books</h2><p>Materiais em PDF para complementar os treinos e orientações.</p></div><strong>{ebooks.length} {ebooks.length === 1 ? 'arquivo' : 'arquivos'}</strong></header>
    {message && <div className="ebook-message">{message}</div>}
    {admin && <form className="ebook-form" onSubmit={upload}>
      <label>Título<input required value={title} onChange={event => setTitle(event.target.value)} /></label>
      <label>Descrição<textarea value={description} onChange={event => setDescription(event.target.value)} /></label>
      <label className="ebook-file">Arquivo PDF<input required type="file" accept="application/pdf,.pdf" onChange={event => setFile(event.target.files[0])} /><span>{file?.name || 'Selecionar PDF'}</span></label>
      <button disabled={busy}>{busy ? 'Gerando capa e publicando...' : 'Publicar e-book'}</button>
    </form>}
    <div className="ebook-grid">
      {ebooks.map(ebook => <article key={ebook.id}>
        <EbookCover ebook={ebook} />
        <div><h3>{ebook.title}</h3><p>{ebook.description || 'Material complementar'}</p><small>{(ebook.size / 1024 / 1024).toFixed(1)} MB</small></div>
        <div className="ebook-actions"><button onClick={() => open(ebook)}>Ler</button><button className="ebook-download" onClick={() => download(ebook)}>Baixar PDF</button></div>
        {admin && <button className="ebook-delete" onClick={() => remove(ebook.id)}>Excluir</button>}
      </article>)}
      {!ebooks.length && <div className="ebook-empty">Nenhum e-book publicado ainda.</div>}
    </div>
    {viewer && <div className="ebook-viewer-backdrop" role="dialog" aria-modal="true" aria-label={`Leitor de ${viewer.ebook.title}`} onMouseDown={event => event.target === event.currentTarget && closeViewer()}>
      <div className="ebook-viewer"><header><div><strong>{viewer.ebook.title}</strong><small>Leitura do e-book</small></div><div><button onClick={() => download(viewer.ebook)}>Baixar PDF</button><button className="ebook-viewer-close" aria-label="Fechar leitor" onClick={closeViewer}>×</button></div></header><iframe src={viewer.url} title={viewer.ebook.title} /></div>
    </div>}
  </section>
}
