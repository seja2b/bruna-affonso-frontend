import { build } from 'esbuild'
import { readFile, rm } from 'node:fs/promises'
import assert from 'node:assert/strict'
await build({entryPoints:['src/pages/admin/AdminAssessments.jsx'],bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},define:{'import.meta.env':'{}'},outfile:'tests/assessment-render.tmp.mjs'})
try {
 globalThis.localStorage={getItem:()=>null,removeItem:()=>{}}
 const {Data,stageNames}=await import('./assessment-render.tmp.mjs')
 const React=await import('react');const {renderToStaticMarkup}=await import('react-dom/server')
 const html=renderToStaticMarkup(React.createElement(Data,{title:'Teste de força',data:{smithSquat:{loadKg:70,repetitions:10,estimatedOneRm:93.33},deadlift:{loadKg:null,repetitions:null,estimatedOneRm:null},pushUps:0}}))
 for(const label of ['Agachamento no Smith','Carga (kg)','Repetições','93,33','Não informado','>0<'])assert.ok(html.includes(label),label)
 assert.ok(!html.includes('smithSquat'));assert.ok(!html.includes('<pre>'));assert.equal(stageNames.STRENGTH,'Teste físico')
 assert.ok(renderToStaticMarkup(React.createElement(Data,{title:'Anamnese',data:{}})).includes('Nenhuma informação registrada.'))
 const profile=await readFile('src/pages/admin/AdminStudentDetail.jsx','utf8');assert.ok(!profile.includes('JSON.stringify'));assert.ok(profile.includes('<StrengthResults cycle={cycle}'));assert.ok(profile.includes('data={resistanceResults(cycle)}'));assert.ok(profile.includes('assessmentPhotoViews.length'))
 console.log('PASS: dados de força, valores vazios, zero, rótulos e perfil sem JSON')
} finally {await rm('tests/assessment-render.tmp.mjs',{force:true})}
