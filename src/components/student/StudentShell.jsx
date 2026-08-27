import React, { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell'

const items = [
  ['','Início','home'],
  ['avaliacao','Avaliação','activity'],
  ['treinos','Meus treinos','calendar'],
  ['acompanhamento','Acompanhamento','chart'],
  ['videos','VideoAulas','play'],
  ['perguntas','Perguntas','message'],
  ['ranking','Ranking','trophy'],
  ['perfil','Perfil','user']
]

function Icon({ name }) {
  const paths = {
    home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
    activity: <><path d="M3 12h4l2-5 4 10 2-5h6"/></>,
    play: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3Z"/></>,
    message: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/></>,
    trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0Z"/><path d="M6 6H3a3 3 0 0 0 3 4M18 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

export default function StudentShell({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const title = items.find(([path]) => location.pathname.endsWith(path) || (!path && location.pathname === '/aluno'))?.[1] || 'Área do Aluno'

  return (
    <div className="student-shell">
      <aside className={`student-sidebar ${open ? 'is-open' : ''}`}>
        <div className="student-brand">
          <div className="student-brand-mark">BA</div>
          <div><strong>Bruna Affonso</strong><span>Treinamento</span></div>
        </div>
        <nav className="student-nav">
          {items.map(([path,label,icon]) => (
            <NavLink key={label} end={!path} to={path || '.'} onClick={() => setOpen(false)} className={({isActive}) => isActive ? 'active' : ''}>
              <Icon name={icon}/><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="student-logout" onClick={onLogout}><Icon name="logout"/><span>Sair</span></button>
      </aside>
      {open && <button className="student-backdrop" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      <div className="student-main">
        <header className="student-topbar">
          <button className="student-menu-btn" onClick={() => setOpen(true)} aria-label="Abrir menu"><Icon name="menu"/></button>
          <div><span className="student-eyebrow">Área do aluno</span><h1>{title}</h1></div>
          <div className="student-topbar-actions">
            <NotificationBell />
            <div className="student-user-chip">
              <div className="student-avatar">{user?.profilePhoto ? <img src={user.profilePhoto} alt=""/> : (user?.name?.[0] || 'A')}</div>
              <div><strong>{user?.name}</strong><span>{user?.email}</span></div>
            </div>
          </div>
        </header>
        <main className="student-page"><Outlet /></main>
      </div>
      <nav className="student-bottom-nav">
        {items.slice(0,5).map(([path,label,icon]) => (
          <NavLink key={label} end={!path} to={path || '.'} className={({isActive}) => isActive ? 'active' : ''}>
            <Icon name={icon}/><span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
