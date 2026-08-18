import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminSettings.css'

export default function AdminSettings({ user, token, onNavigate }) {
  const [settings, setSettings] = useState({
    phone: '',
    whatsappUrl: '',
    motivationalPhrase: '',
    profileImage: null,
    logo: null
  })
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [profileImagePreview, setProfileImagePreview] = useState('')
  const [logoPreview, setLogoPreview] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const response = await api.get('/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSettings(response.data)
      if (response.data.profileImage) {
        setProfileImagePreview(response.data.profileImage)
      }
      if (response.data.logo) {
        setLogoPreview(response.data.logo)
      }
    } catch (error) {
      console.error('Erro ao buscar configurações', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault()
    setSaved(false)
    
    try {
      const formData = new FormData()
      formData.append('phone', settings.phone || '')
      formData.append('whatsappUrl', settings.whatsappUrl || '')
      formData.append('motivationalPhrase', settings.motivationalPhrase || '')
      
      if (settings.profileImage instanceof File) {
        formData.append('profileImage', settings.profileImage)
      }
      if (settings.logo instanceof File) {
        formData.append('logo', settings.logo)
      }

      await api.put('/admin/settings', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      fetchSettings()
    } catch (error) {
      alert('Erro ao salvar configurações')
    }
  }

  function handleProfileImageChange(e) {
    const file = e.target.files[0]
    if (file) {
      setSettings({...settings, profileImage: file})
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImagePreview(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleLogoChange(e) {
    const file = e.target.files[0]
    if (file) {
      setSettings({...settings, logo: file})
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoPreview(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return <div className="loading">Carregando configurações...</div>
  }

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <div>
          <h2>⚙️ Configurações</h2>
          <p>Gerencie seus dados e informações da plataforma</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="settings-form">
        {/* SEÇÃO 1: FOTOS */}
        <div className="settings-section">
          <h3>📸 Imagens</h3>

          <div className="form-group">
            <label>👩 Foto de Perfil</label>
            <div className="photo-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                id="profile-photo"
              />
              <label htmlFor="profile-photo" className="upload-btn">
                📤 Clique para fazer upload
              </label>
            </div>
            {profileImagePreview && (
              <div className="photo-preview">
                <img src={profileImagePreview} alt="Perfil" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>🎨 Logo da Marca</label>
            <div className="photo-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                id="logo-photo"
              />
              <label htmlFor="logo-photo" className="upload-btn">
                📤 Clique para fazer upload
              </label>
            </div>
            {logoPreview && (
              <div className="logo-preview">
                <img src={logoPreview} alt="Logo" />
              </div>
            )}
          </div>
        </div>

        {/* SEÇÃO 2: CONTATO */}
        <div className="settings-section">
          <h3>📱 Informações de Contato</h3>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              value={settings.phone || ''}
              onChange={(e) => setSettings({...settings, phone: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>💬 WhatsApp Link</label>
            <input
              type="url"
              placeholder="https://wa.me/5511999999999"
              value={settings.whatsappUrl || ''}
              onChange={(e) => setSettings({...settings, whatsappUrl: e.target.value})}
            />
            <small>Formato: https://wa.me/SEU_NUMERO</small>
          </div>
        </div>

        {/* SEÇÃO 3: MOTIVAÇÃO */}
        <div className="settings-section">
          <h3>✨ Frase Motivacional</h3>

          <div className="form-group">
            <label>Mensagem do Dia</label>
            <textarea
              placeholder="Digite uma mensagem inspiradora para seus alunos..."
              value={settings.motivationalPhrase || ''}
              onChange={(e) => setSettings({...settings, motivationalPhrase: e.target.value})}
              rows="4"
            />
            <small>Esta frase aparecerá no dashboard dos seus alunos</small>
          </div>

          {settings.motivationalPhrase && (
            <div className="frase-preview">
              <div className="preview-label">Preview para alunos:</div>
              <div className="preview-box">
                {settings.motivationalPhrase}
              </div>
            </div>
          )}
        </div>

        {/* BOTÃO SALVAR */}
        <div className="form-actions">
          <button type="submit" className="btn-salvar">
            💾 Salvar Configurações
          </button>
          {saved && <div className="success-message">✅ Configurações salvas com sucesso!</div>}
        </div>
      </form>

      {/* DICAS */}
      <div className="info-card">
        <h3>💡 Dicas</h3>
        <ul>
          <li><strong>Foto de Perfil:</strong> Sua foto aparecerá no painel e aos alunos</li>
          <li><strong>Logo:</strong> Imagem da sua marca (recomendado: 200x200px)</li>
          <li><strong>Telefone:</strong> Seu número para contato com alunos</li>
          <li><strong>WhatsApp:</strong> Link direto para iniciar conversa</li>
          <li><strong>Frase:</strong> Algo motivador que inspira seus alunos diariamente</li>
        </ul>
      </div>
    </div>
  )
}