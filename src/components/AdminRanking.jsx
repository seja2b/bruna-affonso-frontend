import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminRanking.css'

export default function AdminRanking({ token }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRanking()
  }, [])

  async function fetchRanking() {
    try {
      const response = await api.get('/ranking', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(response.data)
    } catch (error) {
      console.error('Erro ao buscar ranking', error)
    } finally {
      setLoading(false)
    }
  }

  function fazerSorteio() {
    if (students.length === 0) {
      alert('❌ Nenhum aluno cadastrado para sorteio!')
      return
    }

    const indice = Math.floor(Math.random() * students.length)
    const alunoSorteado = students[indice]
    
    document.getElementById('nome-sorteado').textContent = alunoSorteado.name || alunoSorteado.user?.name || 'Aluno'
    document.getElementById('resultado-sorteio').classList.remove('hidden')
    
    alert(`🎲 Sorteio Realizado!\n\n🏆 Aluno Sorteado: ${alunoSorteado.name || alunoSorteado.user?.name}`)
  }

  if (loading) {
    return <div className="loading">Carregando ranking...</div>
  }

  return (
    <div className="admin-ranking">
      <div className="ranking-header">
        <h2>🏆 Ranking de Alunos</h2>
        <p>Veja o desempenho dos alunos e faça sorteios entre os cadastrados</p>
      </div>

      <table className="ranking-table">
        <thead>
          <tr>
            <th style={{width: '80px'}}>Posição</th>
            <th>Nome do Aluno</th>
            <th style={{width: '150px', textAlign: 'center'}}>Semanas Completas</th>
            <th style={{width: '120px', textAlign: 'right'}}>Pontos</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="4" style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                Nenhum aluno no ranking ainda
              </td>
            </tr>
          ) : (
            students.map((student, index) => {
              let medal = ''
              if (index === 0) medal = '🥇'
              else if (index === 1) medal = '🥈'
              else if (index === 2) medal = '🥉'
              else medal = `${index + 1}º`

              return (
                <tr key={student.id}>
                  <td className="ranking-medal" style={{textAlign: 'center', fontSize: '24px'}}>
                    {medal}
                  </td>
                  <td className="ranking-nome">
                    {student.name || student.user?.name || 'Aluno'}
                  </td>
                  <td className="ranking-stats" style={{textAlign: 'center'}}>
                    {student.weeksCompleted || 0}/52
                  </td>
                  <td className="ranking-pontos" style={{textAlign: 'right'}}>
                    {(student.totalPoints || 0)} pts
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      <button 
        className="btn-sorteio" 
        onClick={fazerSorteio}
        style={{marginTop: '25px'}}
      >
        🎲 Fazer Sorteio Entre Alunos
      </button>

      <div id="resultado-sorteio" className="hidden" style={{
        background: 'linear-gradient(135deg, #ff9800, #f57c00)',
        color: 'white',
        padding: '40px',
        borderRadius: '12px',
        textAlign: 'center',
        marginTop: '30px',
        boxShadow: '0 8px 30px rgba(255, 152, 0, 0.2)'
      }}>
        <div style={{fontSize: '14px', opacity: 0.9, marginBottom: '15px'}}>ALUNO SORTEADO:</div>
        <div style={{fontSize: '42px', fontWeight: 700, marginBottom: '20px'}} id="nome-sorteado">-</div>
        <div style={{fontSize: '14px', opacity: 0.9}}>✨ Parabéns ao vencedor! ✨</div>
      </div>
    </div>
  )
}