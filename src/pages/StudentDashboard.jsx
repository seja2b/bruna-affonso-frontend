import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import StudentShell from '../components/student/StudentShell'
import '../components/student/StudentShell.css'
import StudentHome from './student/StudentHome'
import StudentProfile from './student/StudentProfile'
import StudentWeeks from '../components/StudentWeeks'
import StudentWeeklyTracking from '../components/StudentWeeklyTracking'
import StudentVideos from '../components/StudentVideos'
import StudentQuestions from '../components/StudentQuestions'
import StudentRanking from '../components/StudentRanking'
import StudentAssessments from './student/StudentAssessments'
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

export default function StudentDashboard({ user, token, onLogout }) {
  if (user?.status !== 'APPROVED') return <PendingApproval user={user} onLogout={onLogout} />

  return (
    <Routes>
      <Route element={<StudentShell user={user} onLogout={onLogout} />}>
        <Route index element={<StudentHome user={user} />} />
        <Route path="treinos" element={<StudentWeeks studentId={user.studentId} token={token} />} />
        <Route path="semanas" element={<Navigate to="../treinos" replace />} />
        <Route path="acompanhamento" element={<StudentWeeklyTracking studentId={user.studentId} token={token} />} />
        <Route path="avaliacao" element={<StudentAssessments />} />
        <Route path="videos" element={<StudentVideos token={token} />} />
        <Route path="perguntas" element={<StudentQuestions studentId={user.studentId} token={token} />} />
        <Route path="ranking" element={<StudentRanking token={token} />} />
        <Route path="perfil" element={<StudentProfile />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  )
}
