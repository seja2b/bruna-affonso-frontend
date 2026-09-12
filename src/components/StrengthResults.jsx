import React from 'react'
import { classificationExplanation, cycleLabel, strengthExercises, strengthRows } from '../utils/strengthResults'
import './StrengthResults.css'

export function StrengthExplanation() {
  return <details className="strength-explanation"><summary>Entenda sua classificação</summary>
    <p>{classificationExplanation}</p>
    <p>A força relativa usa o peso corporal registrado na avaliação correspondente. Faixas sem definição permanecem sem classificação; dados ausentes não são tratados como zero.</p>
  </details>
}

export function ExerciseResult({ cycle, exercise }) {
  return <dl className="strength-metrics">{strengthRows(cycle, exercise).map(([label, value]) =>
    <div key={label}><dt>{label}{label === 'Resultado' ? ':' : ''}</dt><dd>{value}</dd></div>
  )}</dl>
}

export default function StrengthResults({ cycle, previous, comparison = false }) {
  return <section className="strength-results">
    <h4>{comparison ? 'Avaliação anterior × atual — teste de força' : 'Resultados do teste de força'}</h4>
    {comparison && (previous ? <p>{cycleLabel(previous)} → {cycleLabel(cycle)}. Evolução calculada sobre o 1RM anterior, com o peso de cada avaliação.</p>
      : <p>Avaliação anterior indisponível para comparação.</p>)}
    <div className="strength-result-grid">{strengthExercises.map(([key, label]) =>
      <article className="strength-result-card" key={key}><h5>{label}</h5>
        <dl className="strength-metrics">{strengthRows(cycle, key, comparison ? previous : null).map(([name, value]) =>
          <div key={name}><dt>{name}{name === 'Resultado' ? ':' : ''}</dt><dd>{value}</dd></div>
        )}</dl>
      </article>
    )}</div>
    <StrengthExplanation />
  </section>
}
