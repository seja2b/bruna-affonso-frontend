import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminShell from '../components/admin/AdminShell'
import '../components/admin/AdminShell.css'
import AdminHome from './admin/AdminHome'
import AdminStudentDetail from './admin/AdminStudentDetail'
import AdminVideoClasses from './admin/AdminVideoClasses'
import AdminStudents from './AdminStudents'
import AdminWorkouts from './AdminWorkouts'
import AdminQuestions from './AdminQuestions'
import AdminSettings from './AdminSettings'
import AdminTracking from '../components/AdminTracking'
import AdminRanking from '../components/AdminRanking'
import AdminAssessments from './admin/AdminAssessments'

export default function AdminDashboard({ user, token, onLogout }) {
  return (
    <Routes>
      <Route element={<AdminShell user={user} onLogout={onLogout} />}>
        <Route index element={<AdminHome />} />
        <Route path="alunos" element={<AdminStudents user={user} token={token} />} />
        <Route path="alunos/:id" element={<AdminStudentDetail />} />
        <Route path="treinos" element={<Navigate to="../videos" replace />} />
        <Route path="semanas" element={<Navigate to="../acompanhamentos" replace />} />
        <Route path="acompanhamentos" element={<AdminTracking token={token} />} />
        <Route path="avaliacoes" element={<AdminAssessments />} />
        <Route path="perguntas" element={<AdminQuestions user={user} token={token} />} />
        <Route path="videos" element={<AdminVideoClasses />} />
        <Route path="ranking" element={<AdminRanking token={token} />} />
        <Route path="notificacoes" element={<Navigate to="../" replace />} />
        <Route path="configuracoes" element={<AdminSettings user={user} token={token} />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  )
}
