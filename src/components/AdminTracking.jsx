import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { buildExerciseEvolution, evolutionSummary } from '../utils/trackingEvolution'
import './AdminTracking.css'
import './AdminTrackingCalendar.css'

const weekdays = [['MONDAY','Segunda-feira'],['TUESDAY','Terça-feira'],['WEDNESDAY','Quarta-feira'],['THURSDAY','Quinta-feira'],['FRIDAY','Sexta-feira']]

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

const kg = value => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })

function LoadEvolutionCard({ weeks, trainingNumber }) {
  const exercises = useMemo(() => buildExerciseEvolution(weeks), [weeks])
  const [selectedKey, setSelectedKey] = useState('')
  const selected = exercises.find(exercise => exercise.key === selectedKey) || exercises[0]

  useEffect(() => {
    if (exercises.length && !exercises.some(exercise => exercise.key === selectedKey)) setSelectedKey(exercises[0].key)
  }, [exercises, selectedKey])

  if (!exercises.length) return <section className="load-evolution-card empty"><div><span>Evolução de cargas</span><h5>Treino {String(trainingNumber).padStart(2, '0')}</h5></div><p>O gráfico aparecerá assim que a aluna registrar cargas nas semanas deste treino.</p></section>

  const summary = evolutionSummary(selected.points)
  const recorded = selected.points.filter(point => point.weight !== null)
  const weights = recorded.map(point => point.weight)
  const rawMin = Math.min(...weights)
  const rawMax = Math.max(...weights)
  const padding = Math.max((rawMax - rawMin) * .18, rawMax * .08, 1)
  const min = Math.max(0, rawMin - padding)
  const max = rawMax + padding
  const range = Math.max(1, max - min)
  const x = index => 58 + index * 124
  const y = weight => 190 - ((weight - min) / range) * 145
  const chartPoints = selected.points.map((point, index) => point.weight === null ? null : { x: x(index), y: y(point.weight), point }).filter(Boolean)
  const linePath = chartPoints.reduce((path, current, index) => {
    if (index === 0) return `M ${current.x} ${current.y}`
    const previous = chartPoints[index - 1]
    const middle = (previous.x + current.x) / 2
    return `${path} C ${middle} ${previous.y}, ${middle} ${current.y}, ${current.x} ${current.y}`
  }, '')
  const areaPath = chartPoints.length > 1 ? `${linePath} L ${chartPoints.at(-1).x} 198 L ${chartPoints[0].x} 198 Z` : ''
  const grid = Array.from({ length: 4 }, (_, index) => ({ y: 45 + index * 48, value: max - (index / 3) * range }))

  return <section className="load-evolution-card">
    <header><div><span>Performance de carga</span><h5>Evolução no Treino {String(trainingNumber).padStart(2, '0')}</h5><p>Acompanhe a maior carga registrada em cada semana do ciclo.</p></div><div className="load-evolution-header-actions"><b>{recorded.length}/6 semanas com dados</b><label>Exercício<select value={selected?.key || ''} onChange={event => setSelectedKey(event.target.value)}>{exercises.map(exercise => <option key={exercise.key} value={exercise.key}>{exercise.label}</option>)}</select></label></div></header>
    <div className="load-evolution-metrics"><article><span>Inicial</span><strong>{kg(summary.initial)} kg</strong></article><article><span>Atual</span><strong>{kg(summary.current)} kg</strong></article><article><span>Maior carga</span><strong>{kg(summary.peak)} kg</strong></article><article className={summary.change > 0 ? 'positive' : summary.change < 0 ? 'negative' : ''}><span>Evolução</span><strong>{summary.change > 0 ? '+' : ''}{kg(summary.change)} kg</strong><small>{summary.percentage === null ? '—' : `${summary.percentage > 0 ? '+' : ''}${summary.percentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}</small></article></div>
    {recorded.length === 1 ? <div className="load-chart-single"><div className="single-load-hero"><span>Ponto de partida</span><strong>{kg(recorded[0].weight)}<small>kg</small></strong><p>Primeira carga registrada. O traçado da evolução aparecerá a partir do próximo registro.</p></div><div className="load-week-timeline">{selected.points.map(point => <div className={point.weight !== null ? 'has-data' : ''} key={point.weekNumber}><span>{point.weight !== null ? '✓' : ''}</span><strong>Semana {point.weekNumber}</strong><small>{point.weight !== null ? `${kg(point.weight)} kg` : 'Aguardando'}</small></div>)}</div></div> : <div className="load-chart-wrap"><svg className="load-chart" viewBox="0 0 720 245" role="img" aria-label={`Evolução da carga de ${selected.label}`}>
      <defs><linearGradient id={`loadArea-${trainingNumber}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0132C8" stopOpacity=".3"/><stop offset="100%" stopColor="#0132C8" stopOpacity=".02"/></linearGradient><linearGradient id={`loadLine-${trainingNumber}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#01155C"/><stop offset="55%" stopColor="#0132C8"/><stop offset="100%" stopColor="#0132C8"/></linearGradient></defs>
      {grid.map(line => <g key={line.y}><line x1="58" x2="678" y1={line.y} y2={line.y} /><text x="50" y={line.y + 4} textAnchor="end">{kg(line.value)}</text></g>)}
      <path className="load-area" d={areaPath} fill={`url(#loadArea-${trainingNumber})`} /><path className="load-line" d={linePath} stroke={`url(#loadLine-${trainingNumber})`} />
      {selected.points.map((point, index) => <g className={point.weight === null ? 'missing' : 'recorded'} key={point.weekNumber}><line className="week-guide" x1={x(index)} x2={x(index)} y1="38" y2="198" />{point.weight !== null ? <><circle cx={x(index)} cy={y(point.weight)} r="6"><title>Semana {point.weekNumber}: {kg(point.weight)} kg{point.reps ? ` · ${point.reps} repetições` : ''}</title></circle><text className="point-value" x={x(index)} y={y(point.weight) - 13} textAnchor="middle">{kg(point.weight)} kg</text></> : <circle className="ghost-point" cx={x(index)} cy="198" r="4"/>}<text className="week-label" x={x(index)} y="222" textAnchor="middle">S{point.weekNumber}</text></g>)}
    </svg></div>}
    <footer><span><i className="legend-dot" /> Carga registrada</span><small>Semanas sem preenchimento ficam sem ponto no gráfico.</small></footer>
  </section>
}

export default function AdminTracking() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [weeks, setWeeks] = useState([])
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [weekData, setWeekData] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => { fetchStudents() }, [])

  useEffect(() => {
    const requestedStudent = searchParams.get('student')
    if (requestedStudent && students.some((student) => student.id === requestedStudent) && requestedStudent !== selectedStudent) {
      handleStudentSelect(requestedStudent, false)
    }
  }, [students, searchParams])

  async function fetchStudents() {
    try {
      setLoading(true)
      const response = await api.get('/tracking/students')
      setStudents(response.data || [])
    } catch (error) {
      console.error('Erro ao buscar alunos', error)
      setFeedback('Não foi possível carregar os alunos.')
    } finally {
      setLoading(false)
    }
  }

  async function handleStudentSelect(studentId, updateUrl = true) {
    setSelectedStudent(studentId)
    setSelectedWeek(null)
    setWeekData(null)
    setAdminNote('')
    setFeedback('')
    if (updateUrl) setSearchParams({ student: studentId })

    try {
      const response = await api.get(`/tracking/admin/student/${studentId}/weeks`)
      setWeeks(response.data || [])
    } catch (error) {
      console.error('Erro ao buscar semanas', error)
      setFeedback('Não foi possível carregar as semanas deste aluno.')
    }
  }

  async function handleWeekSelect(weekId) {
    setSelectedWeek(weekId)
    setFeedback('')
    try {
      const response = await api.get(`/tracking/admin/week/${weekId}`)
      setWeekData(response.data)
      setAdminNote(response.data.observation?.teacherNote || '')
    } catch (error) {
      console.error('Erro ao buscar dados da semana', error)
      setFeedback('Não foi possível carregar esta semana.')
    }
  }

  async function handleSaveAdminNote() {
    if (!selectedWeek) return
    setSaving(true)
    setFeedback('')
    try {
      await api.put(`/tracking/week/${selectedWeek}/observation`, { teacherNote: adminNote })
      setFeedback('Observação salva com sucesso.')
      await handleWeekSelect(selectedWeek)
    } catch (error) {
      console.error('Erro ao salvar observação', error)
      setFeedback('Não foi possível salvar a observação.')
    } finally {
      setSaving(false)
    }
  }

  async function handleManualRelease() {
    if (!selectedWeek) return
    setReleasing(true)
    setFeedback('')
    try {
      const response = await api.put(`/tracking/admin/week/${selectedWeek}/release`)
      setWeekData(response.data.week)
      setWeeks((current) => current.map((week) => week.id === selectedWeek ? response.data.week : week))
      setFeedback('Semana liberada manualmente para o aluno.')
    } catch (error) {
      console.error('Erro ao liberar semana', error)
      setFeedback('Não foi possível liberar a semana.')
    } finally {
      setReleasing(false)
    }
  }

  async function createTraining() { try { setSaving(true); const {data}=await api.post(`/tracking/admin/student/${selectedStudent}/workouts`); setFeedback(data.message); await handleStudentSelect(selectedStudent,false) } catch(error){setFeedback(error.response?.data?.error||'Não foi possível criar o treino.')} finally{setSaving(false)} }
  async function deleteProgram() { if(!window.confirm('Excluir definitivamente todos os treinos e semanas desta aluna? Esta ação também apaga todo o preenchimento contido neles.'))return; try{setSaving(true);const {data}=await api.delete(`/tracking/admin/student/${selectedStudent}/program`);setFeedback(data.message);await handleStudentSelect(selectedStudent,false)}catch(error){setFeedback(error.response?.data?.error||'Não foi possível excluir as semanas.')}finally{setSaving(false)} }
  async function clearWeeks() { if(!window.confirm('Zerar o conteúdo de todas as semanas desta aluna? Os blocos e as datas serão mantidos, mas exercícios, observações, conclusões e progresso serão apagados.'))return; try{setSaving(true);const {data}=await api.post(`/tracking/admin/student/${selectedStudent}/weeks/clear`);setFeedback(data.message);await handleStudentSelect(selectedStudent,false)}catch(error){setFeedback(error.response?.data?.error||'Não foi possível zerar o conteúdo das semanas.')}finally{setSaving(false)} }
  async function changePackage(packageType){try{await api.put(`/tracking/admin/student/${selectedStudent}/package`,{packageType});setStudents(current=>current.map(item=>item.id===selectedStudent?{...item,packageType}:item));setFeedback('Plano atualizado.')}catch(error){setFeedback(error.response?.data?.error||'Não foi possível atualizar o plano.')}}
  async function saveDates(event){event.preventDefault();const body=new FormData(event.currentTarget);try{const {data}=await api.put(`/tracking/admin/week/${selectedWeek}/dates`,{startDate:body.get('startDate'),endDate:body.get('endDate')});setWeekData(data.week);setWeeks(current=>current.map(item=>item.id===selectedWeek?data.week:item));setFeedback('Datas atualizadas.')}catch(error){setFeedback(error.response?.data?.error||'Não foi possível atualizar as datas.')}}

  const student = students.find((item) => item.id === selectedStudent)
  const selectedWeekSummary = useMemo(() => weeks.find((week) => week.id === selectedWeek), [weeks, selectedWeek])

  if (loading) return <div className="loading">Carregando acompanhamento...</div>

  return (
    <div className="admin-tracking">
      <div className="tracking-header">
        <h2>Acompanhamento por aluno e semana</h2>
        <p>Veja exatamente o que cada aluno preencheu, acompanhe a semana do calendário e registre seu feedback.</p>
      </div>

      {feedback && <div className="tracking-feedback" role="status">{feedback}</div>}

      <div className="tracking-container">
        <aside className="students-list-section">
          <h3>Alunos ativos</h3>
          <div className="students-list">
            {students.map((item) => (
              <button key={item.id} className={`student-item ${selectedStudent === item.id ? 'active' : ''}`} onClick={() => handleStudentSelect(item.id)}>
                <span className="student-avatar">{item.profilePhoto ? <img src={item.profilePhoto} alt={`Foto de ${item.name}`} /> : item.name?.charAt(0)?.toUpperCase()}</span>
                <div className="student-info"><div className="student-name">{item.name}</div><div className="student-email">{item.email}</div></div>
              </button>
            ))}
          </div>
        </aside>

        <main className="tracking-content">
          {!selectedStudent ? (
            <div className="empty-placeholder"><p>Selecione um aluno para visualizar as semanas e o preenchimento.</p></div>
          ) : !selectedWeek ? (
            <div className="weeks-section">
              <div className="program-admin-toolbar"><div><h3>{student?.name} · treinos do programa</h3><select value={student?.packageType||'QUARTERLY'} onChange={e=>changePackage(e.target.value)}><option value="QUARTERLY">Trimestral · 2 treinos</option><option value="SEMIANNUAL">Semestral · 4 treinos</option></select></div><div><button onClick={createTraining} disabled={saving}>+ Criar Treino</button><button className="warning" onClick={clearWeeks} disabled={saving||!weeks.length}>Zerar conteúdo</button><button className="danger" onClick={deleteProgram} disabled={saving||!weeks.length}>Excluir semanas</button></div></div>
              {[...new Set(weeks.map(week=>week.trainingNumber||1))].map(training=>{const trainingWeeks=weeks.filter(week=>(week.trainingNumber||1)===training);return <section className="training-group" key={training}><h4>Treino {String(training).padStart(2,'0')} · 6 semanas</h4>
              <LoadEvolutionCard weeks={trainingWeeks} trainingNumber={training} />
              <div className="weeks-grid">
                {trainingWeeks.map((week) => (
                  <button key={week.id} className={`week-card ${week.isCompleted ? 'completed' : ''} ${week.isReleased ? 'released' : 'locked'}`} onClick={() => handleWeekSelect(week.id)}>
                    <div className="week-icon">{week.isCompleted ? '✓' : week.isReleased ? '●' : '—'}</div>
                    <div className="week-label">Semana {week.weekNumber}</div>
                    <small>{dateFormatter.format(new Date(week.startDate))} a {dateFormatter.format(new Date(week.endDate))}</small>
                    <small>Semana {week.calendarWeek} de {week.calendarYear}</small>
                    <div className="week-badge">{week.isCompleted ? 'Concluída' : week.isReleased ? 'Liberada' : 'Bloqueada'}</div>
                  </button>
                ))}
              </div>
              </section>})}
            </div>
          ) : (
            <div className="week-details-section">
              <button className="btn-voltar-semanas" onClick={() => { setSelectedWeek(null); setWeekData(null); setAdminNote(''); setFeedback('') }}>← Voltar para semanas</button>

              <div className="admin-week-heading">
                <div>
                  <h3>Semana {selectedWeekSummary?.weekNumber} · {student?.name}</h3>
                  <p>{dateFormatter.format(new Date(selectedWeekSummary.startDate))} a {dateFormatter.format(new Date(selectedWeekSummary.endDate))} · segunda a sexta</p>
                </div>
                <span className={`admin-week-status ${selectedWeekSummary?.isReleased ? 'released' : 'locked'}`}>{selectedWeekSummary?.isCompleted ? 'Semana concluída' : selectedWeekSummary?.isReleased ? 'Liberada' : 'Bloqueada'}</span>
              </div>
              <form className="week-date-editor" onSubmit={saveDates}><label>Início<input name="startDate" type="date" defaultValue={selectedWeekSummary?.startDate?.slice(0,10)}/></label><label>Fim<input name="endDate" type="date" defaultValue={selectedWeekSummary?.endDate?.slice(0,10)}/></label><button>Salvar datas</button></form>

              {!selectedWeekSummary?.isReleased && (
                <div className="manual-release-card">
                  <div><strong>Liberação manual</strong><p>Esta semana será liberada automaticamente na segunda-feira às 00:00. Se necessário, você pode antecipar o acesso.</p></div>
                  <button onClick={handleManualRelease} disabled={releasing}>{releasing ? 'Liberando...' : 'Liberar semana agora'}</button>
                </div>
              )}

              <div className="week-exercises-card">
                <h4>Preenchimento manual do aluno</h4>
                {!weekData || weekData.exercises.length === 0 ? (
                  <div className="empty-exercises"><p>Nenhum exercício registrado ainda.</p></div>
                ) : (
                  <div className="admin-daily-exercises">{weekdays.map(([day,label])=>{const daily=weekData.exercises.filter(exercise=>(exercise.dayOfWeek||'MONDAY')===day);return <section key={day} className="admin-training-day"><h5>{label}<span>{daily.length} exercício(s)</span></h5>{daily.length===0?<p>Nenhum exercício registrado.</p>:<div className="exercises-table"><div className="table-header"><div>Exercício</div><div>Tipo</div><div>Carga</div><div>Reps</div><div>Observação</div></div>{daily.map(exercise=><div key={exercise.id} className="table-row"><div className="col-exercise"><strong>{exercise.exerciseName}</strong></div><div className="col-type">{exercise.trainingType}</div><div className="col-weight">{exercise.weight||'-'}{exercise.weight?' kg':''}</div><div className="col-reps">{exercise.reps||'-'}</div><div className="col-notes">{exercise.notes||'-'}</div></div>)}</div>}</section>})}</div>
                )}
              </div>

              <div className="student-observation-card"><h4>Observação do aluno</h4><div className="observation-text">{weekData?.observation?.studentNote || 'O aluno ainda não deixou observação nesta semana.'}</div></div>

              <div className="admin-observation-card">
                <h4>Observação da professora</h4>
                <textarea className="admin-note-textarea" placeholder="Comente sobre execução, carga, evolução, ajustes e orientação para a próxima semana..." value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows="6" />
                <div className="char-count">{adminNote.length} caracteres</div>
                <button className="btn-salvar-nota" onClick={handleSaveAdminNote} disabled={saving}>{saving ? 'Salvando...' : 'Salvar observação'}</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
