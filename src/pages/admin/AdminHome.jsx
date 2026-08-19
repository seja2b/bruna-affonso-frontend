import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import './AdminHome.css'

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

export default function AdminHome() {
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  useEffect(()=>{load()},[])

  async function load(){
    try{
      setLoading(true);setError('')
      const response=await api.get('/admin/dashboard')
      setData(response.data)
    }catch(err){
      console.error('Erro ao carregar dashboard administrativo',err)
      setError('Não foi possível carregar os indicadores agora.')
    }finally{setLoading(false)}
  }

  if(loading)return <div className="admin-home-state">Carregando indicadores...</div>
  if(error)return <div className="admin-home-state"><p>{error}</p><button onClick={load}>Tentar novamente</button></div>

  const metrics=[
    ['Alunos ativos',data?.totalStudents??0,'alunos'],
    ['Alunos pendentes',data?.pendingStudents??0,'alunos'],
    ['Semanas concluídas',data?.completedWeeks??0,'acompanhamentos'],
    ['Perguntas pendentes',data?.pendingQuestions??0,'perguntas'],
    ['VideoAulas',data?.totalVideos??0,'videos'],
    ['Treinos cadastrados',data?.totalWorkouts??0,'treinos']
  ]

  return <div className="admin-home">
    <section className="admin-home-hero"><div><span>Visão geral</span><h2>Operação da plataforma</h2><p>Acompanhe alunos, evolução, conteúdo e os pontos que precisam da sua atenção.</p></div><Link to="alunos">Gerenciar alunos</Link></section>

    <section className="admin-metrics-grid">{metrics.map(([label,value,path])=><Link key={label} to={path}><span>{label}</span><strong>{value}</strong><small>Ver detalhes</small></Link>)}</section>

    <section className="admin-home-grid">
      <article className="admin-panel">
        <div className="admin-panel-head"><div><span>Atividade recente</span><h3>Últimas semanas concluídas</h3></div></div>
        {(data?.recentCompletions || []).length === 0 ? <div className="admin-dashboard-empty">Nenhuma conclusão registrada ainda.</div> : (
          <div className="admin-activity-list">{data.recentCompletions.map((item)=><Link key={item.id} to={`acompanhamentos?student=${item.studentId}`} className="admin-activity-item">
            <div className="admin-activity-avatar">{item.profilePhoto?<img src={item.profilePhoto} alt=""/>:(item.studentName?.[0]||'A')}</div>
            <div><strong>{item.studentName}</strong><span>Concluiu a Semana {item.weekNumber} · +100 pontos</span></div>
            <time>{item.completedAt?dateTimeFormatter.format(new Date(item.completedAt)):'—'}</time>
          </Link>)}</div>
        )}
      </article>

      <article className="admin-panel">
        <div className="admin-panel-head"><div><span>Atenção</span><h3>Fila operacional</h3></div></div>
        <Link className="admin-queue-item" to="alunos"><div><strong>Cadastros aguardando aprovação</strong><span>Revise novos alunos antes de liberar o acesso.</span></div><b>{data?.pendingStudents??0}</b></Link>
        <Link className="admin-queue-item" to="perguntas"><div><strong>Perguntas aguardando resposta</strong><span>Mantenha o atendimento em dia.</span></div><b>{data?.pendingQuestions??0}</b></Link>
        <Link className="admin-queue-item" to="videos"><div><strong>Biblioteca de VideoAulas</strong><span>Publique conteúdos para os alunos.</span></div><b>{data?.totalVideos??0}</b></Link>
      </article>
    </section>

    <section className="admin-panel">
      <div className="admin-panel-head"><div><span>Cadastros recentes</span><h3>Novos alunos na plataforma</h3></div></div>
      <div className="admin-recent-students">{(data?.recentStudents||[]).map((student)=><Link key={student.id} to={`alunos/${student.id}`}>
        <div className="admin-activity-avatar">{student.profilePhoto?<img src={student.profilePhoto} alt=""/>:(student.name?.[0]||'A')}</div>
        <div><strong>{student.name}</strong><span>{student.email}</span></div>
        <small>{student.status==='APPROVED'?'Aprovado':student.status==='PENDING'?'Pendente':student.status}</small>
      </Link>)}</div>
    </section>
  </div>
}
