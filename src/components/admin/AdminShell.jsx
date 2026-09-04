import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import api from '../../services/api'
import NotificationBell from '../student/NotificationBell'

const items = [
  ['','Dashboard','grid'],
  ['alunos','Alunos','users'],
  ['avaliacoes','Avaliações','activity'],
  ['acompanhamentos','Acompanhamentos','chart'],
  ['perguntas','Perguntas','message'],
  ['videos','VideoAulas','video'],
  ['ebooks','E-books','book'],
  ['ranking','Ranking','trophy'],
  ['administradores','Administradores','shield'],
  ['configuracoes','Configurações','settings']
]

function Icon({ name }) {
  const paths = {
    grid:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    users:<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    activity:<><path d="M3 12h4l2-5 4 10 2-5h6"/></>,
    chart:<><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
    message:<><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/></>,
    video:<><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m10 9 4 3-4 3Z"/><path d="m17 10 4-2v8l-4-2"/></>,
    book:<><path d="M4 5a3 3 0 0 1 3-3h5v18H7a3 3 0 0 0-3 2Z"/><path d="M20 5a3 3 0 0 0-3-3h-5v18h5a3 3 0 0 1 3 2Z"/></>,
    trophy:<><path d="M8 4h8v5a4 4 0 0 1-8 0Z"/><path d="M6 6H3a3 3 0 0 0 3 4M18 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/></>,
    shield:<><path d="M12 22s8-3.8 8-10V5l-8-3-8 3v7c0 6.2 8 10 8 10Z"/><path d="M9 12l2 2 4-4"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.1.37.3.72.6 1 .3.27.68.4 1.1.4h.1v4h-.1c-.42 0-.8.13-1.1.4-.3.28-.5.63-.6 1Z"/></>,
    logout:<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></>,
    menu:<><path d="M4 7h16M4 12h16M4 17h16"/></>
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export default function AdminShell({ user, onLogout }) {
  const [open,setOpen]=useState(false)
  const [brandSettings,setBrandSettings]=useState({ profileImage: '', logo: '' })
  const location=useLocation()

  useEffect(()=>{
    let active=true
    function syncSettings(event){
      if(event?.detail){
        if(active) setBrandSettings(event.detail)
        return
      }
      api.get('/admin/settings').then(({data})=>{if(active) setBrandSettings(data||{})}).catch(()=>{})
    }
    syncSettings()
    window.addEventListener('platform-settings-updated',syncSettings)
    return()=>{active=false;window.removeEventListener('platform-settings-updated',syncSettings)}
  },[])

  const teacherImage=brandSettings.profileImage||user?.profilePhoto
  const title=items.find(([path])=>location.pathname.endsWith(path)||(!path&&location.pathname==='/admin'))?.[1]||'Administração'
  return <div className="admin-shell">
    <aside className={`admin-sidebar ${open?'is-open':''}`}>
      <div className="admin-brand"><div className="admin-brand-mark">{teacherImage?<img src={teacherImage} alt="Foto da professora"/>:'BA'}</div><div><strong>Bruna Affonso</strong><span>Administração</span></div></div>
      <nav className="admin-nav">{items.map(([path,label,icon])=><NavLink key={label} end={!path} to={path||'.'} onClick={()=>setOpen(false)} className={({isActive})=>isActive?'active':''}><Icon name={icon}/><span>{label}</span></NavLink>)}</nav>
      {brandSettings.logo&&<div className="admin-brand-signature"><img src={brandSettings.logo} alt="Logo Bruna Affonso"/></div>}
      <button className="admin-logout" onClick={onLogout}><Icon name="logout"/><span>Sair</span></button>
    </aside>
    {open&&<button className="admin-backdrop" aria-label="Fechar menu" onClick={()=>setOpen(false)}/>} 
    <div className="admin-main"><header className="admin-topbar"><button className="admin-menu-btn" onClick={()=>setOpen(true)} aria-label="Abrir menu"><Icon name="menu"/></button><div><span className="admin-eyebrow">Painel administrativo</span><h1>{title}</h1></div><NotificationBell/><div className="admin-user-chip"><div className="admin-avatar">{teacherImage?<img src={teacherImage} alt="Foto da professora"/>:(user?.name?.[0]||'A')}</div><div><strong>{user?.name}</strong><span>{user?.email}</span></div></div></header><main className="admin-page"><Outlet/></main></div>
  </div>
}
