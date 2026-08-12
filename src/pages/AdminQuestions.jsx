import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import AdminLayout from '../components/AdminLayout'
import './AdminQuestions.css'

export default function AdminQuestions({ user, token, onNavigate }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [answeringId, setAnsweringId] = useState(null)
  const [answerText, setAnswerText] = useState('')

  useEffect(() => {
    fetchQuestions()
  }, [])

  async function fetchQuestions() {
    try {
      const response = await api.get('/admin/questions/pending', {
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
      alert('Digite uma resposta')
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
    } catch (error) {
      alert('Erro ao responder pergunta')
    }
  }

  return (
    <AdminLayout user={user} token={token} onNavigate={onNavigate} currentPage="questions">
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Perguntas dos Alunos</h1>
            <p className="page-subtitle">Responda às dúvidas de seus alunos</p>
          </div>
          <div className="page-stats">
            <span className="stat-badge">{questions.length} pendentes</span>
          </div>
        </div>

        {loading ? (
          <div className="loading">Carregando perguntas...</div>
        ) : questions.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma pergunta pendente</p>
            <p className="empty-text">Parabéns! Todos as dúvidas foram respondidas.</p>
          </div>
        ) : (
          <div className="questions-list">
            {questions.map(question => (
              <div key={question.id} className="question-item">
                <div className="question-header">
                  <div className="student-info">
                    <div className="student-avatar">{question.user.name.charAt(0)}</div>
                    <div>
                      <h3>{question.user.name}</h3>
                      <p className="student-email">{question.user.email}</p>
                    </div>
                  </div>
                  <span className="question-date">
                    {new Date(question.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="question-content">
                  <h4>{question.title}</h4>
                  <p>{question.text}</p>
                </div>

                {answeringId === question.id ? (
                  <div className="answer-form">
                    <textarea
                      placeholder="Digite sua resposta aqui..."
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      rows="4"
                    />
                    <div className="answer-actions">
                      <button
                        className="btn-submit"
                        onClick={() => handleAnswerQuestion(question.id)}
                      >
                        Enviar Resposta
                      </button>
                      <button
                        className="btn-cancel"
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
                    className="btn-answer"
                    onClick={() => setAnsweringId(question.id)}
                  >
                    Responder
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}