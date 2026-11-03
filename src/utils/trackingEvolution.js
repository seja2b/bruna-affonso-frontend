export function normalizeExerciseName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function parseExerciseWeight(value) {
  const match = String(value || '').replace(',', '.').match(/\d+(?:\.\d+)?/)
  if (!match) return null
  const number = Number(match[0])
  return Number.isFinite(number) ? number : null
}

export function buildExerciseEvolution(weeks) {
  const groups = new Map()
  const sortedWeeks = [...(weeks || [])].sort((a, b) => (a.weekNumber || 0) - (b.weekNumber || 0))

  for (const week of sortedWeeks) {
    for (const exercise of week.exercises || []) {
      const key = normalizeExerciseName(exercise.exerciseName)
      const weight = parseExerciseWeight(exercise.weight)
      if (!key || weight === null) continue
      if (!groups.has(key)) groups.set(key, { key, label: exercise.exerciseName.trim(), values: new Map() })
      const group = groups.get(key)
      group.label = exercise.exerciseName.trim() || group.label
      const current = group.values.get(week.weekNumber)
      if (!current || weight > current.weight) group.values.set(week.weekNumber, { weight, reps: exercise.reps || '' })
    }
  }

  return [...groups.values()]
    .map(group => ({
      key: group.key,
      label: group.label,
      points: Array.from({ length: 6 }, (_, index) => {
        const weekNumber = index + 1
        const value = group.values.get(weekNumber)
        return { weekNumber, weight: value?.weight ?? null, reps: value?.reps || '' }
      })
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

export function evolutionSummary(points) {
  const recorded = (points || []).filter(point => point.weight !== null)
  if (!recorded.length) return null
  const initial = recorded[0].weight
  const current = recorded[recorded.length - 1].weight
  const change = current - initial
  return {
    initial,
    current,
    peak: Math.max(...recorded.map(point => point.weight)),
    change,
    percentage: initial > 0 ? (change / initial) * 100 : null
  }
}
