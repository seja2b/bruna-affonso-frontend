import React, { useEffect, useRef, useState } from 'react'
import { getDocument } from 'pdfjs-dist'
import api, { getAccessToken } from '../services/api'
import { createPdfCover } from '../utils/pdfCover'
import './EbookLibrary.css'

const MAX_EBOOK_BYTES = 60 * 1024 * 1024

function EbookCover({ ebook }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    let active = true
    let objectUrl = ''
    const loadCover = async () => {
      let data = null
      if (ebook.coverUrl) {
        try {
          const candidate = (await api.get(ebook.coverUrl, { responseType: 'blob' })).data
          const bitmap = await createImageBitmap(candidate)
          bitmap.close()
          data = candidate
        } catch { data = null }
      }
      if (!data) {
        const pdf = (await api.get(ebook.url, { responseType: 'blob' })).data
        data = await createPdfCover(pdf)
      }
      if (!active) return
      objectUrl = URL.createObjectURL(data)
      setSrc(objectUrl)
    }
    loadCover().catch(() => {})
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [ebook.coverUrl, ebook.url])

  return src
    ? <img className="ebook-cover" src={src} alt={`Capa de ${ebook.title}`} />
    : <span className="ebook-cover ebook-cover-placeholder"><small>BRUNA AFFONSO</small><strong>{ebook.title}</strong><em>E-BOOK</em></span>
}

function PdfReader({ ebook }) {
  const canvasRef = useRef(null)
  const documentRef = useRef(null)
  const renderTaskRef = useRef(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const token = getAccessToken()
    const url = `${api.defaults.baseURL}${ebook.url}`
    const loadingTask = getDocument({ url, withCredentials: true, httpHeaders: token ? { Authorization: `Bearer ${token}` } : undefined, rangeChunkSize: 256 * 1024, disableStream: true, disableAutoFetch: true })
    loadingTask.onProgress = ({ loaded, total }) => { if (active && total) setProgress(Math.min(100, Math.round((loaded / total) * 100))) }
    loadingTask.promise.then(document => {
      if (!active) return document.destroy()
      documentRef.current = document
      setPageCount(document.numPages)
      setPageNumber(1)
    }).catch(() => active && setError('Não foi possível carregar este material.')).finally(() => active && setLoading(false))
    return () => {
      active = false
      renderTaskRef.current?.cancel()
      documentRef.current?.destroy()
      loadingTask.destroy()
      documentRef.current = null
    }
  }, [ebook.url])

  useEffect(() => {
    const document = documentRef.current
    const canvas = canvasRef.current
    if (!document || !canvas) return undefined
    let active = true
    document.getPage(pageNumber).then(page => {
      if (!active) return undefined
      const base = page.getViewport({ scale: 1 })
      const availableWidth = Math.min(980, Math.max(280, canvas.parentElement.clientWidth - 48))
      const viewport = page.getViewport({ scale: (availableWidth / base.width) * zoom })
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5)
      canvas.width = Math.ceil(viewport.width * pixelRatio)
      canvas.height = Math.ceil(viewport.height * pixelRatio)
      canvas.style.width = `${Math.ceil(viewport.width)}px`
      canvas.style.height = `${Math.ceil(viewport.height)}px`
      renderTaskRef.current?.cancel()
      renderTaskRef.current = page.render({ canvasContext: canvas.getContext('2d'), viewport, transform: pixelRatio === 1 ? null : [pixelRatio, 0, 0, pixelRatio, 0, 0] })
      return renderTaskRef.current.promise
    }).catch(renderError => {
      if (active && renderError?.name !== 'RenderingCancelledException') setError('Não foi possível mostrar esta página.')
    })
    return () => { active = false; renderTaskRef.current?.cancel() }
  }, [pageNumber, pageCount, zoom])

  if (error) return <div className="ebook-reader-state">{error}</div>
  return <div className="ebook-reader" aria-label={`Conteúdo de ${ebook.title}`}>
    {loading && <div className="ebook-reader-state"><span className="ebook-loader" /><strong>Preparando seu material</strong><small>{progress ? `${progress}% carregado` : 'Abrindo o documento...'}</small></div>}
    <div className="ebook-reader-page"><canvas ref={canvasRef} /></div>
    {pageCount > 0 && <nav aria-label="Controles do PDF"><div className="ebook-page-controls"><button disabled={pageNumber === 1} onClick={() => setPageNumber(number => number - 1)}>‹</button><span>Página <strong>{pageNumber}</strong> de {pageCount}</span><button disabled={pageNumber === pageCount} onClick={() => setPageNumber(number => number + 1)}>›</button></div><div className="ebook-zoom-controls"><button disabled={zoom <= .75} onClick={() => setZoom(value => Math.max(.75, value - .25))}>−</button><span>{Math.round(zoom * 100)}%</span><button disabled={zoom >= 2} onClick={() => setZoom(value => Math.min(2, value + .25))}>+</button></div></nav>}
  </div>
}

export default function EbookLibrary({ admin = false }) {
  const [ebooks, setEbooks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [viewer, setViewer] = useState(null)
  const [openingId, setOpeningId] = useState(null)
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
    return data
  }

  async function open(ebook) {
    setOpeningId(ebook.id)
    setViewer({ ebook })
    window.setTimeout(() => setOpeningId(null), 350)
  }

  function closeViewer() {
    setViewer(null)
  }

  async function download(ebook) {
    try {
      const blob = await fetchPdf(ebook)
      const url = URL.createObjectURL(blob)
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
        <div className="ebook-actions"><button className="ebook-read" disabled={openingId === ebook.id} onClick={() => open(ebook)}>{openingId === ebook.id ? 'Abrindo...' : 'Ler agora'}</button><button className="ebook-download" onClick={() => download(ebook)}>Baixar PDF</button></div>
        {admin && <button className="ebook-delete" onClick={() => remove(ebook.id)}>Excluir</button>}
      </article>)}
      {!ebooks.length && <div className="ebook-empty">Nenhum e-book publicado ainda.</div>}
    </div>
    {viewer && <div className="ebook-viewer-backdrop" role="dialog" aria-modal="true" aria-label={`Leitor de ${viewer.ebook.title}`} onMouseDown={event => event.target === event.currentTarget && closeViewer()}>
      <div className="ebook-viewer"><header><div><strong>{viewer.ebook.title}</strong><small>Leitura do e-book</small></div><div><button onClick={() => download(viewer.ebook)}>Baixar PDF</button><button className="ebook-viewer-close" aria-label="Fechar leitor" onClick={closeViewer}>×</button></div></header><PdfReader ebook={viewer.ebook} /></div>
    </div>}
  </section>
}
