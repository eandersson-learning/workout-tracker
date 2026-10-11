import type { Target } from './types'

export function formatSeconds(s: number): string {
  if (s < 60) return `${s} sec`
  const m = Math.floor(s / 60)
  const r = s % 60
  return r ? `${m}:${String(r).padStart(2, '0')} min` : `${m} min`
}

function range(min: number, max?: number) {
  return max && max !== min ? `${min}–${max}` : `${min}`
}

export function formatTarget(target: Target | undefined, perSide?: boolean): string {
  if (!target) return ''
  const side = perSide ? ' / side' : ''
  switch (target.kind) {
    case 'reps':
      return `${range(target.min, target.max)}${side}`
    case 'time':
      return target.max && target.max !== target.min
        ? `${target.min}–${target.max} sec${side}`
        : `${formatSeconds(target.min)}${side}`
    case 'failure':
      return `hold to failure${side}`
  }
}

export function formatPrescription(sets: number, target: Target, perSide?: boolean): string {
  return `${sets} × ${formatTarget(target, perSide)}`
}

export function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatDuration(ms: number): string {
  const min = Math.round(ms / 60000)
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}
