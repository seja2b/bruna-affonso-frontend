import React, { useState } from 'react'
import { api } from '../services/api'
import './Login.css'

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const data = isRegister 
        ? { email, password, name } 
        : { email, password }

      const response = await api.post(endpoint, data)
      onLoginSuccess(response.data.token)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao processar solicitação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-background" />
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-box">
              <div 
                className="logo" 
                style={{
                  backgroundImage: 'url(https://i.imgur.com/RU6wtlH.jpg)'
                }}
              />
            </div>
            <h1>Bruna Affonso</h1>
            <p className="tagline">Sua assistente de Treino</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {isRegister && (
              <div className="form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Processando...' : isRegister ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <div className="auth-toggle">
            <p>
              {isRegister ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
              <button
                type="button"
                className="toggle-button"
                onClick={() => {
                  setIsRegister(!isRegister)
                  setError('')
                }}
              >
                {isRegister ? 'Faça login' : 'Crie uma conta'}
              </button>
            </p>
          </div>

          <div className="login-footer">
            <p>&copy; 2026 Bruna Affonso. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}