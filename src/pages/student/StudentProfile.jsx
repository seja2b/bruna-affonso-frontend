import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import './StudentProfile.css'

function normalizePhone(value) {
  return value.replace(/[^0-9()+\-\s]/g, '').slice(0, 30)
}

export default function StudentProfile() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', profilePhoto: '' })
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      profilePhoto: user?.profilePhoto || ''
    })
  }, [user])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      await api.put('/auth/me', form)
      await refreshUser()
      setFeedback({ type: 'success', message: 'Perfil atualizado com sucesso.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Não foi possível atualizar seu perfil.' })
    } finally {
      setSaving(false)
    }
  }

  function handlePhotoFile(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Selecione um arquivo de imagem.' })
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'A foto deve ter no máximo 3 MB.' })
      return
    }

    const reader = new FileReader()
    reader.onload = () => setForm((current) => ({ ...current, profilePhoto: String(reader.result || '') }))
    reader.readAsDataURL(file)
  }

  const initials = user?.name?.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A'

  return (
    <section className="student-profile-v2">
      <div className="profile-heading">
        <div>
          <span className="profile-kicker">Conta e dados pessoais</span>
          <h2>Meu perfil</h2>
          <p>Mantenha seus dados atualizados para facilitar seu acompanhamento.</p>
        </div>
        <span className={`profile-status ${user?.status?.toLowerCase()}`}>{user?.status === 'APPROVED' ? 'Conta ativa' : user?.status}</span>
      </div>

      {feedback && <div className={`profile-feedback ${feedback.type}`} role="status">{feedback.message}</div>}

      <form onSubmit={handleSubmit} className="profile-layout">
        <aside className="profile-photo-card">
          <div className="profile-photo-preview">
            {form.profilePhoto ? <img src={form.profilePhoto} alt="Sua foto de perfil" /> : <span>{initials}</span>}
          </div>
          <div>
            <strong>Sua foto</strong>
            <p>Use uma foto nítida para deixar seu perfil mais pessoal.</p>
          </div>
          <label className="profile-photo-button">
            Escolher foto
            <input type="file" accept="image/*" onChange={handlePhotoFile} />
          </label>
          {form.profilePhoto && <button type="button" className="profile-photo-remove" onClick={() => setForm((current) => ({ ...current, profilePhoto: '' }))}>Remover foto</button>}
        </aside>

        <div className="profile-form-card">
          <div className="profile-section-head"><div><span>Informações pessoais</span><h3>Dados do aluno</h3></div></div>

          <div className="profile-form-grid">
            <label><span>Nome completo</span><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} minLength="2" maxLength="120" required /></label>
            <label><span>Telefone / WhatsApp</span><input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: normalizePhone(event.target.value) }))} placeholder="(00) 00000-0000" inputMode="tel" /></label>
            <label className="profile-email-field"><span>E-mail</span><input value={user?.email || ''} disabled /><small>O e-mail de acesso não pode ser alterado por aqui.</small></label>
          </div>

          <div className="profile-security-note">
            <div className="profile-security-icon">✓</div>
            <div><strong>Conta protegida</strong><p>Alterações de papel, status e acesso ficam sob controle administrativo.</p></div>
          </div>

          <div className="profile-actions"><button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button></div>
        </div>
      </form>
    </section>
  )
}
