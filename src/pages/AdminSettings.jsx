import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import AdminLayout from '../components/AdminLayout'
import './AdminSettings.css'

export default function AdminSettings({ user, token }) {
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
      <AdminLayout user={user} token={token}>
        <div className="loading">Carregando configurações...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout user={user} token={token}>
      <div className="admin-settings">
        <h1>⚙️ Configurações</h1>

        <form className="settings-form" onSubmit={handleSaveSettings}>
          <div className="form-section">
            <h2>Informações Pessoais</h2>

            <div className="form-group">
              <label>📞 Telefone</label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={settings.phone || ''}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>💬 Link WhatsApp</label>
              <input
                type="url"
                placeholder="https://wa.me/5511999999999"
                value={settings.whatsappUrl || ''}
                onChange={(e) => setSettings({...settings, whatsappUrl: e.target.value})}
              />
              <small>Formato: https://wa.me/SEU_TELEFONE</small>
            </div>

            <div className="form-group">
              <label>🎯 Frase Motivacional</label>
              <textarea
                placeholder="Digite uma mensagem motivacional para seus alunos..."
                value={settings.motivationalPhrase || ''}
                onChange={(e) => setSettings({...settings, motivationalPhrase: e.target.value})}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>📸 URL da Foto de Perfil</label>
              <input
                type="url"
                placeholder="https://..."
                value={settings.profileImage || ''}
                onChange={(e) => setSettings({...settings, profileImage: e.target.value})}
              />
            </div>

            {settings.profileImage && (
              <div className="profile-preview">
                <p>Preview:</p>
                <img src={settings.profileImage} alt="Perfil" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save-settings">
              ✅ Salvar Configurações
            </button>
          </div>

          {saved && (
            <div className="success-message">
              ✅ Configurações salvas com sucesso!
            </div>
          )}
        </form>

        <div className="info-box">
          <h3>💡 Dicas</h3>
          <ul>
            <li><strong>Telefone:</strong> Seu número de contato para os alunos</li>
            <li><strong>WhatsApp:</strong> Link direto para iniciar conversa no WhatsApp</li>
            <li><strong>Frase Motivacional:</strong> Aparecerá no dashboard dos alunos</li>
            <li><strong>Foto de Perfil:</strong> URL de uma imagem (use imgur, etc)</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}