import React, { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.8 10.8 0 0112 4c5 0 8.5 4.2 9.5 6-.4.8-1.2 2-2.3 3.2M6.5 6.5C4.4 8 3 10.2 2.5 12c1 1.8 4.5 6 9.5 6 1.5 0 2.8-.4 4-.9" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6S18 18 12 18 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>
  )
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16.5h.01" />
    </svg>
  )
}

function getAuthError(error) {
  if (!error.response) return 'Não foi possível conectar à plataforma. Verifique sua internet e tente novamente.'
  if (error.response.status === 429) return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.'
  return error.response.data?.error || 'Não foi possível concluir sua solicitação. Tente novamente.'
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading, establishSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!authLoading && user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/aluno'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password || (isRegister && !name.trim())) {
      setError('Preencha todos os campos para continuar.')
      return
    }

    if (isRegister && password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setLoading(true)

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const payload = isRegister
        ? { email: email.trim(), password, name: name.trim() }
        : { email: email.trim(), password }

      const { data } = await api.post(endpoint, payload)
      const sessionUser = await establishSession(data)
      const fallback = sessionUser.role === 'ADMIN' ? '/admin' : '/aluno'
      const destination = location.state?.from?.pathname || fallback
      navigate(destination, { replace: true })
    } catch (err) {
      setError(getAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  function toggleMode() {
    setIsRegister((current) => !current)
    setError('')
    setPassword('')
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-label="Bruna Affonso">
        <div className="brand-overlay" />
        <div className="brand-content">
          <div className="brand-kicker">Plataforma de acompanhamento</div>
          <h1>Treino com direção, evolução com consistência.</h1>
          <p>Um ambiente exclusivo para acompanhar seus treinos, semanas, evolução e contato com sua profissional.</p>
          <div className="brand-proof">
            <span>Treinos organizados</span>
            <span>Acompanhamento semanal</span>
            <span>Evolução centralizada</span>
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-container">
          <div className="login-logo-row">
            <div className="login-logo" style={{ backgroundImage: 'url(https://i.imgur.com/RU6wtlH.jpg)' }} role="img" aria-label="Logo Bruna Affonso" />
            <div>
              <strong>Bruna Affonso</strong>
              <span>Personal Training</span>
            </div>
          </div>

          <div className="login-heading">
            <span className="login-eyebrow">{isRegister ? 'Comece sua jornada' : 'Bem-vindo de volta'}</span>
            <h2>{isRegister ? 'Crie sua conta' : 'Acesse sua plataforma'}</h2>
            <p>{isRegister ? 'Preencha seus dados para solicitar acesso.' : 'Entre com seus dados para continuar seu acompanhamento.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {isRegister && (
              <label className="auth-field">
                <span>Nome completo</span>
                <input type="text" autoComplete="name" placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} aria-invalid={Boolean(error)} required />
              </label>
            )}

            <label className="auth-field">
              <span>E-mail</span>
              <input type="email" autoComplete="email" inputMode="email" placeholder="voce@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} aria-invalid={Boolean(error)} aria-describedby={error ? 'auth-error' : undefined} required />
            </label>

            <label className="auth-field">
              <span>Senha</span>
              <div className="password-field">
                <input type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder={isRegister ? 'Mínimo de 8 caracteres' : 'Digite sua senha'} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} aria-invalid={Boolean(error)} aria-describedby={error ? 'auth-error' : undefined} minLength={isRegister ? 8 : undefined} required />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} disabled={loading} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword}>
                  <EyeIcon hidden={showPassword} />
                </button>
              </div>
            </label>

            {!isRegister && (
              <div className="login-support-row">
                <span>Use o e-mail cadastrado na plataforma.</span>
                <button type="button" className="text-button" disabled title="Recuperação de senha será habilitada quando o backend de e-mail estiver configurado">Esqueci minha senha</button>
              </div>
            )}

            {error && <div id="auth-error" className="auth-alert" role="alert" aria-live="polite"><AlertIcon /><span>{error}</span></div>}

            <button type="submit" className="submit-button" disabled={loading || authLoading}>
              {loading || authLoading ? <><span className="button-spinner" /> {authLoading ? 'Verificando sessão...' : 'Processando...'}</> : isRegister ? 'Solicitar acesso' : 'Entrar na plataforma'}
            </button>
          </form>

          <div className="auth-toggle">
            <span>{isRegister ? 'Já possui cadastro?' : 'Ainda não possui cadastro?'}</span>
            <button type="button" className="toggle-button" onClick={toggleMode}>{isRegister ? 'Entrar' : 'Criar conta'}</button>
          </div>

          <footer className="login-footer">
            © 2026 Bruna Affonso. Ambiente exclusivo para alunos. · <Link to="/privacidade">Privacidade</Link>
          </footer>
        </div>
      </section>
    </main>
  )
}
