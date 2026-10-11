import { uid } from './format'
import type { AppState, Exercise, SetLog, Template, Target, Workout, WorkoutEntry } from './types'

/** Most recent weight used for an exercise in a finished workout. */
export function lastWeight(state: AppState, exerciseId: string): number | undefined {
  const done = state.workouts
    .filter((w) => w.finishedAt)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
  for (const w of done) {
    for (const e of w.entries) {
      if (e.exerciseId !== exerciseId) continue
      const s = [...e.sets].reverse().find((s) => s.done && s.weight !== undefined)
      if (s) return s.weight
    }
  }
  return undefined
}

function blankSet(round: number, weight: number | undefined): SetLog {
  return { round, weight, done: false }
}

export function workoutFromTemplate(state: AppState, template: Template): Workout {
  const entries: WorkoutEntry[] = []
  template.blocks.forEach((block, blockIndex) => {
    for (const item of block.items) {
      const ex = state.exercises.find((e) => e.id === item.exerciseId)
      const weight = ex?.weighted ? lastWeight(state, item.exerciseId) : undefined
      const sets: SetLog[] = []
      for (let r = 1; r <= Math.max(1, block.rounds); r++) {
        for (let s = 0; s < item.sets; s++) sets.push(blankSet(block.rounds > 1 ? r : sets.length + 1, weight))
      }
      entries.push({
        id: uid(),
        blockIndex,
        exerciseId: item.exerciseId,
        target: item.target,
        perSide: item.perSide,
        note: item.note,
        sets,
      })
    }
  })
  return {
    id: uid(),
    name: template.name,
    templateId: template.id,
    startedAt: Date.now(),
    notes: template.notes,
    blocks: template.blocks.map((b) => ({ name: b.name, rounds: Math.max(1, b.rounds) })),
    entries,
  }
}

export function emptyWorkout(): Workout {
  return {
    id: uid(),
    name: 'Workout',
    startedAt: Date.now(),
    blocks: [{ name: 'Exercises', rounds: 1 }],
    entries: [],
  }
}

export function entryForExercise(state: AppState, ex: Exercise, blockIndex: number): WorkoutEntry {
  const weight = ex.weighted ? lastWeight(state, ex.id) : undefined
  const target: Target = ex.measure === 'time' ? { kind: 'time', min: 30 } : { kind: 'reps', min: 10 }
  return { id: uid(), blockIndex, exerciseId: ex.id, target, sets: [1, 2, 3].map((r) => blankSet(r, weight)) }
}

/** Value to fill in when a set is ticked off without typing anything. */
export function defaultValue(target: Target | undefined): number | undefined {
  if (!target || target.kind === 'failure') return undefined
  return target.max ?? target.min
}

export function completedSets(w: Workout): number {
  return w.entries.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0)
}

export function totalSets(w: Workout): number {
  return w.entries.reduce((n, e) => n + e.sets.length, 0)
}
