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
      setError(err.response?.data?.error || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>💪 BRUNA AFFONSO</h1>
          <p>Treinos Exclusivos</p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Seu Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Carregando...' : isRegister ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div className="toggle-register">
          <p>
            {isRegister ? 'Já tem conta?' : 'Não tem conta?'}
            <button 
              type="button"
              className="link-button"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
              }}
            >
              {isRegister ? 'Fazer Login' : 'Criar Conta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}