import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import AdminLayout from '../components/AdminLayout'
import './AdminQuestions.css'

export default function AdminQuestions({ user, token }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [answerData, setAnswerData] = useState({
    questionId: null,
    text: ''
  })

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

  async function handleAnswerQuestion(e) {
    e.preventDefault()
    if (!answerData.questionId || !answerData.text.trim()) return

    try {
      await api.post(
        `/admin/questions/${answerData.questionId}/answer`,
        { text: answerData.text },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAnswerData({ questionId: null, text: '' })
      fetchQuestions()
    } catch (error) {
      alert('Erro ao responder pergunta')
    }
  }

  return (
    <AdminLayout user={user} token={token}>
      <div className="admin-questions">
        <h1>❓ Responder Perguntas dos Alunos</h1>

        {loading ? (
          <div className="loading">Carregando perguntas...</div>
        ) : questions.length === 0 ? (
          <div className="no-data">Nenhuma pergunta pendente 🎉</div>
        ) : (
          <div className="questions-container">
            {questions.map(question => (
              <div key={question.id} className="question-card">
                <div className="question-header">
                  <h3>{question.title}</h3>
                  <span className="student-name">👤 {question.user.name}</span>
                </div>

                <p className="question-text">{question.text}</p>

                <div className="question-meta">
                  <span>📧 {question.user.email}</span>
                  <span>📅 {new Date(question.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>

                {answerData.questionId === question.id ? (
                  <form className="answer-form" onSubmit={handleAnswerQuestion}>
                    <h4>Sua Resposta</h4>
                    <textarea
                      placeholder="Digite sua resposta aqui..."
                      value={answerData.text}
                      onChange={(e) => setAnswerData({...answerData, text: e.target.value})}
                      rows="4"
                      required
                    />
                    <div className="form-actions">
                      <button type="submit" className="btn-submit">✅ Enviar Resposta</button>
                      <button 
                        type="button" 
                        className="btn-cancel-answer"
                        onClick={() => setAnswerData({ questionId: null, text: '' })}
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    className="btn-answer"
                    onClick={() => setAnswerData({ questionId: question.id, text: '' })}
                  >
                    💬 Responder
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