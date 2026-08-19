import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import ContactCard from '../../components/ContactCard'
import './StudentHome.css'

export default function StudentHome({ user }) {
  const [weeks, setWeeks] = useState([])
  const [ranking, setRanking] = useState([])
  const [settings, setSettings] = useState(null)
  const [questions, setQuestions] = useState([])
  const [videos, setVideos] = useState([])
  const [notifications, setNotifications] = useState({ unreadCount: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.allSettled([
      api.get(`/tracking/student/${user.studentId}/weeks`),
      api.get('/tracking/ranking'),
      api.get('/admin/settings'),
      api.get('/questions'),
      api.get('/videos'),
      api.get('/notifications?limit=5')
    ]).then(([weeksResult, rankingResult, settingsResult, questionsResult, videosResult, notificationsResult]) => {
      if (!active) return
      if (weeksResult.status === 'fulfilled') setWeeks(weeksResult.value.data || [])
      if (rankingResult.status === 'fulfilled') setRanking(Array.isArray(rankingResult.value.data) ? rankingResult.value.data : rankingResult.value.data?.ranking || [])
      if (settingsResult.status === 'fulfilled') setSettings(settingsResult.value.data)
      if (questionsResult.status === 'fulfilled') setQuestions(questionsResult.value.data || [])
      if (videosResult.status === 'fulfilled') setVideos(videosResult.value.data || [])
      if (notificationsResult.status === 'fulfilled') setNotifications(notificationsResult.value.data || { unreadCount: 0 })
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
      pendingQuestions
    }
  }, [weeks, ranking, questions, user])

  if (loading) return <div className="student-home-skeleton">Carregando seu progresso...</div>

  return (
    <div className="student-home">
      <section className="student-hero-card">
        <div>
          <span className="student-kicker">Seu espaço de evolução</span>
          <h2>Olá, {user.name?.split(' ')[0]}. Continue construindo consistência.</h2>
          <p>{settings?.motivationalPhrase || 'Acompanhe seus treinos, registre seu progresso e mantenha o foco na próxima semana.'}</p>
        </div>
        <Link to="treinos" className="student-primary-action">Abrir meus treinos</Link>
      </section>

      <section className="student-metrics-grid">
        <article><span>Progresso geral</span><strong>{stats.progress}%</strong><small>{stats.completed} de {weeks.length || 52} semanas concluídas</small></article>
        <article><span>Semana atual</span><strong>{stats.nextWeek ? `Semana ${stats.nextWeek.weekNumber}` : 'Em dia'}</strong><small>{stats.nextWeek?.isReleased ? 'Disponível para registro' : 'Nenhuma semana liberada agora'}</small></article>
        <article><span>Pontos</span><strong>{stats.points}</strong><small>{stats.completed} semanas pontuadas</small></article>
        <article><span>Posição</span><strong>{stats.position ? `#${stats.position}` : '—'}</strong><small>{stats.position ? 'Sua posição atual no ranking' : 'Conclua uma semana para pontuar'}</small></article>
      </section>

      <section className="student-home-grid">
        <div className="student-panel">
          <div className="student-panel-head"><div><span className="student-kicker">Próximo passo</span><h3>Seu treino desta semana</h3></div><Link to="treinos">Abrir</Link></div>
          {stats.nextWeek ? (
            <div className="next-week-card">
              <div><strong>Semana {stats.nextWeek.weekNumber}</strong><span>{stats.nextWeek.isReleased ? 'Preencha seus exercícios de segunda a sexta' : 'Aguardando liberação automática'}</span></div>
              <div className="week-progress-track"><span style={{width: `${stats.nextWeek.isCompleted ? 100 : 0}%`}} /></div>
              <Link to="treinos">Ver detalhes da semana</Link>
            </div>
          ) : <div className="student-empty">Nenhuma semana pendente encontrada.</div>}
        </div>

        <div className="student-panel student-quick-actions">
          <div className="student-panel-head"><div><span className="student-kicker">Acesso rápido</span><h3>O que precisa da sua atenção?</h3></div></div>
          <Link to="perguntas"><strong>Perguntas</strong><span>{stats.pendingQuestions ? `${stats.pendingQuestions} aguardando resposta` : 'Nenhuma dúvida pendente'}</span></Link>
          <Link to="videos"><strong>VideoAulas</strong><span>{videos.length ? `${videos.length} aulas disponíveis` : 'Biblioteca em construção'}</span></Link>
          <Link to="ranking"><strong>Ranking</strong><span>{stats.points} pontos acumulados</span></Link>
          <Link to="perfil"><strong>Meu perfil</strong><span>Foto e dados pessoais</span></Link>
        </div>
      </section>

      <section className="student-home-grid">
        <div className="student-panel">
          <div className="student-panel-head"><div><span className="student-kicker">Novidades</span><h3>VideoAulas recentes</h3></div><Link to="videos">Ver biblioteca</Link></div>
          {videos.slice(0, 3).length ? videos.slice(0, 3).map((video) => <Link key={video.id} to="videos" className="student-activity-row"><div><strong>{video.title}</strong><span>{video.category || 'VideoAula'}</span></div><b>Assistir</b></Link>) : <div className="student-empty">Nenhuma VideoAula publicada ainda.</div>}
        </div>
        <div className="student-panel">
          <div className="student-panel-head"><div><span className="student-kicker">Central</span><h3>Notificações</h3></div></div>
          <div className="student-notification-summary"><strong>{notifications.unreadCount || 0}</strong><div><span>não lidas</span><p>Use o sino no topo para ver suas notificações e atualizações recentes.</p></div></div>
        </div>
      </section>

      {settings?.whatsappUrl && <ContactCard whatsappUrl={settings.whatsappUrl} phone={settings.phone} />}
    </div>
  )
}
