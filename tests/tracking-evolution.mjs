import assert from 'node:assert/strict'
import { buildExerciseEvolution, evolutionSummary, normalizeExerciseName, parseExerciseWeight } from '../src/utils/trackingEvolution.js'

assert.equal(normalizeExerciseName('  Agachamento no Smith '), 'agachamento no smith')
assert.equal(normalizeExerciseName('Elevação Pélvica'), 'elevacao pelvica')
assert.equal(parseExerciseWeight('32,5 kg'), 32.5)
assert.equal(parseExerciseWeight('sem carga'), null)

const groups = buildExerciseEvolution([
  { weekNumber: 1, exercises: [{ exerciseName: 'Elevação Pélvica', weight: '20', reps: '12' }] },
  { weekNumber: 2, exercises: [{ exerciseName: 'elevacao   pelvica', weight: '25 kg', reps: '10' }, { exerciseName: 'Elevação pélvica', weight: '22', reps: '12' }] },
  { weekNumber: 4, exercises: [{ exerciseName: 'Elevação Pélvica', weight: '30,5', reps: '8' }] }
])

assert.equal(groups.length, 1)
assert.deepEqual(groups[0].points.map(point => point.weight), [20, 25, null, 30.5, null, null])
assert.deepEqual(evolutionSummary(groups[0].points), { initial: 20, current: 30.5, peak: 30.5, change: 10.5, percentage: 52.5 })
console.log('PASS: normalização, cargas decimais, semanas vazias e resumo da evolução')
