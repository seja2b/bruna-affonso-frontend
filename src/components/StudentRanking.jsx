import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import './StudentRanking.css'

export default function StudentRanking({ token }) {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRanking()
  }, [])

  const loadRanking = async () => {
    try {
      setLoading(true)
      const response = await api.get('/tracking/ranking', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRanking(response.data)
    } catch (error) {
      console.error('Erro ao carregar ranking:', error)
      alert('Erro ao carregar ranking')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="ranking-loading">Carregando ranking...</div>
  }

  const getMedalEmoji = (position) => {
    switch (position) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `${position}º`
    }
  }

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <h2>🏆 Ranking de Alunos</h2>
        <p className="ranking-subtitle">Pontuação por semanas completas</p>
      </div>

      {ranking.length === 0 ? (
        <div className="no-ranking">
          <p>Nenhum aluno com pontuação ainda</p>
        </div>
      ) : (
        <div className="ranking-list">
          {ranking.map((item, index) => (
            <div
              key={item.id}
              className={`ranking-card ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`}
            >
              <div className="ranking-position">
                <span className="medal">{getMedalEmoji(item.position)}</span>
              </div>

              <div className="ranking-student-info">
                {item.student.profilePhoto ? (
                  <img
                    src={item.student.profilePhoto}
                    alt={item.student.name}
                    className="ranking-photo"
                  />
                ) : (
                  <div className="ranking-photo-placeholder">👤</div>
                )}

                <div className="student-details">
                  <h3 className="student-name">{item.student.name}</h3>
                  <p className="student-email">{item.student.email}</p>
                </div>
              </div>

              <div className="ranking-stats">
                <div className="stat">
                  <span className="stat-label">Semanas</span>
                  <span className="stat-value">{item.weeksCompleted}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Pontos</span>
                  <span className="stat-value points">{item.totalPoints}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}