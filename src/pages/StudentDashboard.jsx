import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import StudentShell from '../components/student/StudentShell'
import '../components/student/StudentShell.css'
import StudentHome from './student/StudentHome'
import StudentWeeks from '../components/StudentWeeks'
import StudentWeeklyTracking from '../components/StudentWeeklyTracking'
import StudentVideos from '../components/StudentVideos'
import StudentQuestions from '../components/StudentQuestions'
import StudentRanking from '../components/StudentRanking'
import './StudentDashboard.css'

function PendingApproval({ user, onLogout }) {
  return (
    <div className="student-pending-page">
      <div className="student-pending-card">
        <div className="student-pending-mark">BA</div>
        <span>Cadastro recebido</span>
        <h1>Olá, {user?.name?.split(' ')[0] || 'aluno'}.</h1>
        <p>Sua conta está aguardando aprovação. Assim que o acesso for liberado, seu painel completo aparecerá aqui.</p>
        <button onClick={onLogout}>Sair da conta</button>
      </div>
    </div>
  )
}

function StudentProfile({ user }) {
  return (
    <div className="student-profile-page">
      <section className="student-profile-card">
        <div className="student-profile-avatar">
          {user?.profilePhoto ? <img src={user.profilePhoto} alt="Foto de perfil" /> : user?.name?.[0] || 'A'}
        </div>
        <div>
          <span className="student-profile-label">Perfil do aluno</span>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>
      </section>
      <section className="student-profile-details">
        <div><span>Status</span><strong>{user?.status === 'APPROVED' ? 'Ativo' : user?.status}</strong></div>
        <div><span>Telefone</span><strong>{user?.phone || 'Não informado'}</strong></div>
        <div><span>ID do aluno</span><strong>{user?.studentId || '—'}</strong></div>
      </section>
    </div>
  )
}

export default function StudentDashboard({ user, token, onLogout }) {
  if (user?.status !== 'APPROVED') return <PendingApproval user={user} onLogout={onLogout} />

  return (
    <Routes>
      <Route element={<StudentShell user={user} onLogout={onLogout} />}>
        <Route index element={<StudentHome user={user} />} />
        <Route path="treinos" element={<StudentWeeks studentId={user.studentId} token={token} />} />
        <Route path="semanas" element={<Navigate to="../treinos" replace />} />
        <Route path="acompanhamento" element={<StudentWeeklyTracking studentId={user.studentId} token={token} />} />
        <Route path="videos" element={<StudentVideos token={token} />} />
        <Route path="perguntas" element={<StudentQuestions studentId={user.studentId} token={token} />} />
        <Route path="ranking" element={<StudentRanking token={token} />} />
        <Route path="perfil" element={<StudentProfile user={user} />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  )
}
