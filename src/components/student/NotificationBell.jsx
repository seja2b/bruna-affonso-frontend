import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import './NotificationBell.css'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  )
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadNotifications() }, [])

  async function loadNotifications() {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/notifications')
      setItems(response.data?.notifications || [])
      setUnreadCount(response.data?.unreadCount || 0)
    } catch (err) {
      setError('Não foi possível carregar as notificações.')
    } finally {
      setLoading(false)
    }
  }

  async function markRead(notification) {
    if (notification.isRead) return
    try {
      await api.put(`/notifications/${notification.id}/read`)
      setItems((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item))
      setUnreadCount((count) => Math.max(0, count - 1))
    } catch (err) {
      setError('Não foi possível atualizar a notificação.')
    }
  }

  async function markAllRead() {
    if (unreadCount === 0) return
    try {
      await api.put('/notifications/read-all')
      setItems((current) => current.map((item) => ({ ...item, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      setError('Não foi possível marcar todas como lidas.')
    }
  }

  return (
    <div className="notification-center">
      <button className="notification-trigger" onClick={() => setOpen((value) => !value)} aria-label="Notificações" aria-expanded={open}>
        <BellIcon />
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <div><span>Central</span><strong>Notificações</strong></div>
            <button onClick={markAllRead} disabled={unreadCount === 0}>Marcar todas como lidas</button>
          </div>

          {loading ? (
            <div className="notification-state">Carregando notificações...</div>
          ) : error ? (
            <div className="notification-state error"><p>{error}</p><button onClick={loadNotifications}>Tentar novamente</button></div>
          ) : items.length === 0 ? (
            <div className="notification-state">Você ainda não possui notificações.</div>
          ) : (
            <div className="notification-list">
              {items.slice(0, 12).map((notification) => (
                <button key={notification.id} className={`notification-item ${notification.isRead ? 'read' : 'unread'}`} onClick={() => markRead(notification)}>
                  <span className="notification-dot" />
                  <span className="notification-copy">
                    <strong>{notification.title}</strong>
                    <span>{notification.message}</span>
                    <small>{dateFormatter.format(new Date(notification.createdAt))}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
