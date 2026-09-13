export const strengthExercises = [
  ['smithSquat', 'Agachamento no Smith'],
  ['closeGripPulldown', 'Puxador Fechado'],
  ['seatedDumbbellPress', 'Desenvolvimento com Halteres Sentado'],
  ['deadlift', 'Levantamento Terra']
]

// Approved intervals only. Uncovered values remain unclassified.
// Adjust these bounds when the professional defines the Smith 1.20–1.25 gap.
export const strengthRanges = {
  smithSquat: [
    { min: 0.75, max: 1, label: 'Fraco' },
    { min: 1, max: 1.2, inclusiveMax: true, label: 'Bom' },
    { min: 1.25, max: Infinity, label: 'Excelente' }
  ],
  deadlift: [
    { min: 1, max: 1.25, label: 'Fraco' },
    { min: 1.25, max: 1.5, label: 'Bom' },
    { min: 1.5, max: Infinity, label: 'Excelente' }
  ]
}

export const classificationExplanation = 'A classificação representa apenas o resultado de força deste teste e exercício. Não define o nível geral da aluna.'

function positive(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  if (typeof value === 'string' && !value.trim()) return null
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

export function classifyStrength(key, relative) {
  if (!Number.isFinite(relative)) return null
  return strengthRanges[key]?.find(({ min, max, inclusiveMax }) =>
    relative >= min && (inclusiveMax ? relative <= max : relative < max)
  )?.label || null
}

export function previewStrengthResult(cycle, key) {
  const item = cycle?.strengthTest?.[key]
  const rawLoad = positive(item?.loadKg)
  const rawRepetitions = positive(item?.repetitions)
  const load = !item?.notPerformed && rawLoad <= 1000 ? rawLoad : null
  const repetitions = Number.isInteger(rawRepetitions) && rawRepetitions <= 100 ? rawRepetitions : null
  // Recompute from source inputs, never from a rounded/stale stored estimate.
  const estimate = load !== null && repetitions !== null ? load * (1 + repetitions / 30) : null
  const oneRm = Number.isFinite(estimate) ? estimate : null
  const rawWeight = positive(cycle?.bodyAssessment?.weightKg)
  const weight = rawWeight <= 500 ? rawWeight : null
  const relative = strengthRanges[key] && oneRm !== null && weight !== null ? oneRm / weight : null
  return { oneRm, weight, relative: Number.isFinite(relative) ? relative : null,
    classified: Boolean(strengthRanges[key]), result: classifyStrength(key, relative),
    notPerformed: item?.notPerformed === true, notPerformedReason: item?.notPerformedReason || null }
}

const finite = value => typeof value === 'number' && Number.isFinite(value) ? value : null
function serverResult(item, key) {
  const classified = Boolean(strengthRanges[key])
  return {
    oneRm: finite(item?.estimatedOneRm), weight: finite(item?.bodyWeightKg),
    relative: classified ? finite(item?.relativeStrength) : null, classified,
    result: classified ? item?.classification || null : null,
    reason: item?.classificationReason || item?.resultReason || (item ? null : 'RESULT_UNAVAILABLE'),
    notPerformed: item?.notPerformed === true, notPerformedReason: item?.notPerformedReason || null
  }
}

// Saved results (including PDFs) always come from the API. Local calculation is preview-only.
export function strengthResult(cycle, key) {
  return cycle?.strengthPreview === true ? previewStrengthResult(cycle, key)
    : serverResult(cycle?.strengthResults?.exercises?.[key], key)
}

export function strengthEvolution(previous, current) {
  if (previous.oneRm === null || current.oneRm === null) return { kg: null, percent: null }
  const kg = current.oneRm - previous.oneRm
  return { kg, percent: previous.oneRm > 0 ? kg / previous.oneRm * 100 : null }
}

export function formatStrength(value, unit = '', signed = false) {
  if (!Number.isFinite(value)) return 'Não disponível'
  const rounded = Number(value.toFixed(3))
  return `${signed && rounded > 0 ? '+' : ''}${rounded.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}${unit}`
}

export function resultLabel(result) {
  if (result.notPerformed) return 'Não realizado'
  if (result.reason === 'MISSING_OR_INVALID_BODY_WEIGHT') return 'Peso corporal não informado ou inválido'
  if (result.reason === 'MISSING_OR_INVALID_INPUT') return 'Carga ou repetições não informadas ou inválidas'
  if (result.reason === 'RESULT_UNAVAILABLE') return 'Resultado indisponível'
  if (['UNDEFINED_RANGE', 'BELOW_DEFINED_RANGE'].includes(result.reason)) return 'Faixa ainda não definida'
  return result.result || (result.relative === null ? 'Dados insuficientes' : 'Faixa ainda não definida')
}

export function cycleLabel(cycle) {
  return cycle?.sequence ? `Reavaliação ${cycle.sequence}` : 'Avaliação inicial'
}

export function previousCycle(cycles, current) {
  return cycles.filter(item => Number(item.sequence) < Number(current?.sequence))
    .sort((a, b) => Number(b.sequence) - Number(a.sequence))[0]
}

// Current strength fields take precedence; retain older cycles, including zero.
export function resistanceResults(cycle) {
  return Object.fromEntries(['pushUps', 'plankSeconds', 'abdominalReps'].map(key =>
    [key, cycle?.strengthTest?.[key] ?? cycle?.enduranceTest?.[key]]))
}

export function strengthInputs(cycle) {
  return Object.fromEntries(strengthExercises.filter(([key]) => cycle?.strengthTest?.[key])
    .map(([key]) => [key, cycle.strengthTest[key].notPerformed === true
      ? { realizado: 'Não', motivo: cycle.strengthTest[key].notPerformedReason || 'Não informado' }
      : { loadKg: cycle.strengthTest[key].loadKg, repetitions: cycle.strengthTest[key].repetitions }]))
}

// Shared presentation data keeps the student, admin and PDF results identical.
export function strengthRows(cycle, key, previous) {
  const comparison = cycle?.strengthComparison
  const savedPair = !cycle?.strengthPreview && previous && comparison?.referenceCycleId === previous.id && comparison?.currentCycleId === cycle.id
    ? comparison.exercises?.[key] : null
  const current = savedPair ? serverResult(savedPair.current, key) : strengthResult(cycle, key)
  const before = previous ? savedPair ? serverResult(savedPair.previous, key) : strengthResult(previous, key) : null
  const metric = (label, field, unit) => [label, before
    ? `${formatStrength(before[field], unit)} → ${formatStrength(current[field], unit)}`
    : formatStrength(current[field], unit)]
  const rows = [metric('1RM estimado', 'oneRm', ' kg')]
  if (current.notPerformed) rows.push(['Realização', 'Não realizado'], ['Motivo', current.notPerformedReason || 'Não informado'])
  if (current.classified) {
    rows.push(metric('Peso corporal', 'weight', ' kg'), metric('Força relativa', 'relative', 'x'))
    rows.push(['Resultado', before ? `${resultLabel(before)} → ${resultLabel(current)}` : resultLabel(current)])
  }
  if (before) {
    const evolution = cycle?.strengthPreview ? strengthEvolution(before, current)
      : { kg: finite(savedPair?.differenceKg), percent: finite(savedPair?.evolutionPercent) }
    rows.push(['Diferença de 1RM', formatStrength(evolution.kg, ' kg', true)],
      ['Evolução do 1RM', formatStrength(evolution.percent, '%', true)])
  }
  return rows
}
