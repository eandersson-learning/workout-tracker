export type Figure = { caption: string; svg: string }

export type Exercise = {
  id: string
  name: string
  /** One-line form cue shown under the image. */
  cue: string
  /** Built-in stick-figure illustrations (start / finish). */
  figures?: Figure[]
  /** Custom image or GIF: a URL or a data: URL from an upload. */
  imageUrl?: string
  /** Whether sets are measured in reps or seconds. */
  measure: 'reps' | 'time'
  /** Whether the movement takes a dumbbell (shows the weight picker). */
  weighted: boolean
  custom?: boolean
}

/** What a template asks for on each set. `max` is omitted for a fixed target. */
export type Target =
  | { kind: 'reps'; min: number; max?: number }
  | { kind: 'time'; min: number; max?: number }
  | { kind: 'failure' }

export type TemplateItem = {
  exerciseId: string
  sets: number
  target: Target
  /** Reps or seconds are counted per side (e.g. "12 / side"). */
  perSide?: boolean
  note?: string
}

/**
 * A group of exercises. With `rounds` > 1 the block is a circuit: each round
 * runs through every item once, in order.
 */
export type TemplateBlock = {
  name: string
  rounds: number
  items: TemplateItem[]
}

export type Template = {
  id: string
  name: string
  notes?: string
  blocks: TemplateBlock[]
  builtIn?: boolean
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export type SetLog = {
  round: number
  reps?: number
  seconds?: number
  /** Pounds; undefined means bodyweight / no dumbbell. */
  weight?: number
  done: boolean
  /** How the set felt; sets the starting weight next time (unrated counts as medium). */
  rating?: Difficulty
}

export type WorkoutEntry = {
  id: string
  blockIndex: number
  exerciseId: string
  target?: Target
  perSide?: boolean
  note?: string
  sets: SetLog[]
}

export type WorkoutBlock = { name: string; rounds: number }

export type Workout = {
  id: string
  name: string
  templateId?: string
  startedAt: number
  finishedAt?: number
  notes?: string
  blocks: WorkoutBlock[]
  entries: WorkoutEntry[]
  /** When the last set was ticked off; drives the rest timer. */
  restStartedAt?: number
}

export type AppState = {
  version: 1
  exercises: Exercise[]
  templates: Template[]
  workouts: Workout[]
  activeWorkoutId?: string
}
