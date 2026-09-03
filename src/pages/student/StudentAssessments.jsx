import React, { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import './StudentAssessments.css'

const stages = [
  ['ANAMNESIS', 'Anamnese', 'Histórico de saúde, rotina e objetivos'], ['BODY', 'Avaliação Antropométrica', 'Medidas para acompanhar sua evolução'],
  ['POSTURAL', 'Avaliação Postural', '23 fotos privadas para análise completa'], ['STRENGTH', 'Teste Físico', 'Força e resistência de força'],
  ['ENDURANCE', 'Teste Cardiorrespiratório', 'VAM na esteira; bike a definir']
]
const exercises = [['smithSquat', 'Agachamento no Smith'], ['closeGripPulldown', 'Puxador Fechado'], ['seatedDumbbellPress', 'Desenvolvimento com Halteres Sentado'], ['deadlift', 'Levantamento Terra']]
const views = [['FRONT', 'Foto de frente'], ['BACK', 'Foto de costas'], ['RIGHT', 'Lado direito - braços ao lado'], ['LEFT', 'Lado esquerdo - braços ao lado'], ['FRONT_RELAXED', 'Lado direito - braços para cima'], ['BACK_RELAXED', 'Lado esquerdo - braços para cima'], ['RIGHT_RELAXED', 'Agachamento - frente'], ['LEFT_RELAXED', 'Agachamento - lado esquerdo'], ['FRONT_DETAIL', 'Agachamento - costas'], ['BACK_DETAIL', 'Agachamento - lado direito'], ['DEEP_SQUAT', 'Cócoras'], ['RIGHT_DETAIL', 'Trendelenburg - lado direito'], ['LEFT_DETAIL', 'Trendelenburg - lado esquerdo'], ['FRONT_FOURTH', 'Teste de Adams'], ['BACK_FOURTH', 'Mobilidade escapular'], ['RIGHT_FOURTH', 'Teste de FABER - lado direito'], ['LEFT_FOURTH', 'Teste de FABER - lado esquerdo'], ['FRONT_FIFTH', 'Sentar e alcançar'], ['BACK_FIFTH', 'Sentar e alcançar - adutores'], ['RIGHT_FIFTH', 'Teste de Thomas - lado direito'], ['LEFT_FIFTH', 'Teste de Thomas - lado esquerdo'], ['POSTERIOR_RIGHT', 'Teste para posteriores - perna direita'], ['POSTERIOR_LEFT', 'Teste para posteriores - perna esquerda']]
const statusLabel = { PENDING: 'Pendente', IN_PROGRESS: 'Em andamento', COMPLETED: 'Concluída' }

function Video({ url }) {
  if (!url) return <p className="assessment-video-empty">O vídeo de orientação será disponibilizado em breve.</p>
  const id = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)?.[1]
  return id ? <div className="assessment-video"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title="Orientação da Bruna" allowFullScreen /></div> : null
}

export default function StudentAssessments({ mode = 'assessment' }) {
  const { user } = useAuth()
  const [payload, setPayload] = useState({ cycles: [], videos: [] }); const [programWeeks,setProgramWeeks]=useState([]); const [selected, setSelected] = useState(0); const [open, setOpen] = useState('ANAMNESIS'); const [form, setForm] = useState({}); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)
  const load = async () => { const [{ data },weeksResponse] = await Promise.all([api.get('/assessments'),mode==='reassessment'?api.get(`/tracking/student/${user.studentId}/weeks`):Promise.resolve({data:[]})]); setPayload(data);setProgramWeeks(weeksResponse.data||[]); const available = mode === 'reassessment' ? data.cycles.map((item, index) => item.sequence ? index : -1).filter((index) => index >= 0) : [0]; setSelected(available.at(-1) ?? 0) }
  useEffect(() => { load().catch(() => setMessage('Não foi possível carregar sua avaliação.')) }, [])
  const cycle = payload.cycles[selected]
  const videos = useMemo(() => Object.fromEntries(payload.videos.map((item) => [item.stage, item.youtubeUrl])), [payload.videos])
  useEffect(() => { if (cycle) setForm({ ANAMNESIS: cycle.anamnesis || {}, BODY: cycle.bodyAssessment || {}, STRENGTH: { ...(cycle.strengthTest || {}), pushUps: cycle.strengthTest?.pushUps ?? cycle.enduranceTest?.pushUps, plankSeconds: cycle.strengthTest?.plankSeconds ?? cycle.enduranceTest?.plankSeconds, abdominalReps: cycle.strengthTest?.abdominalReps ?? cycle.enduranceTest?.abdominalReps }, ENDURANCE: cycle.enduranceTest || {}, healthConsent: Boolean(cycle.healthConsentAt) }) }, [cycle?.id])
  const setField = (stage, key, value) => setForm((old) => ({ ...old, [stage]: { ...(old[stage] || {}), [key]: value } }))
  async function save(stage, complete) { try { setBusy(true); const { data } = await api.patch(`/assessments/${cycle.id}/stages/${stage}`, { data: form[stage], complete, healthConsent: form.healthConsent }); setPayload((old) => ({ ...old, cycles: old.cycles.map((item) => item.id === data.id ? data : item) })); setMessage(complete ? 'Etapa concluída.' : 'Rascunho salvo.') } catch (error) { setMessage(error.response?.data?.error || 'Não foi possível salvar.') } finally { setBusy(false) } }
  async function photo(view, file) { if (!file) return; const body = new FormData(); body.append('photo', file); try { setBusy(true); await api.post(`/assessments/${cycle.id}/photos/${view}`, body); await load(); setMessage('Foto enviada com segurança.') } catch (error) { setMessage(error.response?.data?.error || 'Não foi possível enviar a foto.') } finally { setBusy(false) } }
  if (!cycle) return <div className="assessment-state">Carregando avaliação...</div>
  if (mode === 'reassessment' && !cycle.sequence) return <div className="assessment-state"><h2>Reavaliação</h2><p>Nenhuma reavaliação foi liberada para você ainda.</p></div>
  return <section className="assessments-page">
    <header className="assessment-hero"><div><span>Minha evolução</span><h2>{cycle.sequence ? `Reavaliação ${cycle.sequence}` : 'Avaliação inicial'}</h2><p>Faça as etapas na ordem que preferir. O prazo único é de 7 dias corridos.</p></div><div className="assessment-deadline"><strong>{cycle.progress}%</strong><span>{cycle.status === 'COMPLETED' ? 'Concluída' : `${cycle.daysRemaining} dias restantes`}</span></div></header>
    {mode === 'reassessment' && payload.cycles.filter((item) => item.sequence).length > 1 && <div className="cycle-tabs">{payload.cycles.map((item, index) => item.sequence ? <button className={index === selected ? 'active' : ''} onClick={() => setSelected(index)} key={item.id}>{`Reavaliação ${item.sequence}`}</button> : null)}</div>}
    {mode === 'reassessment' && <aside className="reassessment-workout"><strong>Treino 01 da evolução</strong><span>{programWeeks.filter(item=>(item.trainingNumber||1)===1&&item.isCompleted).length} de 6 semanas concluídas</span><p>O primeiro treino permanece visível como referência durante esta reavaliação.</p></aside>}
    {message && <div className="assessment-message">{message}</div>}
    <div className="assessment-layout"><nav className="stage-list">{stages.map(([key, title, description]) => <button key={key} className={open === key ? 'active' : ''} onClick={() => setOpen(key)}><span className={`stage-dot ${cycle.stageStatuses[key]?.toLowerCase()}`}>✓</span><span><strong>{title}</strong><small>{description}</small></span><em>{statusLabel[cycle.stageStatuses[key]]}</em></button>)}</nav>
      <article className="stage-panel"><div className="stage-heading"><div><span>Orientação</span><h3>{stages.find(([key]) => key === open)?.[1]}</h3></div><span className="stage-status">{statusLabel[cycle.stageStatuses[open]]}</span></div><Video url={videos[open]} />
        {open === 'ANAMNESIS' && (cycle.sequence ? <ReassessmentAnamnesis data={form.ANAMNESIS || {}} set={(k, v) => setField('ANAMNESIS', k, v)} consent={form.healthConsent} setConsent={(v) => setForm((old) => ({ ...old, healthConsent: v }))} /> : <Anamnesis data={form.ANAMNESIS || {}} set={(k, v) => setField('ANAMNESIS', k, v)} consent={form.healthConsent} setConsent={(v) => setForm((old) => ({ ...old, healthConsent: v }))} />)}
        {open === 'BODY' && <Body data={form.BODY || {}} set={(k, v) => setField('BODY', k, v)} />}
        {open === 'STRENGTH' && <Strength data={form.STRENGTH || {}} set={(key, field, value) => setField('STRENGTH', key, field ? { ...(form.STRENGTH?.[key] || {}), [field]: value } : value)} />}
        {open === 'ENDURANCE' && <Endurance data={form.ENDURANCE || {}} set={(k, v) => setField('ENDURANCE', k, v)} />}
        {open === 'POSTURAL' && <div><div className="privacy-note"><strong>Suas fotos são privadas.</strong><p>O envio permite somente a avaliação profissional. Não autoriza publicação, divulgação ou compartilhamento.</p></div><div className="photo-grid">{views.map(([key, label]) => { const existing = cycle.photos.find((item) => item.view === key); return <label key={key}><strong>{label}</strong><span>{existing ? 'Foto recebida · trocar' : 'Selecionar foto'}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => photo(key, e.target.files[0])} /></label> })}</div></div>}
        {open !== 'POSTURAL' && cycle.status !== 'COMPLETED' && !cycle.expired && <div className="stage-actions"><button disabled={busy} onClick={() => save(open, false)}>Salvar rascunho</button><button className="primary" disabled={busy} onClick={() => save(open, true)}>Concluir etapa</button></div>}
      </article></div>
  </section>
}

function Field({ label, children }) { return <label className="form-field"><span>{label}</span>{children}</label> }
const anamnesisQuestions=[
  ['motivationAndInstagram','O que te motivou a buscar a consultoria online? Como conheceu meu serviço? Deixe aqui seu Instagram para eu te seguir.'],
  ['personalTrainerExperience','Já treinou com personal trainer? E com consultoria online? Como foi sua experiência?'],
  ['routine','Conte sobre sua rotina: horários, ocupação, nível de atividade, trabalho ou faculdade, horário de treino e sono.'],
  ['trainingDifficulties','Quais são suas maiores dificuldades para seguir uma rotina de treinos?'],
  ['fatigueLevel','Qual seu nível de cansaço no dia a dia, de 0 a 10?','number',0,10],
  ['sleepHours','Quantas horas você dorme por dia?','number',0,24],
  ['sleepQuality','Como é a qualidade do seu sono?'],
  ['waterLiters','Quantos litros de água você bebe por dia?','number',0,20],
  ['nutrition','Tem cuidado da alimentação? Possui acompanhamento nutricional ou utiliza suplementos?'],
  ['smokingAndAlcohol','Você fuma ou consome bebida alcoólica? Com que frequência?'],
  ['healthAndMedication','Possui problema de saúde diagnosticado, tratamento médico ou usa medicação? Qual?'],
  ['currentSymptoms','Atualmente sente tonturas, dor de cabeça, desmaio, palpitação, dispneia, dor no peito ou enjoo?'],
  ['injuryHistory','Já sofreu alguma lesão muscular, óssea ou articular?'],
  ['surgeryHistory','Já fez alguma cirurgia? Qual?'],
  ['allergies','Possui alguma alergia?'],
  ['currentPain','Sente alguma dor atualmente? Onde e como?'],
  ['effortDiscomfort','Sente desconforto ao realizar esforço no dia a dia ou algum exercício de musculação?'],
  ['goals','Quais são seus principais objetivos?'],
  ['bodyPerception','Qual sua percepção corporal? Sente-se satisfeita ou insatisfeita? Por quê?'],
  ['currentExercises','Quais exercícios pratica atualmente, há quanto tempo, frequência, duração, séries, repetições e divisão semanal? Descreva o que faz hoje.'],
  ['cardio','Costuma fazer exercícios aeróbios? Quais? Se não, quais prefere fazer?'],
  ['weeklyFrequency','Quantas vezes por semana pretende treinar?','number',0,14],
  ['trainingLocation','Onde pretende treinar? Envie pelo WhatsApp um vídeo dos aparelhos disponíveis na academia.'],
  ['trainingMinutes','Quanto tempo, em minutos, tem disponível para treinar?','number',0,600],
  ['muscleEmphasis','Existe algum grupo muscular ao qual deseja dar mais ênfase?'],
  ['effortPreference','Prefere treinos com percepção de esforço maior ou menor?'],
  ['exercisePreferences','Quais exercícios mais gosta? Há algum que não gosta ou que cause incômodo?'],
  ['methodPreferences','Há alguma metodologia de treino que gosta ou não gosta? Possui outras preferências?'],
  ['relevantNotes','Alguma observação?']
]
function Anamnesis({ data, set, consent, setConsent }) { return <div className="assessment-form"><p className="form-intro">Responda com detalhes. Essas informações serão usadas exclusivamente para personalizar seu acompanhamento.</p>{anamnesisQuestions.map(([key,label,type,min,max],index)=><Field key={key} label={`${index+1}. ${label}`}>{type==='number'?<input type="number" min={min} max={max} step={key==='waterLiters'?'0.1':'1'} value={data[key]??''} onChange={e=>set(key,e.target.value)}/>:<textarea rows="4" value={data[key]||''} onChange={e=>set(key,e.target.value)}/>}</Field>)}<label className="consent"><input type="checkbox" checked={Boolean(consent)} onChange={(e) => setConsent(e.target.checked)} /><span>Concordo com o tratamento destes dados sensíveis exclusivamente para avaliação e prescrição do meu treinamento, conforme a Política de Privacidade.</span></label></div> }
function ReassessmentAnamnesis({data,set,consent,setConsent}){return <div className="assessment-form"><p className="form-intro">Conte o que mudou desde a última avaliação para ajustarmos a próxima etapa.</p><Field label="1. Desde a sua última avaliação, sua rotina mudou? Se sim, conte como."><textarea rows="4" value={data.routineChanges||''} onChange={e=>set('routineChanges',e.target.value)}/></Field><Field label="2. Você percebeu alguma mudança na disposição, qualidade do sono ou humor?"><textarea rows="4" value={data.wellbeingChanges||''} onChange={e=>set('wellbeingChanges',e.target.value)}/></Field><Field label="3. O formato dos treinos, a divisão e a seleção de exercícios agradam? Gostaria de algum ajuste?"><textarea rows="4" value={data.workoutFeedback||''} onChange={e=>set('workoutFeedback',e.target.value)}/></Field><Field label="4. Qual sua percepção corporal atual? Está satisfeita ou insatisfeita? Percebeu mudanças desde a última avaliação? Quais?"><textarea rows="4" value={data.currentBodyPerception||''} onChange={e=>set('currentBodyPerception',e.target.value)}/></Field><div className="form-grid"><Field label="5. Nota de dedicação aos treinos (0 a 10)"><input type="number" min="0" max="10" value={data.trainingDedicationScore??''} onChange={e=>set('trainingDedicationScore',e.target.value)}/></Field><Field label="Nota para alimentação e hidratação (0 a 10)"><input type="number" min="0" max="10" value={data.nutritionHydrationScore??''} onChange={e=>set('nutritionHydrationScore',e.target.value)}/></Field></div><label className="consent"><input type="checkbox" checked={Boolean(consent)} onChange={e=>setConsent(e.target.checked)}/><span>Concordo com o tratamento destes dados sensíveis exclusivamente para reavaliação e prescrição do meu treinamento, conforme a Política de Privacidade.</span></label></div>}
function Body({ data, set }) { const fields=[['weightKg','Peso (kg)'],['heightCm','Altura (cm)'],['waistCm','Cintura (cm)'],['hipCm','Quadril (cm)'],['rightArmCm','Braço direito (cm)'],['leftArmCm','Braço esquerdo (cm)'],['rightThighCm','Coxa direita (cm)'],['leftThighCm','Coxa esquerda (cm)']]; return <div className="assessment-form form-grid">{fields.map(([key,label]) => <Field key={key} label={label}><input type="number" step="0.1" value={data[key] ?? ''} onChange={(e) => set(key,e.target.value)} /></Field>)}</div> }
function Strength({ data, set }) { return <div className="assessment-form"><h4>Teste de Força</h4><div className="exercise-grid">{exercises.map(([key,label]) => { const item=data[key]||{}; const estimate=item.loadKg&&item.repetitions ? (Number(item.loadKg)*(1+Number(item.repetitions)/30)).toFixed(1) : '—'; return <div className="exercise-card" key={key}><strong>{label}</strong><div className="form-grid"><Field label="Carga (kg)"><input type="number" step="0.5" value={item.loadKg ?? ''} onChange={(e) => set(key,'loadKg',e.target.value)} /></Field><Field label="Repetições"><input type="number" value={item.repetitions ?? ''} onChange={(e) => set(key,'repetitions',e.target.value)} /></Field></div><span>1RM estimado <b>{estimate} kg</b></span></div>})}</div><h4>Resistência de Força</h4><div className="form-grid"><Field label="Flexões até a falha"><input type="number" value={data.pushUps ?? ''} onChange={(e) => set('pushUps',null,e.target.value)} /></Field><Field label="Prancha até a falha (segundos)"><input type="number" value={data.plankSeconds ?? ''} onChange={(e) => set('plankSeconds',null,e.target.value)} /></Field><Field label="Abdominal em 1 minuto"><input type="number" value={data.abdominalReps ?? ''} onChange={(e) => set('abdominalReps',null,e.target.value)} /></Field></div></div> }
function Endurance({ data, set }) { const vam=data.distanceMeters ? (Number(data.distanceMeters)/83.33).toFixed(2) : '—'; return <div className="assessment-form"><h4>Teste de VAM</h4><div className="form-grid"><Field label="Modalidade VAM (5 min)"><input value="Esteira" readOnly /></Field><Field label="Distância (metros)"><input type="number" value={data.distanceMeters ?? ''} onChange={(e) => set('distanceMeters',e.target.value)} /><small>VAM: {vam} km/h</small></Field></div><div className="privacy-note"><strong>Teste de bike</strong><p>O protocolo específico será acrescentado assim que for definido pela Bruna.</p></div></div> }
