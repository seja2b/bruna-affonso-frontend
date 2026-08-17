import React, { useState } from 'react'
import api from '../services/api'
import './AdicionarFoto.css'

export default function AdicionarFoto({ isOpen, onClose, studentId, token }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setMessage('❌ Por favor, selecione uma imagem válida')
        return
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('❌ A imagem deve ter menos de 5MB')
        return
      }

      setSelectedFile(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
      setMessage('')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Selecione uma foto')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)

      await api.put(
        `/tracking/profile-photo/${studentId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setMessage('✅ Foto adicionada com sucesso!')
      setTimeout(() => {
        setSelectedFile(null)
        setPreview(null)
        onClose()
        setMessage('')
      }, 1500)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      setMessage('❌ Erro ao fazer upload da foto')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreview(null)
    setMessage('')
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content adicionar-foto-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📸 Adicione sua Foto</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="photo-upload">
          {/* Preview */}
          <div className="photo-preview">
            {preview ? (
              <img src={preview} alt="Preview" />
            ) : (
              <div className="placeholder">
                <span className="placeholder-icon">📸</span>
                <p>Nenhuma foto selecionada</p>
              </div>
            )}
          </div>

          {/* Input de Arquivo */}
          <div className="file-input-wrapper">
            <label htmlFor="photo-input" className="file-label">
              Escolher Foto
            </label>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              style={{ display: 'none' }}
            />
          </div>

          {/* Info */}
          <div className="photo-info">
            <p>📋 Requisitos:</p>
            <ul>
              <li>Formato: JPG, PNG, GIF, WebP</li>
              <li>Tamanho máximo: 5MB</li>
              <li>Dimensão recomendada: 400x400px</li>
            </ul>
          </div>

          {message && <div className="message">{message}</div>}

          {/* Botões */}
          <div className="modal-actions">
            <button 
              className="btn-cancel" 
              onClick={handleClear}
              disabled={!selectedFile || loading}
            >
              Limpar
            </button>
            <button 
              className="btn-cancel" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              className="btn-save" 
              onClick={handleUpload}
              disabled={!selectedFile || loading}
            >
              {loading ? 'Enviando...' : '⬆️ Enviar Foto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
