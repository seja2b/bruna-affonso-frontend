import React, { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import './StudentRanking.css'

export default function StudentRanking() {
  const { user } = useAuth()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchRanking() }, [])

  async function fetchRanking() {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/tracking/ranking')
      setRanking(Array.isArray(response.data) ? response.data : response.data?.ranking || [])
    } catch (err) {
      console.error('Erro ao carregar ranking:', err)
      setError('Não foi possível carregar o ranking agora.')
    } finally {
      setLoading(false)
    }
  }

  const rows = useMemo(() => ranking.map((entry, index) => ({
    id: entry.id || index,
    position: index + 1,
    name: entry.student?.user?.name || entry.studentName || 'Aluno',
    photo: entry.student?.user?.profilePhoto || null,
    points: entry.totalPoints ?? entry.points ?? 0,
    weeks: entry.weeksCompleted ?? 0,
    isCurrentUser: entry.studentId === user?.studentId || entry.student?.user?.email === user?.email
  })), [ranking, user])

  const own = rows.find((row) => row.isCurrentUser)

  if (loading) return <div className="ranking-loading"><div className="spinner" /><p>Carregando ranking...</p></div>
  if (error) return <div className="ranking-error"><p>{error}</p><button onClick={fetchRanking} className="retry-btn">Tentar novamente</button></div>

  return (
    <div className="student-ranking">
      <div className="ranking-heading"><div><span className="ranking-kicker">Desempenho</span><h2>Ranking de alunos</h2><p>Acompanhe sua posição com base nos pontos registrados pelo sistema.</p></div>{own && <div className="own-rank-card"><span>Sua posição</span><strong>#{own.position}</strong><small>{own.points} pontos</small></div>}</div>

      {rows.length === 0 ? <div className="ranking-empty">O ranking ainda não possui dados.</div> : (
        <div className="ranking-list">
          {rows.map((row) => (
            <article key={row.id} className={`ranking-row ${row.isCurrentUser ? 'current-user' : ''}`}>
              <div className={`ranking-position top-${row.position}`}><strong>{row.position}</strong></div>
              <div className="ranking-person"><div className="ranking-avatar">{row.photo ? <img src={row.photo} alt="" /> : row.name[0]}</div><div><strong>{row.name}</strong>{row.isCurrentUser && <span className="badge-current">Você</span>}</div></div>
              <div className="ranking-stat"><span>Semanas</span><strong>{row.weeks}</strong></div>
              <div className="ranking-stat"><span>Pontos</span><strong>{row.points}</strong></div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
