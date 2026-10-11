import { useState } from 'react'
import { useNow } from '../useNow'

type Props = { onStop: (seconds: number) => void; target?: number }

/** Stopwatch for timed holds and carries; reports elapsed seconds on stop. */
export function Timer({ onStop, target }: Props) {
  const [start, setStart] = useState<number | null>(null)
  const now = useNow(250, start !== null)

  if (start === null) {
    return (
      <button className="timer-btn" onClick={() => setStart(Date.now())} aria-label="Start timer">
        ▶
      </button>
    )
  }
  const elapsed = Math.max(0, Math.floor((now - start) / 1000))
  const reached = target !== undefined && elapsed >= target
  return (
    <button
      className={`timer-btn running${reached ? ' reached' : ''}`}
      onClick={() => {
        setStart(null)
        onStop(Math.floor((Date.now() - start) / 1000))
      }}
      aria-label="Stop timer"
    >
      {elapsed}s ■
    </button>
  )
}
