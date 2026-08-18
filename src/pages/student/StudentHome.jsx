import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import ContactCard from '../../components/ContactCard'
import './StudentHome.css'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit'
})

export default function StudentHome({ user }) {
  const [weeks, setWeeks] = useState([])
  const [ranking, setRanking] = useState([])
  const [settings, setSettings] = useState(null)
  const [questions, setQuestions] = useState([])
  const [notifications, setNotifications] = useState({ unreadCount: 0, notifications: [] })
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.allSettled([
      api.get(`/tracking/student/${user.studentId}/weeks`),
      api.get('/tracking/ranking'),
      api.get('/admin/settings'),
      api.get('/questions'),
      api.get('/notifications'),
      api.get('/videos')
    ]).then(([weeksResult, rankingResult, settingsResult, questionsResult, notificationsResult, videosResult]) => {
      if (!active) return
      if (weeksResult.status === 'fulfilled') setWeeks(weeksResult.value.data || [])
      if (rankingResult.status === 'fulfilled') setRanking(Array.isArray(rankingResult.value.data) ? rankingResult.value.data : rankingResult.value.data?.ranking || [])
      if (settingsResult.status === 'fulfilled') setSettings(settingsResult.value.data)
      if (questionsResult.status === 'fulfilled') setQuestions(questionsResult.value.data || [])
      if (notificationsResult.status === 'fulfilled') setNotifications(notificationsResult.value.data || { unreadCount: 0, notifications: [] })
      if (videosResult.status === 'fulfilled') setVideos(videosResult.value.data || [])
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
    const pendingQuestions = questions.filter((question) => question.status !== 'ANSWERED' && !question.answer).length

    return {
      completed,
      progress: weeks.length ? Math.round((completed / weeks.length) * 100) : 0,
      nextWeek,
      points: ownRanking?.totalPoints || 0,
      position: rankingIndex >= 0 ? rankingIndex + 1 : null,
      pendingQuestions,
      unreadNotifications: notifications.unreadCount || 0
    }
  }, [weeks, ranking, questions, notifications, user])

  if (loading) return <div className="student-home-skeleton">Carregando seu progresso...</div>

  return (
    <div className="student-home">
      <section className="student-hero-card">
        <div>
          <span className="student-kicker">Seu espaço de evolução</span>
          <h2>Olá, {user.name?.split(' ')[0]}. Continue construindo consistência.</h2>
          <p>{settings?.motivationalPhrase || 'Registre seus treinos, acompanhe sua evolução e mantenha o ritmo semana após semana.'}</p>
        </div>
        <Link to="treinos" className="student-primary-action">Abrir meus treinos</Link>
      </section>

      <section className="student-metrics-grid">
        <article><span>Progresso geral</span><strong>{stats.progress}%</strong><small>{stats.completed} de {weeks.length || 52} semanas concluídas</small></article>
        <article><span>Semana atual</span><strong>{stats.nextWeek ? `Semana ${stats.nextWeek.weekNumber}` : 'Em dia'}</strong><small>{stats.nextWeek?.isReleased ? 'Disponível para preenchimento' : 'Aguardando próxima liberação'}</small></article>
        <article><span>Pontos</span><strong>{stats.points}</strong><small>100 pontos por semana concluída</small></article>
        <article><span>Posição</span><strong>{stats.position ? `#${stats.position}` : '—'}</strong><small>{stats.position ? 'Sua posição atual no ranking' : 'Conclua uma semana para entrar no ranking'}</small></article>
        <article><span>Perguntas pendentes</span><strong>{stats.pendingQuestions}</strong><small>{stats.pendingQuestions ? 'Aguardando resposta da professora' : 'Nenhuma dúvida pendente'}</small></article>
        <article><span>Notificações</span><strong>{stats.unreadNotifications}</strong><small>{stats.unreadNotifications ? 'Novidades ainda não lidas' : 'Você está em dia'}</small></article>
      </section>

      <section className="student-home-grid">
        <div className="student-panel">
          <div className="student-panel-head"><div><span className="student-kicker">Próximo passo</span><h3>Seu treino desta semana</h3></div><Link to="treinos">Abrir</Link></div>
          {stats.nextWeek ? (
            <div className="next-week-card">
              <div>
                <strong>Semana {stats.nextWeek.weekNumber}</strong>
                <span>{dateFormatter.format(new Date(stats.nextWeek.startDate))} a {dateFormatter.format(new Date(stats.nextWeek.endDate))} · segunda a sexta</span>
              </div>
              <div className="week-progress-track"><span style={{width: `${stats.nextWeek.isCompleted ? 100 : 0}%`}} /></div>
              <Link to="treinos">Preencher semana</Link>
            </div>
          ) : <div className="student-empty">Nenhuma semana pendente encontrada.</div>}
        </div>

        <div className="student-panel student-quick-actions">
          <div className="student-panel-head"><div><span className="student-kicker">Acesso rápido</span><h3>Principais áreas</h3></div></div>
          <Link to="treinos"><strong>Meus treinos</strong><span>Preencha e conclua sua semana</span></Link>
          <Link to="videos"><strong>VideoAulas</strong><span>{videos.length} aula{videos.length === 1 ? '' : 's'} disponível{videos.length === 1 ? '' : 'is'}</span></Link>
          <Link to="perguntas"><strong>Perguntas</strong><span>Tire dúvidas com a professora</span></Link>
          <Link to="ranking"><strong>Ranking</strong><span>Acompanhe sua posição</span></Link>
        </div>
      </section>

      <section className="student-panel student-dashboard-videos">
        <div className="student-panel-head"><div><span className="student-kicker">Conteúdo</span><h3>VideoAulas recentes</h3></div><Link to="videos">Ver todas</Link></div>
        {videos.length === 0 ? <div className="student-empty">Nenhuma VideoAula publicada ainda.</div> : (
          <div className="student-dashboard-video-list">{videos.slice(0,3).map((video)=><Link key={video.id} to="videos"><div><strong>{video.title}</strong><span>{video.category || 'Aula'}</span></div><small>Assistir</small></Link>)}</div>
        )}
      </section>

      {settings?.whatsappUrl && <ContactCard whatsappUrl={settings.whatsappUrl} phone={settings.phone} />}
    </div>
  )
}
