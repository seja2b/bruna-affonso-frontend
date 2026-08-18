import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import ContactCard from '../../components/ContactCard'
import './StudentHome.css'

export default function StudentHome({ user }) {
  const [weeks, setWeeks] = useState([])
  const [ranking, setRanking] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.allSettled([
      api.get(`/tracking/student/${user.studentId}/weeks`),
      api.get('/tracking/ranking'),
      api.get('/admin/settings')
    ]).then(([weeksResult, rankingResult, settingsResult]) => {
      if (!active) return
      if (weeksResult.status === 'fulfilled') setWeeks(weeksResult.value.data || [])
      if (rankingResult.status === 'fulfilled') setRanking(Array.isArray(rankingResult.value.data) ? rankingResult.value.data : rankingResult.value.data?.ranking || [])
      if (settingsResult.status === 'fulfilled') setSettings(settingsResult.value.data)
      setLoading(false)
    })
    return () => { active = false }
  }, [user.studentId])

  const stats = useMemo(() => {
    const completed = weeks.filter((week) => week.isCompleted).length
    const released = weeks.filter((week) => week.isReleased && !week.isCompleted)
    const nextWeek = released[0] || weeks.find((week) => !week.isCompleted) || null
    const rankingIndex = ranking.findIndex((entry) => entry.studentId === user.studentId || entry.student?.user?.email === user.email)
    const ownRanking = rankingIndex >= 0 ? ranking[rankingIndex] : null
    return {
      completed,
      progress: weeks.length ? Math.round((completed / weeks.length) * 100) : 0,
      nextWeek,
      points: ownRanking?.totalPoints || 0,
      position: rankingIndex >= 0 ? rankingIndex + 1 : null
    }
  }, [weeks, ranking, user])

  if (loading) return <div className="student-home-skeleton">Carregando seu progresso...</div>

  return (
    <div className="student-home">
      <section className="student-hero-card">
        <div>
          <span className="student-kicker">Seu espaço de evolução</span>
          <h2>Olá, {user.name?.split(' ')[0]}. Continue construindo consistência.</h2>
          <p>{settings?.motivationalPhrase || 'Acompanhe seus treinos, registre seu progresso e mantenha o foco na próxima semana.'}</p>
        </div>
        <Link to="semanas" className="student-primary-action">Ver minhas semanas</Link>
      </section>

      <section className="student-metrics-grid">
        <article><span>Progresso geral</span><strong>{stats.progress}%</strong><small>{stats.completed} de {weeks.length || 52} semanas concluídas</small></article>
        <article><span>Próxima semana</span><strong>{stats.nextWeek ? `Semana ${stats.nextWeek.weekNumber}` : 'Em dia'}</strong><small>{stats.nextWeek?.isReleased ? 'Disponível para registro' : 'Nenhuma semana liberada agora'}</small></article>
        <article><span>Pontos</span><strong>{stats.points}</strong><small>Pontuação registrada no ranking</small></article>
        <article><span>Posição</span><strong>{stats.position ? `#${stats.position}` : '—'}</strong><small>{stats.position ? 'Sua posição atual' : 'Ainda sem posição registrada'}</small></article>
      </section>

      <section className="student-home-grid">
        <div className="student-panel">
          <div className="student-panel-head"><div><span className="student-kicker">Próximo passo</span><h3>Seu plano desta semana</h3></div><Link to="acompanhamento">Abrir acompanhamento</Link></div>
          {stats.nextWeek ? (
            <div className="next-week-card">
              <div><strong>Semana {stats.nextWeek.weekNumber}</strong><span>{stats.nextWeek.exercises?.length || 0} exercícios cadastrados</span></div>
              <div className="week-progress-track"><span style={{width: `${stats.nextWeek.isCompleted ? 100 : 0}%`}} /></div>
              <Link to="semanas">Ver detalhes da semana</Link>
            </div>
          ) : <div className="student-empty">Nenhuma semana pendente encontrada.</div>}
        </div>

        <div className="student-panel student-quick-actions">
          <div className="student-panel-head"><div><span className="student-kicker">Acesso rápido</span><h3>O que você precisa?</h3></div></div>
          <Link to="semanas"><strong>Semanas</strong><span>Veja o calendário do programa</span></Link>
          <Link to="perguntas"><strong>Perguntas</strong><span>Envie dúvidas para a profissional</span></Link>
          <Link to="ranking"><strong>Ranking</strong><span>Acompanhe sua evolução</span></Link>
        </div>
      </section>

      {settings?.whatsappUrl && <ContactCard whatsappUrl={settings.whatsappUrl} phone={settings.phone} />}
    </div>
  )
}
