import React, { useState } from 'react'
import api from '../services/api'
import './AdicionarFoto.css'

export default function AdicionarFoto({ isOpen, onClose, studentId, token }) {
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  function handlePhotoSelect(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target.result)
        setPhoto(file)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSave() {
    if (!photo) {
      alert('❌ Selecione uma foto!')
      return
    }

    setSaving(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          await api.put(
            `/student/profile`,
            { profilePhoto: event.target.result },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          alert('✅ Foto adicionada com sucesso!')
          setPhoto(null)
          setPreview(null)
          onClose()
        } catch (error) {
          console.error('Erro ao salvar foto', error)
          alert('❌ Erro ao salvar foto')
        } finally {
          setSaving(false)
        }
      }
      reader.readAsDataURL(photo)
    } catch (error) {
      console.error('Erro ao processar foto', error)
      alert('❌ Erro ao processar foto')
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📸 Adicione sua Foto</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="photo-upload-section">
            {!preview ? (
              <div className="photo-placeholder">
                <div className="upload-icon">📸</div>
                <p>Clique para fazer upload da sua foto</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  id="photo-input"
                  className="photo-input"
                />
                <label htmlFor="photo-input" className="upload-label">
                  Escolher Foto
                </label>
              </div>
            ) : (
              <div className="photo-preview-section">
                <div className="photo-preview-img">
                  <img src={preview} alt="Preview" />
                </div>
                <p className="preview-text">Foto selecionada!</p>
                <button 
                  className="btn-trocar"
                  onClick={() => {
                    setPhoto(null)
                    setPreview(null)
                  }}
                >
                  🔄 Trocar Foto
                </button>
              </div>
            )}
          </div>

          <div className="photo-tips">
            <h3>💡 Dicas para Melhor Foto:</h3>
            <ul>
              <li>✅ Luz natural ou bem iluminada</li>
              <li>✅ Fundo simples e limpo</li>
              <li>✅ Foto clara do seu rosto</li>
              <li>✅ Arquivo em formato JPG ou PNG</li>
              <li>✅ Tamanho máximo: 5MB</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancelar"
            onClick={onClose}
          >
            ✕ Cancelar
          </button>
          <button 
            className="btn-salvar"
            onClick={handleSave}
            disabled={!preview || saving}
          >
            {saving ? '⏳ Salvando...' : '✅ Salvar Foto'}
          </button>
        </div>
      </div>
    </div>
  )
}