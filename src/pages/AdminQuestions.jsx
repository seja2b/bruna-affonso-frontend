import React, { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import './AdminQuestions.css'

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [answeringId, setAnsweringId] = useState(null)
  const [answerText, setAnswerText] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchQuestions() }, [])

  async function fetchQuestions() {
    try {
      setLoading(true)
      const response = await api.get('/admin/questions')
      setQuestions(response.data || [])
    } catch (error) {
      setFeedback({ type: 'error', message: 'Não foi possível carregar as perguntas.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleAnswer(questionId) {
    const text = answerText.trim()
    if (!text) return setFeedback({ type: 'error', message: 'Digite uma resposta antes de enviar.' })

    try {
      setSaving(true)
      setFeedback(null)
      await api.post(`/admin/questions/${questionId}/answer`, { text })
      setAnsweringId(null)
      setAnswerText('')
      setFeedback({ type: 'success', message: 'Resposta enviada. O aluno foi notificado.' })
      await fetchQuestions()
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Não foi possível enviar a resposta.' })
    } finally {
      setSaving(false)
    }
  }

  const pending = useMemo(() => questions.filter((q) => q.status !== 'ANSWERED'), [questions])
  const answered = useMemo(() => questions.filter((q) => q.status === 'ANSWERED'), [questions])
  const visible = activeTab === 'pending' ? pending : answered

  if (loading) return <div className="loading">Carregando perguntas...</div>

  return (
    <section className="admin-questions">
      <div className="questions-header"><div><span className="admin-eyebrow">Atendimento</span><h2>Perguntas dos alunos</h2><p>Responda dúvidas e acompanhe o histórico de atendimento.</p></div></div>
      {feedback && <div className={`question-feedback ${feedback.type}`}>{feedback.message}</div>}

      <div className="questions-tabs">
        <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pendentes ({pending.length})</button>
        <button className={`tab-btn ${activeTab === 'answered' ? 'active' : ''}`} onClick={() => setActiveTab('answered')}>Respondidas ({answered.length})</button>
      </div>

      <div className="questions-list">
        {visible.length === 0 ? <div className="empty-state"><p>{activeTab === 'pending' ? 'Nenhuma pergunta pendente.' : 'Nenhuma pergunta respondida ainda.'}</p></div> : visible.map((question) => (
          <article key={question.id} className="pergunta-card">
            <div className="pergunta-header">
              <div className="pergunta-autor"><span className="question-avatar">{question.user?.profilePhoto ? <img src={question.user.profilePhoto} alt="" /> : question.user?.name?.[0] || 'A'}</span><div><strong>{question.user?.name || 'Aluno'}</strong><small>{question.user?.email}</small></div></div>
              <div className="pergunta-data">{new Date(question.createdAt).toLocaleDateString('pt-BR')}</div>
            </div>
            {question.title && <h3 className="pergunta-title">{question.title}</h3>}
            <div className="pergunta-texto">{question.text}</div>
            <div className="pergunta-status">{question.status === 'ANSWERED' ? 'Respondida' : 'Aguardando resposta'}</div>

            {question.status === 'ANSWERED' ? <div className="resposta-box"><strong>Sua resposta</strong><p>{question.answer}</p></div> : answeringId === question.id ? (
              <div className="responder-box"><textarea rows="5" maxLength="5000" placeholder="Escreva uma resposta clara e objetiva..." value={answerText} onChange={(e) => setAnswerText(e.target.value)} /><div className="form-actions"><button className="btn-salvar" disabled={saving} onClick={() => handleAnswer(question.id)}>{saving ? 'Enviando...' : 'Enviar resposta'}</button><button className="btn-cancelar" onClick={() => { setAnsweringId(null); setAnswerText('') }}>Cancelar</button></div></div>
            ) : <button className="btn-responder" onClick={() => { setAnsweringId(question.id); setAnswerText('') }}>Responder</button>}
          </article>
        ))}
      </div>
    </section>
  )
}
