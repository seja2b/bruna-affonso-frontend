import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfWorker

export async function createPdfCover(pdfSource) {
  const bytes = pdfSource instanceof Blob ? await pdfSource.arrayBuffer() : pdfSource
  const document = await getDocument({ data: bytes }).promise
  try {
    const page = await document.getPage(1)
    const initialViewport = page.getViewport({ scale: 1 })
    const scale = 720 / initialViewport.width
    const viewport = page.getViewport({ scale })
    const canvas = window.document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const context = canvas.getContext('2d', { alpha: false })
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: context, viewport }).promise
    return await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Não foi possível gerar a capa')), 'image/webp', 0.92))
  } finally {
    await document.destroy()
  }
}
