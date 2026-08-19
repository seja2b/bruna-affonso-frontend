import React, { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import './StudentQuestions.css'

export default function StudentQuestions() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [newQuestion, setNewQuestion] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => { fetchQuestions() }, [])

  async function fetchQuestions() {
    try {
      setLoading(true)
      const response = await api.get('/questions')
      setQuestions(response.data || [])
    } catch (error) {
      console.error('Erro ao buscar perguntas', error)
      setFeedback({ type: 'error', text: 'Não foi possível carregar suas perguntas agora.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitQuestion(e) {
    e.preventDefault()
    const text = newQuestion.trim()
    if (text.length < 3) {
      setFeedback({ type: 'error', text: 'Digite uma pergunta com pelo menos 3 caracteres.' })
      return
    }

    setSubmitting(true)
    setFeedback(null)
    try {
      await api.post('/questions', { text })
      setNewQuestion('')
      setShowForm(false)
      setFeedback({ type: 'success', text: 'Pergunta enviada com sucesso.' })
      await fetchQuestions()
    } catch (error) {
      console.error('Erro ao enviar pergunta', error)
      setFeedback({ type: 'error', text: error.response?.data?.error || 'Não foi possível enviar sua pergunta.' })
    } finally {
      setSubmitting(false)
    }
  }

  const pendingQuestions = useMemo(() => questions.filter((q) => q.status !== 'ANSWERED' && !q.answer), [questions])
  const answeredQuestions = useMemo(() => questions.filter((q) => q.status === 'ANSWERED' || q.answer), [questions])

  if (loading) return <div className="loading">Carregando perguntas...</div>

  return (
    <div className="student-questions">
      <div className="questions-header">
        <div><span className="questions-kicker">Suporte</span><h2>Minhas perguntas</h2><p>Envie dúvidas e acompanhe as respostas.</p></div>
        <button className="btn-nova-pergunta" onClick={() => setShowForm((value) => !value)}>{showForm ? 'Cancelar' : 'Nova pergunta'}</button>
      </div>

      {feedback && <div className={`question-feedback ${feedback.type}`}>{feedback.text}</div>}

      {showForm && (
        <div className="form-card">
          <h3>Enviar uma dúvida</h3>
          <form onSubmit={handleSubmitQuestion}>
            <div className="form-group"><label>Sua pergunta</label><textarea placeholder="Descreva sua dúvida com contexto suficiente para receber uma boa resposta." value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} rows="5" maxLength="5000" /></div>
            <div className="form-actions"><button type="submit" className="btn-enviar" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar pergunta'}</button><button type="button" className="btn-cancelar" onClick={() => setShowForm(false)}>Cancelar</button></div>
          </form>
        </div>
      )}

      <div className="questions-tabs"><button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pendentes ({pendingQuestions.length})</button><button className={`tab-btn ${activeTab === 'answered' ? 'active' : ''}`} onClick={() => setActiveTab('answered')}>Respondidas ({answeredQuestions.length})</button></div>

      <div className="questions-list">
        {(activeTab === 'pending' ? pendingQuestions : answeredQuestions).length === 0 ? <div className="empty-state"><p>{activeTab === 'pending' ? 'Nenhuma pergunta pendente.' : 'Nenhuma pergunta respondida ainda.'}</p></div> : (activeTab === 'pending' ? pendingQuestions : answeredQuestions).map((question) => (
          <article key={question.id} className={`pergunta-card ${question.answer ? 'answered' : 'pending'}`}>
            <div className="pergunta-header"><div className="pergunta-status">{question.answer ? 'Respondida' : 'Aguardando resposta'}</div><div className="pergunta-data">{new Date(question.createdAt).toLocaleDateString('pt-BR')}</div></div>
            {question.title && <strong className="pergunta-title">{question.title}</strong>}
            <div className="pergunta-texto">{question.text}</div>
            {question.answer && <div className="resposta-box"><div className="resposta-label">Resposta da Bruna</div><p className="resposta-texto">{question.answer}</p></div>}
          </article>
        ))}
      </div>
    </div>
  )
}
