import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminQuestions.css'

export default function AdminQuestions({ user, token, onNavigate }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [answeringId, setAnsweringId] = useState(null)
  const [answerText, setAnswerText] = useState('')

  useEffect(() => {
    fetchQuestions()
  }, [])

  async function fetchQuestions() {
    try {
      const response = await api.get('/admin/questions', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setQuestions(response.data)
    } catch (error) {
      console.error('Erro ao buscar perguntas', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAnswerQuestion(questionId) {
    if (!answerText.trim()) {
      alert('❌ Digite uma resposta')
      return
    }

    try {
      await api.post(
        `/admin/questions/${questionId}/answer`,
        { text: answerText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAnsweringId(null)
      setAnswerText('')
      fetchQuestions()
      alert('✅ Resposta enviada com sucesso!')
    } catch (error) {
      alert('Erro ao responder pergunta')
    }
  }

  const pendingQuestions = questions.filter(q => !q.answeredAt)
  const answeredQuestions = questions.filter(q => q.answeredAt)

  return (
    <div className="admin-questions">
      <div className="questions-header">
        <div>
          <h2>❓ Perguntas dos Alunos</h2>
          <p>Responda às dúvidas de seus alunos</p>
        </div>
      </div>

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

      {loading ? (
        <div className="loading">Carregando perguntas...</div>
      ) : (
        <>
          {/* PERGUNTAS PENDENTES */}
          {activeTab === 'pending' && (
            <div className="questions-list">
              {pendingQuestions.length === 0 ? (
                <div className="empty-state">
                  <p>🎉 Nenhuma pergunta pendente!</p>
                  <p className="empty-text">Parabéns! Todas as dúvidas foram respondidas.</p>
                </div>
              ) : (
                pendingQuestions.map(question => (
                  <div key={question.id} className="pergunta-card">
                    <div className="pergunta-autor">
                      👤 {question.student?.name || question.user?.name || 'Aluno'}
                    </div>
                    <div className="pergunta-texto">{question.text}</div>
                    <div className="pergunta-status">
                      ⏳ Pendente de resposta
                    </div>

                    {answeringId === question.id ? (
                      <div className="responder-box">
                        <textarea
                          placeholder="Digite sua resposta..."
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          rows="4"
                        />
                        <div style={{display: 'flex', gap: '10px'}}>
                          <button
                            className="btn-salvar"
                            onClick={() => handleAnswerQuestion(question.id)}
                          >
                            Enviar Resposta
                          </button>
                          <button
                            className="btn-cancelar"
                            onClick={() => {
                              setAnsweringId(null)
                              setAnswerText('')
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn-responder"
                        onClick={() => setAnsweringId(question.id)}
                      >
                        Responder
                      </button>
                    )}
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
                  <div key={question.id} className="pergunta-card">
                    <div className="pergunta-autor">
                      👤 {question.student?.name || question.user?.name || 'Aluno'}
                    </div>
                    <div className="pergunta-texto">{question.text}</div>
                    <div className="pergunta-status">✅ Respondida</div>

                    <div className="resposta-box">
                      <strong>✅ Sua resposta:</strong>
                      <p>{question.answer}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}