import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './StudentQuestions.css'

export default function StudentQuestions({ studentId, token }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [newQuestion, setNewQuestion] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])

  async function fetchQuestions() {
    try {
      const response = await api.get(`/questions?studentId=${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setQuestions(response.data)
    } catch (error) {
      console.error('Erro ao buscar perguntas', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitQuestion(e) {
    e.preventDefault()
    
    if (!newQuestion.trim()) {
      alert('❌ Digite uma pergunta!')
      return
    }

    setSubmitting(true)
    try {
      await api.post(
        '/questions',
        { text: newQuestion },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewQuestion('')
      setShowForm(false)
      fetchQuestions()
      alert('✅ Pergunta enviada com sucesso!')
    } catch (error) {
      console.error('Erro ao enviar pergunta', error)
      alert('❌ Erro ao enviar pergunta')
    } finally {
      setSubmitting(false)
    }
  }

  const pendingQuestions = questions.filter(q => !q.answeredAt && !q.answer)
  const answeredQuestions = questions.filter(q => q.answeredAt || q.answer)

  if (loading) {
    return <div className="loading">Carregando perguntas...</div>
  }

  return (
    <div className="student-questions">
      <div className="questions-header">
        <div>
          <h2>❓ Minhas Perguntas</h2>
          <p>Faça suas dúvidas e acompanhe as respostas</p>
        </div>
        <button 
          className="btn-nova-pergunta"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✖️ Cancelar' : '➕ Nova Pergunta'}
        </button>
      </div>

      {/* FORMULÁRIO DE NOVA PERGUNTA */}
      {showForm && (
        <div className="form-card">
          <h3>📝 Faça sua Pergunta</h3>
          <form onSubmit={handleSubmitQuestion}>
            <div className="form-group">
              <label>Sua Dúvida</label>
              <textarea
                placeholder="Digite sua pergunta aqui... seja específico para receber a melhor resposta!"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                rows="5"
              />
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-enviar"
                disabled={submitting}
              >
                {submitting ? '⏳ Enviando...' : '✅ Enviar Pergunta'}
              </button>
              <button 
                type="button"
                className="btn-cancelar"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ABAS */}
      <div className="questions-tabs">
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pendentes ({pendingQuestions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'answered' ? 'active' : ''}`}
          onClick={() => setActiveTab('answered')}
        >
          ✅ Respondidas ({answeredQuestions.length})
        </button>
      </div>

      {/* PERGUNTAS PENDENTES */}
      {activeTab === 'pending' && (
        <div className="questions-list">
          {pendingQuestions.length === 0 ? (
            <div className="empty-state">
              <p>🎉 Nenhuma pergunta pendente!</p>
              <p className="empty-text">Parabéns! Todas as suas dúvidas foram respondidas.</p>
            </div>
          ) : (
            pendingQuestions.map(question => (
              <div key={question.id} className="pergunta-card pending">
                <div className="pergunta-header">
                  <div className="pergunta-status">⏳ Aguardando Resposta</div>
                  <div className="pergunta-data">
                    {new Date(question.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="pergunta-texto">{question.text}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PERGUNTAS RESPONDIDAS */}
      {activeTab === 'answered' && (
        <div className="questions-list">
          {answeredQuestions.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma pergunta respondida ainda</p>
            </div>
          ) : (
            answeredQuestions.map(question => (
              <div key={question.id} className="pergunta-card answered">
                <div className="pergunta-header">
                  <div className="pergunta-status">✅ Respondida</div>
                  <div className="pergunta-data">
                    {new Date(question.answeredAt || question.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="pergunta-texto">{question.text}</div>

                <div className="resposta-box">
                  <div className="resposta-label">💬 Resposta da Bruna:</div>
                  <p className="resposta-texto">{question.answer}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* DICA */}
      {questions.length === 0 && (
        <div className="info-card">
          <h3>💡 Como Fazer uma Boa Pergunta?</h3>
          <ul>
            <li><strong>Seja específico:</strong> Descreva exatamente qual é sua dúvida</li>
            <li><strong>Contexto:</strong> Mencione em qual exercício ou semana está a dúvida</li>
            <li><strong>Detalhes:</strong> Quanto mais informação, melhor a resposta</li>
            <li><strong>Paciência:</strong> Bruna responderá assim que possível</li>
          </ul>
        </div>
      )}
    </div>
  )
}