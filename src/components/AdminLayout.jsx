import React, { useState } from 'react'
import './AdminLayout.css'

export default function AdminLayout({ user, token, children, onNavigate, currentPage }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'students', icon: '👥', label: 'Alunos' },
    { id: 'workouts', icon: '💪', label: 'Treinos' },
    { id: 'questions', icon: '💬', label: 'Perguntas' },
    { id: 'settings', icon: '⚙️', label: 'Configurações' }
  ]

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">BA</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Fechar' : 'Abrir'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <span className="menu-icon">{item.icon}</span>
              {sidebarOpen && <span className="menu-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-button"
            onClick={() => {
              localStorage.removeItem('token')
              window.location.href = '/'
            }}
            title="Sair"
          >
            <span className="logout-icon">🚪</span>
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1 className="page-title">Bruna Affonso</h1>
          <div className="header-user">
            <span className="user-name">{user.name}</span>
            <div className="user-avatar">{user.name.charAt(0)}</div>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}