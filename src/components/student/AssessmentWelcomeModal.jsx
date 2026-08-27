import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './AssessmentWelcomeModal.css'

export default function AssessmentWelcomeModal({ user }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(!user?.assessmentIntroSeenAt)
  const [busy, setBusy] = useState(false)

  if (!open) return null

  async function finish(goToAssessment) {
    try {
      setBusy(true)
      await api.patch('/assessments/introduction-seen')
      setOpen(false)
      if (goToAssessment) navigate('/aluno/avaliacao')
    } catch (error) {
      setBusy(false)
    }
  }

  return (
    <div className="assessment-welcome-backdrop" role="presentation">
      <section className="assessment-welcome-modal" role="dialog" aria-modal="true" aria-labelledby="assessment-welcome-title">
        <div className="assessment-welcome-icon" aria-hidden="true">✓</div>
        <span className="assessment-welcome-kicker">Antes de começar</span>
        <h2 id="assessment-welcome-title">Vamos conhecer seu ponto de partida?</h2>
        <p>Preencha sua avaliação inicial para que a Bruna conheça seu histórico, suas medidas e seus resultados atuais.</p>
        <div className="assessment-welcome-info">
          <strong>Você tem 7 dias para concluir.</strong>
          <span>As etapas ficam todas disponíveis e podem ser feitas na ordem que preferir. Seus rascunhos ficam salvos.</span>
        </div>
        <div className="assessment-welcome-actions">
          <button type="button" disabled={busy} onClick={() => finish(false)}>Fazer depois</button>
          <button type="button" className="primary" disabled={busy} onClick={() => finish(true)}>{busy ? 'Abrindo…' : 'Sim, preencher avaliação'}</button>
        </div>
      </section>
    </div>
  )
}
