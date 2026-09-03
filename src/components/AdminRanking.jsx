import React, { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import './AdminRanking.css'

export default function AdminRanking() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchRanking() }, [])

  async function fetchRanking() {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/tracking/ranking')
      const data = Array.isArray(response.data) ? response.data : response.data?.ranking || []
      setStudents(data)
    } catch (err) {
      console.error('Erro ao buscar ranking', err)
      setError('Não foi possível carregar o ranking.')
    } finally {
      setLoading(false)
    }
  }

  const rows = useMemo(() => students.map((entry, index) => ({
    id: entry.id || entry.studentId || index,
    position: entry.position || index + 1,
    name: entry.name || entry.student?.user?.name || 'Aluno',
    email: entry.email || entry.student?.user?.email || '',
    photo: entry.profilePhoto || entry.student?.user?.profilePhoto || null,
    weeks: entry.weeksCompleted || 0,
    points: entry.totalPoints || 0
  })), [students])

  if (loading) return <div className="loading">Carregando ranking...</div>
  if (error) return <div className="admin-ranking-state">{error}</div>

  return (
    <div className="admin-ranking">
      <div className="ranking-header">
        <span className="admin-eyebrow">Ranking oficial</span>
        <h2>Desempenho dos alunos</h2>
        <p>O ciclo completo vale 400 pontos: 100 por etapa no plano trimestral e 50 por etapa no semestral.</p>
      </div>

      <div className="admin-ranking-summary">
        <div><strong>{rows.length}</strong><span>participantes</span></div>
        <div><strong>{rows.reduce((sum, row) => sum + row.weeks, 0)}</strong><span>semanas concluídas</span></div>
        <div><strong>{rows.reduce((sum, row) => sum + row.points, 0)}</strong><span>pontos distribuídos</span></div>
      </div>

      <div className="admin-ranking-table-wrap">
        <table className="ranking-table">
          <thead><tr><th>Posição</th><th>Aluno</th><th>Semanas completas</th><th>Pontos</th></tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan="4" className="admin-ranking-empty">Nenhum aluno pontuou ainda.</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id} className={row.position <= 3 ? `rank-top rank-${row.position}` : ''}>
                <td><span className="admin-rank-position">#{row.position}</span></td>
                <td><div className="admin-rank-person"><span className="admin-rank-avatar">{row.photo ? <img src={row.photo} alt="" /> : row.name[0]}</span><span><strong>{row.name}</strong><small>{row.email}</small></span></div></td>
                <td><strong>{row.weeks}</strong> semanas</td>
                <td><strong>{row.points}</strong> pts</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
