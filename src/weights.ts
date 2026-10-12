/** PowerBlock Sport adjusts from 3 to 24 lb in 3 lb steps. */
export const POWERBLOCK_WEIGHTS = [3, 6, 9, 12, 15, 18, 21, 24] as const

const MIN = POWERBLOCK_WEIGHTS[0]
const MAX = POWERBLOCK_WEIGHTS[POWERBLOCK_WEIGHTS.length - 1]

/** Moves a weight by `notches` 3 lb steps, staying within the PowerBlock range. */
export function stepWeight(weight: number, notches: number): number {
  return Math.min(MAX, Math.max(MIN, weight + notches * 3))
}
