import { build } from 'esbuild'
import { rm } from 'node:fs/promises'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PDFDocument, PDFPage } from 'pdf-lib'

const files = ['tests/strength-component.tmp.mjs', 'tests/strength-pdf.tmp.mjs']
const config = { bundle:true, platform:'node', format:'esm', packages:'external', loader:{'.css':'empty'}, define:{'import.meta.env':'{}'} }
try {
  await build({...config,entryPoints:['src/components/StrengthResults.jsx'],outfile:files[0]})
  await build({...config,entryPoints:['src/utils/assessmentPdf.js'],outfile:files[1]})
  globalThis.localStorage = { getItem:()=>null, removeItem:()=>{} }
  const { default: StrengthResults, ExerciseResult } = await import('./strength-component.tmp.mjs')
  const { generateAssessmentPdf } = await import('./strength-pdf.tmp.mjs')
  const beforeResult = {estimatedOneRm:60,bodyWeightKg:60,relativeStrength:1,classification:'Bom'}
  const currentResult = {estimatedOneRm:72,bodyWeightKg:72,relativeStrength:1,classification:'Bom'}
  // Deliberately contradictory raw inputs: rendering and PDF must follow the saved API results.
  const previous = {id:'initial',sequence:0,bodyAssessment:{weightKg:600},strengthTest:{smithSquat:{loadKg:450,repetitions:10}},strengthResults:{exercises:{smithSquat:beforeResult}},enduranceTest:{pushUps:8},photos:[],stageStatuses:{}}
  const cycle = {...previous,id:'current',sequence:1,bodyAssessment:{weightKg:720},strengthTest:{smithSquat:{loadKg:540,repetitions:10},pushUps:0,plankSeconds:30,abdominalReps:15},strengthResults:{exercises:{smithSquat:currentResult}},strengthComparison:{referenceCycleId:'initial',currentCycleId:'current',exercises:{smithSquat:{previous:beforeResult,current:currentResult,differenceKg:12,evolutionPercent:20}}},enduranceTest:{pushUps:99,plankSeconds:99,abdominalReps:99},startedAt:'2026-09-01',deadlineAt:'2026-09-08',progress:100}
  const html = renderToStaticMarkup(React.createElement(StrengthResults,{cycle,previous,comparison:true}))
  for (const text of ['Avaliação anterior × atual','60,00 kg','72,00 kg','1,00x','Bom','+12,00 kg','+20,00%','Entenda sua classificação']) assert.ok(html.includes(text),text)
  for (const exercise of ['closeGripPulldown','seatedDumbbellPress']) {
    const item = renderToStaticMarkup(React.createElement(ExerciseResult,{cycle,exercise}))
    assert.ok(item.includes('1RM estimado'))
    assert.ok(!/<dt>Resultado|Força relativa|Fraco|Bom|Excelente/.test(item))
  }
  const drawn = []
  const original = PDFPage.prototype.drawText
  let blob, clicked = false
  PDFPage.prototype.drawText = function(text, options) { drawn.push(text); return original.call(this,text,options) }
  globalThis.URL.createObjectURL = value => { blob=value; return 'blob:test' }
  globalThis.URL.revokeObjectURL = () => {}
  globalThis.document = {createElement:()=>({click(){clicked=true}})}
  try {
    await generateAssessmentPdf({cycle,previous,student:{name:'Aluna Teste'},settings:{},professional:true})
  } finally { PDFPage.prototype.drawText = original }
  assert.ok(clicked)
  assert.ok((await PDFDocument.load(await blob.arrayBuffer())).getPageCount()>0)
  const text = drawn.join('\n')
  for (const expected of ['1RM estimado: 72,00 kg','Força relativa: 1,00x','Resultado: Bom','+12,00 kg','+20,00%','Flexões até a falha: 0','Prancha até a falha (segundos): 30','Abdominal em 1 minuto: 15','Flexões: 8 -> 0']) assert.ok(text.includes(expected),expected)
  assert.ok(!text.includes('99'))
  console.log('PASS: componentes compartilhados e PDF real com comparação e resistência atual/legada')
} finally { await Promise.all(files.map(path=>rm(path,{force:true}))) }
