import React, { useState } from 'react'
import './AdminLayout.css'

export default function AdminLayout({ user, token, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { icon: '📊', label: 'Dashboard', href: '/admin' },
    { icon: '👥', label: 'Alunos', href: '/admin/students' },
    { icon: '💪', label: 'Treinos', href: '/admin/workouts' },
    { icon: '📁', label: 'Categorias', href: '/admin/categories' },
    { icon: '❓', label: 'Perguntas', href: '/admin/questions' },
    { icon: '⚙️', label: 'Configurações', href: '/admin/settings' }
  ]

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>💪 ADMIN</h2>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, idx) => (
            <a key={idx} href={item.href} className="nav-item">
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            {sidebarOpen && (
              <>
                <p className="user-name">{user.name}</p>
                <p className="user-email">{user.email}</p>
              </>
            )}
          </div>
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/'
          }}>
            {sidebarOpen ? '🚪 Sair' : '🚪'}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>BRUNA AFFONSO - PAINEL ADMINISTRATIVO</h1>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}