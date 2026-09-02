import React, { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import './AdminAdministrators.css'

function Initials({ user }) {
  const initials = user.name?.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'AD'
  return <span className="adm-avatar">{user.profilePhoto ? <img src={user.profilePhoto} alt="" /> : initials}</span>
}

function formatDate(value) {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return 'data não informada'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function accountStatus(status) {
  if (status === 'APPROVED') return 'aprovado'
  if (status === 'PENDING') return 'aguardando aprovação'
  if (status === 'INACTIVE') return 'inativo'
  if (status === 'REJECTED') return 'rejeitado'
  return 'status não informado'
}

export default function AdminAdministrators() {
  const [administrators, setAdministrators] = useState([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [candidates, setCandidates] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  const loadAdministrators = useCallback(async () => {
    const { data } = await api.get('/admin/administrators')
    setAdministrators(Array.isArray(data?.administrators) ? data.administrators : [])
    setCurrentUserId(data.currentUserId || '')
  }, [])

  const loadCandidates = useCallback(async (search = '') => {
    const { data } = await api.get('/admin/administrators/candidates', { params: search ? { q: search } : {} })
    setCandidates(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    Promise.all([loadAdministrators(), loadCandidates()])
      .catch(() => setFeedback({ type: 'error', text: 'Não foi possível carregar os administradores.' }))
      .finally(() => setLoading(false))
  }, [loadAdministrators, loadCandidates])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCandidates(query).catch(() => setFeedback({ type: 'error', text: 'Não foi possível buscar as contas.' }))
    }, 300)
    return () => clearTimeout(timer)
  }, [query, loadCandidates])

  const candidateLabel = useMemo(() => query ? 'Resultados da busca' : 'Contas disponíveis', [query])

  async function executeAction() {
    if (!confirmation) return
    try {
      setBusy(true)
      setFeedback(null)
      const endpoint = confirmation.action === 'promote'
        ? `/admin/administrators/${confirmation.user.id}/promote`
        : `/admin/administrators/${confirmation.user.id}/remove`
      const { data } = await api.put(endpoint)
      setConfirmation(null)
      await Promise.all([loadAdministrators(), loadCandidates(query)])
      setFeedback({ type: 'success', text: data.message })
    } catch (error) {
      setFeedback({ type: 'error', text: error.response?.data?.error || 'Não foi possível concluir a alteração.' })
      setConfirmation(null)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="adm-loading">Carregando administradores…</div>

  return <section className="adm-page">
    <header className="adm-heading">
      <div><span className="admin-eyebrow">Controle de acesso</span><h2>Administradores</h2><p>Gerencie quem pode acessar todo o painel administrativo da plataforma.</p></div>
      <div className="adm-count"><strong>{administrators.length}</strong><span>{administrators.length === 1 ? 'administrador ativo' : 'administradores ativos'}</span></div>
    </header>

    {feedback && <div className={`adm-feedback ${feedback.type}`} role="status">{feedback.text}<button onClick={() => setFeedback(null)} aria-label="Fechar">×</button></div>}

    <section className="adm-card">
      <div className="adm-card-title"><div className="adm-title-icon">✓</div><div><h3>Acessos ativos</h3><p>Estas pessoas possuem acesso completo ao painel.</p></div></div>
      <div className="adm-list">
        {administrators.map((administrator) => {
          const isCurrent = administrator.id === currentUserId
          const isOnlyAdministrator = administrators.length === 1
          return <article key={administrator.id} className="adm-row">
            <Initials user={administrator} />
            <div className="adm-identity"><strong>{administrator.name}</strong><span>{administrator.email}</span><small>Administrador desde {formatDate(administrator.createdAt)}</small></div>
            <div className="adm-badges"><span className="adm-role">Administrador</span>{isCurrent && <span className="adm-you">Você</span>}</div>
            <button className="adm-remove" disabled={isCurrent || isOnlyAdministrator} title={isCurrent ? 'Outro administrador deve remover o seu acesso' : isOnlyAdministrator ? 'O último administrador não pode ser removido' : ''} onClick={() => setConfirmation({ action: 'remove', user: administrator })}>Remover acesso</button>
          </article>
        })}
      </div>
      <div className="adm-security-note"><span>i</span><p><strong>Proteção de segurança</strong>O sistema não permite remover o último administrador nem o próprio acesso. Essas regras também são verificadas pelo servidor.</p></div>
    </section>

    <section className="adm-card">
      <div className="adm-card-title"><div className="adm-title-icon add">+</div><div><h3>Adicionar administrador</h3><p>A pessoa precisa criar uma conta normalmente antes de receber acesso administrativo.</p></div></div>
      <label className="adm-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou e-mail" aria-label="Buscar conta" /></label>
      <div className="adm-candidate-heading"><strong>{candidateLabel}</strong><span>{candidates.length} {candidates.length === 1 ? 'conta encontrada' : 'contas encontradas'}</span></div>
      <div className="adm-list candidates">
        {candidates.map((candidate) => <article key={candidate.id} className="adm-row">
          <Initials user={candidate} />
          <div className="adm-identity"><strong>{candidate.name || 'Nome não informado'}</strong><span>{candidate.email || 'E-mail não informado'}</span><small>Cadastro {accountStatus(candidate.status)}</small></div>
          <button className="adm-promote" onClick={() => setConfirmation({ action: 'promote', user: candidate })}>Tornar administrador</button>
        </article>)}
        {!candidates.length && <div className="adm-empty"><strong>Nenhuma conta disponível</strong><span>Peça para a pessoa se cadastrar na plataforma e tente novamente.</span></div>}
      </div>
    </section>

    {confirmation && <div className="adm-modal-backdrop" role="presentation" onMouseDown={() => !busy && setConfirmation(null)}><div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="adm-confirm-title" onMouseDown={(event) => event.stopPropagation()}><div className={`adm-modal-icon ${confirmation.action}`}>{confirmation.action === 'promote' ? '↑' : '!'}</div><h3 id="adm-confirm-title">{confirmation.action === 'promote' ? 'Conceder acesso administrativo?' : 'Remover acesso administrativo?'}</h3><p>{confirmation.action === 'promote' ? <><strong>{confirmation.user.name}</strong> poderá visualizar e alterar todas as áreas administrativas da plataforma.</> : <><strong>{confirmation.user.name}</strong> deixará de acessar o painel e voltará a ter uma conta comum de aluna.</>}</p><div className="adm-modal-user"><Initials user={confirmation.user}/><span><strong>{confirmation.user.name}</strong><small>{confirmation.user.email}</small></span></div><div className="adm-modal-actions"><button disabled={busy} onClick={() => setConfirmation(null)}>Cancelar</button><button disabled={busy} className={confirmation.action === 'remove' ? 'danger' : 'primary'} onClick={executeAction}>{busy ? 'Salvando…' : confirmation.action === 'promote' ? 'Sim, conceder acesso' : 'Sim, remover acesso'}</button></div></div></div>}
  </section>
}
