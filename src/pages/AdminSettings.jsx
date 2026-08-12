import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import AdminLayout from '../components/AdminLayout'
import './AdminSettings.css'

export default function AdminSettings({ user, token, onNavigate }) {
  const [settings, setSettings] = useState({
    phone: '',
    whatsappUrl: '',
    motivationalPhrase: '',
    profileImage: ''
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
      await api.put('/admin/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      alert('Erro ao salvar configurações')
    }
  }

  if (loading) {
    return (
      <AdminLayout user={user} token={token} onNavigate={onNavigate} currentPage="settings">
        <div className="loading">Carregando configurações...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout user={user} token={token} onNavigate={onNavigate} currentPage="settings">
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Configurações</h1>
            <p className="page-subtitle">Gerencie seus dados e informações</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="settings-form">
          <div className="settings-section">
            <h2>Informações de Contato</h2>
            <p className="section-description">Atualize seus dados de contato</p>

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
              <label>Link WhatsApp</label>
              <input
                type="url"
                placeholder="https://wa.me/5511999999999"
                value={settings.whatsappUrl || ''}
                onChange={(e) => setSettings({...settings, whatsappUrl: e.target.value})}
              />
              <small>Formato: https://wa.me/SEU_NUMERO</small>
            </div>
          </div>

          <div className="settings-section">
            <h2>Perfil Público</h2>
            <p className="section-description">Customize sua presença na plataforma</p>

            <div className="form-group">
              <label>Foto de Perfil</label>
              <input
                type="url"
                placeholder="https://..."
                value={settings.profileImage || ''}
                onChange={(e) => setSettings({...settings, profileImage: e.target.value})}
              />
              {settings.profileImage && (
                <div className="profile-preview">
                  <img src={settings.profileImage} alt="Perfil" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Frase Motivacional</label>
              <textarea
                placeholder="Digite uma mensagem inspiradora para seus alunos..."
                value={settings.motivationalPhrase || ''}
                onChange={(e) => setSettings({...settings, motivationalPhrase: e.target.value})}
                rows="4"
              />
              <small>Esta frase aparecerá no dashboard dos seus alunos</small>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save">
              Salvar Configurações
            </button>
            {saved && <div className="success-message">Configurações salvas com sucesso!</div>}
          </div>
        </form>

        <div className="info-card">
          <h3>Dicas</h3>
          <ul>
            <li><strong>Telefone:</strong> Seu número para contato com alunos</li>
            <li><strong>WhatsApp:</strong> Link direto para iniciar conversa no WhatsApp</li>
            <li><strong>Foto:</strong> Recomenda-se uma imagem quadrada (200x200px)</li>
            <li><strong>Frase:</strong> Algo motivador para inspirar seus alunos diariamente</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}