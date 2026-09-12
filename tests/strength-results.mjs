import assert from 'node:assert/strict'
import { classifyStrength, strengthResult, strengthEvolution, strengthRows, resistanceResults, previousCycle } from '../src/utils/strengthResults.js'
import { assessmentPhotoViews } from '../src/utils/assessmentPhotos.js'

for (const [ratio, expected] of [[0.74,null],[0.75,'Fraco'],[0.9999,'Fraco'],[1,'Bom'],[1.2,'Bom'],[1.20001,null],[1.24999,null],[1.25,'Excelente'],[2,'Excelente']]) {
  assert.equal(classifyStrength('smithSquat', ratio), expected, `Smith ${ratio}`)
}
for (const [ratio, expected] of [[0.99,null],[1,'Fraco'],[1.24999,'Fraco'],[1.25,'Bom'],[1.49999,'Bom'],[1.5,'Excelente']]) {
  assert.equal(classifyStrength('deadlift', ratio), expected, `Terra ${ratio}`)
}
for (const key of ['closeGripPulldown','seatedDumbbellPress']) assert.equal(classifyStrength(key, 2), null)
const cycle = (load, weight = 60) => ({bodyAssessment:{weightKg:weight},strengthTest:{smithSquat:{loadKg:load,repetitions:10,estimatedOneRm:999}}})
const before = cycle(45), current = cycle(54,72)
assert.equal(strengthResult(before,'smithSquat').oneRm,60)
assert.equal(strengthResult(before,'smithSquat').result,'Bom')
assert.equal(strengthResult(current,'smithSquat').relative,1)
assert.deepEqual(strengthEvolution(strengthResult(before,'smithSquat'),strengthResult(current,'smithSquat')),{kg:12,percent:20})
assert.equal(strengthEvolution(strengthResult(current,'smithSquat'),strengthResult(before,'smithSquat')).kg,-12)
for (const invalid of [undefined,null,'',' ',0,-1,'abc',Infinity,NaN,true]) {
  assert.equal(strengthResult({...cycle(45),bodyAssessment:{weightKg:invalid}},'smithSquat').relative,null)
  assert.equal(strengthResult(cycle(invalid),'smithSquat').oneRm,null)
}
assert.equal(strengthResult(cycle('45','60'),'smithSquat').oneRm,60)
assert.deepEqual(strengthEvolution({oneRm:null},{oneRm:60}),{kg:null,percent:null})
assert.equal(strengthEvolution({oneRm:0},{oneRm:60}).percent,null)
assert.equal(strengthRows(before,'closeGripPulldown').length,1)
assert.equal(strengthRows(current,'smithSquat',before).find(([name])=>name==='Evolução do 1RM')[1],'+20,00%')
assert.deepEqual(resistanceResults({strengthTest:{pushUps:0,plankSeconds:30},enduranceTest:{pushUps:9,plankSeconds:10,abdominalReps:12}}),{pushUps:0,plankSeconds:30,abdominalReps:12})
assert.equal(previousCycle([{sequence:2},{sequence:0},{sequence:1}],{sequence:2}).sequence,1)
assert.equal(assessmentPhotoViews.length,23)
assert.equal(new Set(assessmentPhotoViews.map(([key])=>key)).size,23)
console.log('PASS: Epley, limites, lacunas, peso de cada ciclo, evolução, dados inválidos, resistência e 23 fotos')
