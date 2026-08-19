import React, { useEffect, useState } from 'react'
import api from '../services/api'
import './AdminSettings.css'

const emptySettings = {
  phone: '',
  whatsappUrl: '',
  motivationalPhrase: '',
  profileImage: '',
  logo: ''
}

function Icon({ name }) {
  const paths = {
    image: <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></>,
    quote: <><path d="M9 11H4a5 5 0 0 1 5-5v9a3 3 0 0 1-3 3M20 11h-5a5 5 0 0 1 5-5v9a3 3 0 0 1-3 3"/></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M20 15v5H4v-5"/></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    alert: <><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/></>
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

export default function AdminSettings() {
  const [settings, setSettings] = useState(emptySettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => { fetchSettings() }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      setFeedback(null)
      const { data } = await api.get('/admin/settings')
      setSettings({ ...emptySettings, ...data })
    } catch (error) {
      console.error('Erro ao buscar configurações', error)
      setFeedback({ type: 'error', message: 'Não foi possível carregar as configurações da plataforma.' })
    } finally {
      setLoading(false)
    }
  }

  function updateField(field, value) {
    setSettings((current) => ({ ...current, [field]: value }))
    setFeedback(null)
  }

  function handleImage(field, file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Selecione um arquivo de imagem válido.' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'A imagem deve ter no máximo 2 MB.' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => updateField(field, reader.result)
    reader.onerror = () => setFeedback({ type: 'error', message: 'Não foi possível processar a imagem.' })
    reader.readAsDataURL(file)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      setSaving(true)
      setFeedback(null)
      const payload = Object.fromEntries(Object.keys(emptySettings).map((key) => [key, settings[key] || '']))
      const { data } = await api.put('/admin/settings', payload)
      const nextSettings = { ...emptySettings, ...(data.settings || payload) }
      setSettings(nextSettings)
      window.dispatchEvent(new CustomEvent('platform-settings-updated', { detail: nextSettings }))
      setFeedback({ type: 'success', message: 'Identidade e conteúdo da plataforma atualizados.' })
    } catch (error) {
      console.error('Erro ao salvar configurações', error)
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Não foi possível salvar as configurações.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="settings-state" aria-live="polite"><span className="settings-spinner" />Carregando configurações...</div>

  return (
    <section className="platform-settings">
      <header className="settings-hero">
        <div><span className="settings-kicker">Identidade da plataforma</span><h2>Configurações</h2><p>Gerencie como sua marca, seus canais de contato e sua mensagem aparecem para os alunos.</p></div>
        <div className="settings-status"><span>Portal do aluno</span><strong>Personalizado</strong></div>
      </header>

      {feedback && <div className={'settings-feedback ' + feedback.type} role="status"><Icon name={feedback.type === 'success' ? 'check' : 'alert'} /><span>{feedback.message}</span></div>}

      <form onSubmit={handleSubmit} className="settings-layout">
        <div className="settings-main-column">
          <article className="settings-card">
            <div className="settings-card-heading"><span className="settings-icon"><Icon name="image" /></span><div><h3>Identidade visual</h3><p>Foto da professora e logo exibidas nos pontos principais da experiência.</p></div></div>
            <div className="brand-assets-grid">
              <div className="asset-editor">
                <div className="asset-preview teacher">
                  {settings.profileImage ? <img src={settings.profileImage} alt="Foto atual da professora" /> : <span>BA</span>}
                </div>
                <div><strong>Foto da professora</strong><p>Use uma foto quadrada, nítida e profissional.</p></div>
                <label className="asset-upload"><Icon name="upload" /><span>{settings.profileImage ? 'Trocar foto' : 'Adicionar foto'}</span><input type="file" accept="image/*" onChange={(event) => handleImage('profileImage', event.target.files?.[0])} /></label>
              </div>

              <div className="asset-editor">
                <div className="asset-preview logo">
                  {settings.logo ? <img src={settings.logo} alt="Logo atual da plataforma" /> : <span>Bruna Affonso</span>}
                </div>
                <div><strong>Logo da marca</strong><p>PNG transparente ou imagem horizontal funciona melhor.</p></div>
                <label className="asset-upload"><Icon name="upload" /><span>{settings.logo ? 'Trocar logo' : 'Adicionar logo'}</span><input type="file" accept="image/*" onChange={(event) => handleImage('logo', event.target.files?.[0])} /></label>
              </div>
            </div>
          </article>

          <article className="settings-card phrase-card">
            <div className="settings-card-heading"><span className="settings-icon"><Icon name="quote" /></span><div><h3>Frase do dia</h3><p>Uma mensagem da professora em destaque no início do portal dos alunos.</p></div></div>
            <label className="settings-field"><span>Mensagem para os alunos</span><textarea rows="4" maxLength="500" value={settings.motivationalPhrase || ''} onChange={(event) => updateField('motivationalPhrase', event.target.value)} placeholder="Ex.: A consistência de hoje constrói a evolução de amanhã." /><small>{(settings.motivationalPhrase || '').length}/500 caracteres</small></label>
            <div className="phrase-live-preview">
              <span>Prévia no portal do aluno</span>
              <blockquote>{settings.motivationalPhrase || 'Sua frase do dia aparecerá aqui para todos os alunos.'}</blockquote>
              <small>— Bruna Affonso</small>
            </div>
          </article>

          <article className="settings-card">
            <div className="settings-card-heading"><span className="settings-icon"><Icon name="phone" /></span><div><h3>Contato profissional</h3><p>Dados usados no cartão de contato disponível aos alunos.</p></div></div>
            <div className="settings-fields-grid">
              <label className="settings-field"><span>Telefone</span><input type="tel" maxLength="30" value={settings.phone || ''} onChange={(event) => updateField('phone', event.target.value)} placeholder="(11) 99999-9999" /></label>
              <label className="settings-field"><span>Link direto do WhatsApp</span><input type="url" value={settings.whatsappUrl || ''} onChange={(event) => updateField('whatsappUrl', event.target.value)} placeholder="https://wa.me/5511999999999" /><small>Informe o endereço completo, incluindo https://</small></label>
            </div>
          </article>
        </div>

        <aside className="settings-preview-column">
          <div className="portal-preview">
            <div className="portal-preview-top"><span>Prévia da marca</span><strong>Portal do aluno</strong></div>
            <div className="portal-brand-preview">
              <div className="portal-teacher-photo">{settings.profileImage ? <img src={settings.profileImage} alt="" /> : 'BA'}</div>
              <div>{settings.logo ? <img className="portal-logo-preview" src={settings.logo} alt="Logo" /> : <strong>Bruna Affonso</strong>}<span>Personal Training</span></div>
            </div>
            <div className="portal-message-preview"><Icon name="quote" /><p>{settings.motivationalPhrase || 'Adicione uma frase do dia para inspirar seus alunos.'}</p></div>
            {(settings.phone || settings.whatsappUrl) && <div className="portal-contact-preview"><span>Contato</span><strong>{settings.phone || 'WhatsApp disponível'}</strong></div>}
          </div>

          <button className="settings-save-button" type="submit" disabled={saving}><Icon name="save" />{saving ? 'Salvando alterações...' : 'Salvar configurações'}</button>
          <p className="settings-save-note">As alterações ficam disponíveis para os alunos após salvar.</p>
        </aside>
      </form>
    </section>
  )
}
