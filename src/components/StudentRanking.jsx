import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './StudentRanking.css'

export default function StudentRanking({ token }) {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userPosition, setUserPosition] = useState(null)

  useEffect(() => {
    fetchRanking()
  }, [])

  const fetchRanking = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/tracking/ranking', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRanking(response.data.ranking || [])
      setUserPosition(response.data.userPosition || null)
    } catch (err) {
      console.error('Erro ao carregar ranking:', err)
      setError('Erro ao carregar ranking')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="ranking-loading">
        <div className="spinner"></div>
        <p>Carregando ranking...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ranking-error">
        <p>❌ {error}</p>
        <button onClick={fetchRanking} className="retry-btn">
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="student-ranking">
      <h2>🏆 Ranking de Alunos</h2>

      {userPosition && (
        <div className="user-position">
          <div className="position-card">
            <div className="position-number">#{userPosition.position}</div>
            <div className="position-info">
              <p className="position-label">Sua Posição</p>
              <p className="position-points">{userPosition.points} pontos</p>
            </div>
          </div>
        </div>
      )}

      <div className="ranking-table-wrapper">
        <table className="ranking-table">
          <thead>
            <tr>
              <th className="rank-col">Posição</th>
              <th className="name-col">Nome</th>
              <th className="weeks-col">Semanas</th>
              <th className="points-col">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {ranking.length > 0 ? (
              ranking.map((entry, index) => (
                <tr key={index} className={entry.isCurrentUser ? 'current-user' : ''}>
                  <td className="rank-col">
                    <div className="rank-badge">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </div>
                  </td>
                  <td className="name-col">
                    <div className="name-info">
                      <span className="student-name">{entry.studentName}</span>
                      {entry.isCurrentUser && <span className="badge-current">Você</span>}
                    </div>
                  </td>
                  <td className="weeks-col">
                    <div className="weeks-info">
                      {entry.weeksCompleted} de {entry.totalWeeks}
                    </div>
                  </td>
                  <td className="points-col">
                    <div className="points-info">
                      <span className="points-value">{entry.totalPoints}</span>
                      <span className="points-label">pts</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-ranking-message">
                  Nenhum aluno no ranking ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="ranking-info">
        <div className="info-box">
          <span className="info-icon">ℹ️</span>
          <div>
            <p><strong>Como o Ranking Funciona:</strong></p>
            <ul>
              <li>Cada semana completa = 100 pontos</li>
              <li>Suba de posição conforme completa as semanas</li>
              <li>Compita com seus colegas de treino</li>
              <li>Ranking atualiza em tempo real</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
