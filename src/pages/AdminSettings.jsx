import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminSettings.css'

export default function AdminSettings({ user, token, onNavigate }) {
  const [settings, setSettings] = useState({
    phone: '',
    whatsappUrl: '',
    motivationalPhrase: '',
    profileImage: '',
    logo: ''
  })
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const response = await api.get('/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSettings(response.data)
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
      const payload = {
        phone: settings.phone || '',
        whatsappUrl: settings.whatsappUrl || '',
        motivationalPhrase: settings.motivationalPhrase || '',
        profileImage: settings.profileImage || '',
        logo: settings.logo || ''
      }

      await api.put('/admin/settings', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      fetchSettings()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('❌ Erro ao salvar configurações')
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
        {/* SEÇÃO 1: IMAGENS */}
        <div className="settings-section">
          <h3>📸 Imagens</h3>

          <div className="form-group">
            <label>👩 Foto de Perfil</label>
            <div className="photo-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      setSettings({...settings, profileImage: event.target.result})
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                id="profile-photo"
              />
              <label htmlFor="profile-photo" className="upload-btn">
                📤 Clique para fazer upload
              </label>
            </div>
            {settings.profileImage && settings.profileImage.startsWith('data:') && (
              <div className="photo-preview">
                <img src={settings.profileImage} alt="Perfil" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>🎨 Logo da Marca</label>
            <div className="photo-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      setSettings({...settings, logo: event.target.result})
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                id="logo-photo"
              />
              <label htmlFor="logo-photo" className="upload-btn">
                📤 Clique para fazer upload
              </label>
            </div>
            {settings.logo && settings.logo.startsWith('data:') && (
              <div className="logo-preview">
                <img src={settings.logo} alt="Logo" />
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
          <li><strong>Foto de Perfil:</strong> Clique para fazer upload da sua foto</li>
          <li><strong>Logo:</strong> Clique para fazer upload do logo da sua marca</li>
          <li><strong>Telefone:</strong> Seu número para contato com alunos</li>
          <li><strong>WhatsApp:</strong> Link direto para iniciar conversa</li>
          <li><strong>Frase:</strong> Algo motivador que inspira seus alunos diariamente</li>
        </ul>
      </div>
    </div>
  )
}