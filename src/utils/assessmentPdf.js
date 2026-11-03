import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import api from '../services/api'
import { strengthExercises, strengthRows, classificationExplanation, cycleLabel, resistanceResults } from './strengthResults'
import { buildExerciseEvolution, evolutionSummary } from './trackingEvolution'

const labels={weightKg:'Peso (kg)',heightCm:'Altura (cm)',waistCm:'Cintura (cm)',hipCm:'Quadril (cm)',rightArmCm:'Braço direito (cm)',leftArmCm:'Braço esquerdo (cm)',rightThighCm:'Coxa direita (cm)',leftThighCm:'Coxa esquerda (cm)',smithSquat:'Agachamento no Smith',closeGripPulldown:'Puxador Fechado',seatedDumbbellPress:'Desenvolvimento sentado',deadlift:'Levantamento Terra'}
const anamnesisLabels={motivationAndInstagram:'Motivação, origem e Instagram',personalTrainerExperience:'Experiência com personal e consultoria',routine:'Rotina diária',trainingDifficulties:'Dificuldades com a rotina de treinos',fatigueLevel:'Nível de cansaço (0 a 10)',sleepHours:'Horas de sono',sleepQuality:'Qualidade do sono',waterLiters:'Litros de água por dia',nutrition:'Alimentação, nutricionista e suplementos',smokingAndAlcohol:'Tabagismo e bebidas alcoólicas',healthAndMedication:'Saúde, tratamentos e medicações',currentSymptoms:'Sintomas atuais',injuryHistory:'Histórico de lesões',surgeryHistory:'Histórico de cirurgias',allergies:'Alergias',currentPain:'Dores atuais',effortDiscomfort:'Desconforto ao realizar esforço',goals:'Objetivos',bodyPerception:'Percepção corporal',currentExercises:'Treino atual',cardio:'Exercícios aeróbios',weeklyFrequency:'Frequência semanal pretendida',trainingLocation:'Local de treino e aparelhos',trainingMinutes:'Tempo disponível para treino (minutos)',muscleEmphasis:'Grupos musculares prioritários',effortPreference:'Preferência de esforço',exercisePreferences:'Preferências de exercícios',methodPreferences:'Preferências de metodologia',relevantNotes:'Observações',routineChanges:'Mudanças na rotina desde a última avaliação',wellbeingChanges:'Mudanças na disposição, sono ou humor',workoutFeedback:'Avaliação do formato e seleção dos treinos',currentBodyPerception:'Percepção corporal atual e mudanças percebidas',trainingDedicationScore:'Dedicação aos treinos (0 a 10)',nutritionHydrationScore:'Alimentação e hidratação (0 a 10)'}
const stageLabels={ANAMNESIS:'Anamnese',BODY:'Avaliação antropométrica',POSTURAL:'Avaliação postural',STRENGTH:'Teste de força',ENDURANCE:'Teste cardiorrespiratório'}
const statusLabels={PENDING:'Pendente',IN_PROGRESS:'Em andamento',COMPLETED:'Concluída'}
const valueLabels={YES:'Sim',NO:'Não',BIKE:'Bicicleta',TREADMILL:'Esteira',TREADMILL_5MIN:'Corrida na esteira - 5 minutos',WALKING_6MIN:'Caminhada - 6 minutos'}
const safe=(value)=>value===null||value===undefined||value===''?'-':String(valueLabels[value]||value).replace(/→/g,' -> ').replace(/[^\x20-\x7E\xA0-\xFF]/g,'')
const hasValue=(value)=>value!==null&&value!==undefined&&value!==''
const formatDate=(value)=>{if(!value)return 'Não informado';const date=new Date(value);return Number.isNaN(date.getTime())?'Não informado':date.toLocaleDateString('pt-BR')}
const wrap=(text,max=88)=>{const lines=[];let line='';for(const word of safe(text).split(/\s+/)){if(`${line} ${word}`.trim().length>max){lines.push(line);line=word}else line=`${line} ${word}`.trim()}if(line)lines.push(line);return lines}
const embedPhoto=async(pdf,response,mime)=>{let bytes=new Uint8Array(response.data);if(mime==='image/png')return pdf.embedPng(bytes);if(mime==='image/jpeg')return pdf.embedJpg(bytes);const bitmap=await createImageBitmap(new Blob([bytes],{type:mime})),canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;canvas.getContext('2d').drawImage(bitmap,0,0);const converted=await new Promise((resolve)=>canvas.toBlob(resolve,'image/png'));bytes=new Uint8Array(await converted.arrayBuffer());return pdf.embedPng(bytes)}

export async function generateAssessmentPdf({cycle,previous,student,settings,professional=false,weeks=[]}){
  const pdf=await PDFDocument.create(),regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);let page,y
  const addPage=()=>{page=pdf.addPage([595.28,841.89]);y=740};addPage()
  const ensure=(height=18)=>{if(y-height<45)addPage()}
  const title=(text,minContent=16)=>{const topGap=y<735?10:0;ensure(topGap+25+minContent);y-=topGap;page.drawText(safe(text),{x:44,y,size:13,font:bold,color:rgb(.15,.23,.42)});y-=25}
  const row=(label,value)=>{const lines=wrap(`${label}: ${safe(value)}`);ensure(lines.length*14+5);lines.forEach((line,index)=>page.drawText(line,{x:50,y:y-index*14,size:9,font:regular,color:rgb(.12,.16,.25)}));y-=lines.length*14+5}
  const photosSection=async(photos,heading)=>{if(!photos?.length)return;title(heading);for(const photo of photos){ensure(190);try{const response=await api.get(photo.url,{responseType:'arraybuffer'}),image=await embedPhoto(pdf,response,photo.mimeType),dimensions=image.scaleToFit(170,170);page.drawImage(image,{x:50,y:y-dimensions.height,width:dimensions.width,height:dimensions.height});page.drawText(safe(photo.view),{x:50,y:y-dimensions.height-12,size:8,font:regular,color:rgb(.44,.48,.55)});y-=dimensions.height+25}catch(error){row(`Foto ${photo.view}`,'Imagem privada indisponivel')}}}
  const kg=(value)=>Number(value).toLocaleString('pt-BR',{maximumFractionDigits:2})
  const drawEvolutionCard=(exercise)=>{
    ensure(139)
    const summary=evolutionSummary(exercise.points),recorded=exercise.points.filter(point=>point.weight!==null)
    const cardTop=y,cardBottom=y-126,left=44,right=551
    page.drawRectangle({x:left,y:cardBottom,width:right-left,height:126,color:rgb(.985,.987,.996),borderColor:rgb(.89,.90,.95),borderWidth:1})
    page.drawText(safe(exercise.label),{x:58,y:cardTop-21,size:11,font:bold,color:rgb(.09,.13,.23)})
    const metrics=[['INICIAL',summary.initial],['ATUAL',summary.current],['MAIOR',summary.peak],['EVOLUCAO',summary.change]]
    metrics.forEach(([label,value],index)=>{const x=286+index*65;page.drawText(label,{x,y:cardTop-17,size:5.7,font:bold,color:rgb(.45,.48,.58)});page.drawText(`${value>0&&label==='EVOLUCAO'?'+':''}${kg(value)} kg`,{x,y:cardTop-29,size:7.7,font:bold,color:value>0&&label==='EVOLUCAO'?rgb(.09,.52,.32):value<0&&label==='EVOLUCAO'?rgb(.72,.14,.12):rgb(.12,.16,.25)})})
    const weights=recorded.map(point=>point.weight),rawMin=Math.min(...weights),rawMax=Math.max(...weights),padding=Math.max((rawMax-rawMin)*.18,rawMax*.08,1),min=Math.max(0,rawMin-padding),max=rawMax+padding,range=Math.max(1,max-min)
    const plotLeft=67,plotRight=529,plotBottom=cardBottom+25,plotTop=cardTop-47,x=index=>plotLeft+index*((plotRight-plotLeft)/5),pointY=value=>plotBottom+((value-min)/range)*(plotTop-plotBottom)
    ;[0,.5,1].forEach(ratio=>{const lineY=plotBottom+ratio*(plotTop-plotBottom);page.drawLine({start:{x:plotLeft,y:lineY},end:{x:plotRight,y:lineY},thickness:.6,color:rgb(.88,.89,.93)})})
    exercise.points.forEach((point,index)=>{const pointX=x(index);page.drawText(`S${point.weekNumber}`,{x:pointX-5,y:cardBottom+9,size:6.5,font:bold,color:rgb(.35,.39,.49)});if(point.weight===null){page.drawCircle({x:pointX,y:plotBottom,size:2.2,color:rgb(.86,.87,.91)});return}const pointPosition={x:pointX,y:pointY(point.weight)},previous=exercise.points.slice(0,index).reverse().find(item=>item.weight!==null);if(previous){const previousIndex=exercise.points.indexOf(previous);page.drawLine({start:{x:x(previousIndex),y:pointY(previous.weight)},end:pointPosition,thickness:2.3,color:rgb(.49,.23,.93)})}page.drawCircle({...pointPosition,size:4.4,color:rgb(1,1,1),borderColor:rgb(.49,.23,.93),borderWidth:2.2});page.drawText(`${kg(point.weight)} kg`,{x:pointX-12,y:pointPosition.y+8,size:6.6,font:bold,color:rgb(.36,.13,.71)})})
    y=cardBottom-12
  }
  const evolutionSection=()=>{
    const trainingNumbers=[...new Set((weeks||[]).map(week=>week.trainingNumber||1))].sort((a,b)=>a-b)
    const trainings=trainingNumbers.map(trainingNumber=>({trainingNumber,exercises:buildExerciseEvolution(weeks.filter(week=>(week.trainingNumber||1)===trainingNumber))})).filter(training=>training.exercises.length)
    addPage()
    page.drawText('EVOLUCAO DE CARGAS',{x:44,y,size:18,font:bold,color:rgb(.09,.13,.23)});y-=22
    page.drawText('Maior carga registrada por exercicio em cada semana do programa.',{x:44,y,size:9,font:regular,color:rgb(.44,.48,.55)});y-=27
    if(!trainings.length){page.drawRectangle({x:44,y:y-92,width:507,height:92,color:rgb(.97,.97,.99),borderColor:rgb(.88,.89,.93),borderWidth:1});page.drawText('Nenhuma carga semanal registrada para esta aluna.',{x:64,y:y-38,size:11,font:bold,color:rgb(.22,.25,.34)});page.drawText('Os graficos aparecerao automaticamente quando houver cargas no acompanhamento.',{x:64,y:y-57,size:8.5,font:regular,color:rgb(.44,.48,.55)});y-=112;return}
    trainings.forEach(training=>{ensure(32);page.drawRectangle({x:44,y:y-3,width:4,height:18,color:rgb(.49,.23,.93)});page.drawText(`Treino ${String(training.trainingNumber).padStart(2,'0')} - ciclo de 6 semanas`,{x:56,y,size:12,font:bold,color:rgb(.15,.23,.42)});y-=25;training.exercises.forEach(drawEvolutionCard)})
  }
  page.drawText(cycle.sequence?`Reavaliação ${cycle.sequence}`:'Avaliação inicial',{x:44,y,size:19,font:bold,color:rgb(.09,.13,.23)});y-=31
  page.drawRectangle({x:44,y:y-55,width:507,height:55,color:rgb(.96,.95,1),borderColor:rgb(.87,.84,.98),borderWidth:1})
  page.drawText('ALUNA',{x:58,y:y-18,size:7,font:bold,color:rgb(.43,.16,.85)})
  page.drawText(safe(student?.name||'Aluna'),{x:58,y:y-39,size:15,font:bold,color:rgb(.09,.13,.23)})
  y-=74
  row('Início',formatDate(cycle.startedAt||cycle.createdAt));row('Prazo',formatDate(cycle.deadlineAt));row('Conclusão',cycle.completedAt?formatDate(cycle.completedAt):'Em andamento');row('Progresso',`${cycle.progress??0}%`);Object.entries(cycle.stageStatuses||{}).forEach(([stage,status])=>row(stageLabels[stage]||stage,statusLabels[status]||status))
  const bodyRows=Object.entries(labels).filter(([key])=>cycle.bodyAssessment&&hasValue(cycle.bodyAssessment[key]))
  if(bodyRows.length){title('Medidas corporais',bodyRows.length*19);bodyRows.forEach(([key,label])=>row(label,cycle.bodyAssessment[key]))}
  const completedStrength=strengthExercises.filter(([key])=>hasValue(cycle.strengthTest?.[key]?.loadKg)||hasValue(cycle.strengthTest?.[key]?.repetitions)||cycle.strengthResults?.exercises?.[key])
  if(completedStrength.length){title('Teste de força - fórmula de Epley',48)
  row('Entenda sua classificação', classificationExplanation)
  row('Referência', 'Peso corporal da avaliação correspondente. Faixas não definidas permanecem sem classificação.')
  for (const [key, label] of completedStrength) {
    title(label,62)
    row('Carga (kg)', cycle.strengthTest?.[key]?.loadKg)
    row('Repetições', cycle.strengthTest?.[key]?.repetitions)
    strengthRows(cycle, key).forEach(([name, value]) => row(name, value))
  }}
  const resistance = resistanceResults(cycle)
  if([resistance.pushUps,resistance.plankSeconds,resistance.abdominalReps].some(hasValue)){title('Resistência de força',62);row('Flexões até a falha', resistance.pushUps);row('Prancha até a falha (segundos)', resistance.plankSeconds);row('Abdominal em 1 minuto', resistance.abdominalReps)}
  const cardio=cycle.enduranceTest||{}
  if([cardio.modality,cardio.distanceMeters,cardio.vamKmh,cardio.vo2Max].some(hasValue)){title('Teste cardiorrespiratório',78);row('Modalidade', cardio.modality);row('Distância percorrida (metros)', cardio.distanceMeters);row('VAM (km/h)', cardio.vamKmh);row('VO2 máximo (mL/kg/min)', cardio.vo2Max)}
  if(previous){
    title('Avaliação anterior x atual')
    row('Ciclos', `${cycleLabel(previous)} -> ${cycleLabel(cycle)}`)
    row('Evolução', 'Diferença e percentual calculados sobre o 1RM anterior.')
    for (const [key, label] of strengthExercises) {
      title(label)
      strengthRows(cycle, key, previous).forEach(([name, value]) => row(name, value))
    }
    title('Medidas corporais - comparação')
    Object.entries(labels).filter(([key])=>cycle.bodyAssessment&&key in cycle.bodyAssessment).forEach(([key,label])=>row(label,`${safe(previous.bodyAssessment?.[key])} -> ${safe(cycle.bodyAssessment?.[key])}`))
    const previousResistance = resistanceResults(previous)
    title('Resistência de força - comparação')
    ;[['pushUps','Flexões'],['plankSeconds','Prancha (s)'],['abdominalReps','Abdominal']].forEach(([key,label])=>row(label,`${safe(previousResistance[key])} -> ${safe(resistance[key])}`))
    row('VAM (km/h)', `${safe(previous.enduranceTest?.vamKmh)} -> ${safe(cycle.enduranceTest?.vamKmh)}`)
  }
  if(Object.values(cycle.anamnesis||{}).some(hasValue)){title(professional?'Anamnese - acesso profissional':'Minha anamnese');Object.entries(cycle.anamnesis).forEach(([key,value])=>{if(hasValue(value))row(anamnesisLabels[key]||key,value)})}
  if(professional)evolutionSection()
  if(previous)await photosSection(previous.photos,'Fotos anteriores - comparação')
  await photosSection(cycle.photos,cycle.sequence?'Fotos atuais - reavaliação':'Fotos da avaliação postural')
  let logoData=null
  if(settings?.logo?.startsWith?.('data:image/')){try{const bytes=Uint8Array.from(atob(settings.logo.split(',')[1]),character=>character.charCodeAt(0)),logo=settings.logo.includes('png')?await pdf.embedPng(bytes):await pdf.embedJpg(bytes);logoData={logo,dimensions:logo.scaleToFit(112,42)}}catch(error){}}
  const pages=pdf.getPages();pages.forEach((item,index)=>{item.drawRectangle({x:0,y:765,width:595.28,height:77,color:rgb(.09,.15,.28)});item.drawText('BRUNA AFFONSO',{x:44,y:807,size:17,font:bold,color:rgb(1,1,1)});item.drawText(professional?'Relatório profissional de avaliação':'Meu relatório de evolução',{x:44,y:789,size:9,font:regular,color:rgb(.86,.89,1)});if(logoData){const frameX=431,frameY=782;item.drawRectangle({x:frameX,y:frameY,width:120,height:48,color:rgb(1,1,1)});item.drawImage(logoData.logo,{x:frameX+(120-logoData.dimensions.width)/2,y:frameY+(48-logoData.dimensions.height)/2,width:logoData.dimensions.width,height:logoData.dimensions.height})}item.drawText(`Documento privado - página ${index+1} de ${pages.length}`,{x:44,y:24,size:8,font:regular,color:rgb(.44,.48,.55)})})
  const bytes=await pdf.save(),blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${cycle.sequence?`reavaliacao-${cycle.sequence}`:'avaliacao-inicial'}-${safe(student?.name||'aluna').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-')}.pdf`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
