import assert from 'node:assert/strict'
import { strengthResult, strengthRows, resultLabel, strengthInputs } from '../src/utils/strengthResults.js'

const initial = { id: 'initial', sequence: 0 }
const raw = { id: 'current', sequence: 1, bodyAssessment: { weightKg: 60 }, strengthTest: { smithSquat: { loadKg: 45, repetitions: 10 } } }
assert.equal(strengthResult(raw, 'smithSquat').oneRm, null, 'Never silently recalculate saved results')
assert.equal(strengthResult({ ...raw, strengthPreview: true }, 'smithSquat').oneRm, 60)
const saved = { ...raw, strengthResults: { exercises: { smithSquat: { estimatedOneRm: 80, bodyWeightKg: 100, relativeStrength: 0.8, classification: 'Fraco' } } } }
assert.equal(strengthResult(saved, 'smithSquat').oneRm, 80)
assert.equal(strengthResult(saved, 'smithSquat').weight, 100)
assert.equal(strengthResult(saved, 'smithSquat').relative, 0.8)
assert.equal(resultLabel(strengthResult(saved, 'smithSquat')), 'Fraco')
const historic = { ...saved.strengthResults.exercises.smithSquat, bodyWeightKg: null, relativeStrength: null, classification: null, classificationReason: 'MISSING_OR_INVALID_BODY_WEIGHT' }
saved.strengthComparison = { referenceCycleId: initial.id, currentCycleId: saved.id, exercises: { smithSquat: { previous: historic, current: saved.strengthResults.exercises.smithSquat, differenceKg: -10, evolutionPercent: -11.111 } } }
const rows = strengthRows(saved, 'smithSquat', initial)
assert.equal(rows.find(([label]) => label === 'Diferença de 1RM')[1], '-10,00 kg')
assert.equal(rows.find(([label]) => label === 'Evolução do 1RM')[1], '-11,111%')
assert.ok(rows.find(([label]) => label === 'Peso corporal')[1].startsWith('Não disponível'))
assert.ok(rows.find(([label]) => label === 'Resultado')[1].includes('Peso corporal não informado'))
assert.equal(strengthRows(saved, 'smithSquat', { id: 'different' }).find(([label]) => label === 'Diferença de 1RM')[1], 'Não disponível')
for (const classificationReason of ['UNDEFINED_RANGE', 'BELOW_DEFINED_RANGE']) assert.equal(resultLabel({ result: null, reason: classificationReason }), 'Faixa ainda não definida')
const skipped = { strengthTest: { deadlift: { notPerformed: true, notPerformedReason: 'Orientação profissional' } }, strengthResults: { exercises: { deadlift: { estimatedOneRm: null, notPerformed: true, notPerformedReason: 'Orientação profissional', classificationReason: 'NOT_PERFORMED' } } } }
assert.equal(resultLabel(strengthResult(skipped, 'deadlift')), 'Não realizado')
assert.ok(strengthRows(skipped, 'deadlift').some(([name, value]) => name === 'Motivo' && value === 'Orientação profissional'))
assert.deepEqual(strengthInputs(skipped).deadlift, { realizado: 'Não', motivo: 'Orientação profissional' })
const preview = { ...raw, strengthPreview: true, strengthTest: { smithSquat: { loadKg: 45, repetitions: 1.5 } } }
assert.equal(strengthResult(preview, 'smithSquat').oneRm, null)
console.log('PASS: resultados autoritativos, prévia explícita, comparação da API, peso ausente e exercício não realizado')
