import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import './AdminHome.css'

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
    ['Treinos',data?.totalWorkouts??0,'treinos'],
    ['Perguntas pendentes',data?.pendingQuestions??0,'perguntas']
  ]

  return <div className="admin-home">
    <section className="admin-home-hero"><div><span>Visão geral</span><h2>Operação da plataforma</h2><p>Acompanhe os principais indicadores e acesse rapidamente os pontos que exigem atenção.</p></div><Link to="alunos">Gerenciar alunos</Link></section>
    <section className="admin-metrics-grid">{metrics.map(([label,value,path])=><Link key={label} to={path}><span>{label}</span><strong>{value}</strong><small>Ver detalhes</small></Link>)}</section>
    <section className="admin-home-grid">
      <article className="admin-panel"><div className="admin-panel-head"><div><span>Atenção</span><h3>Fila operacional</h3></div></div><div className="admin-queue-item"><div><strong>Cadastros aguardando aprovação</strong><span>Revise novos alunos antes de liberar o acesso.</span></div><b>{data?.pendingStudents??0}</b></div><div className="admin-queue-item"><div><strong>Perguntas aguardando resposta</strong><span>Mantenha o tempo de resposta sob controle.</span></div><b>{data?.pendingQuestions??0}</b></div></article>
      <article className="admin-panel admin-shortcuts"><div className="admin-panel-head"><div><span>Acesso rápido</span><h3>Gestão</h3></div></div><Link to="alunos"><strong>Alunos</strong><span>Aprovações, status e perfis</span></Link><Link to="treinos"><strong>Treinos</strong><span>Biblioteca e atribuições</span></Link><Link to="acompanhamentos"><strong>Acompanhamentos</strong><span>Evolução e observações</span></Link></article>
    </section>
  </div>
}
