import { useMemo, useState } from 'react'
import { useStore } from '../storeContext'
import type { Exercise } from '../types'
import { ExerciseImage } from './ExerciseImage'
import { Modal } from './Modal'

type Props = { title?: string; onPick: (ex: Exercise) => void; onClose: () => void }

export function ExercisePicker({ title = 'Add exercise', onPick, onClose }: Props) {
  const { state } = useStore()
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return [...state.exercises]
      .filter((e) => !needle || e.name.toLowerCase().includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [state.exercises, q])

  return (
    <Modal title={title} onClose={onClose}>
      <input className="search" placeholder="Search exercises" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      <ul className="ex-list">
        {list.map((ex) => (
          <li key={ex.id}>
            <button className="ex-row" onClick={() => onPick(ex)}>
              <ExerciseImage exercise={ex} size="thumb" />
              <span className="ex-row-text">
                <strong>{ex.name}</strong>
                <span className="muted">{ex.measure === 'time' ? 'Timed' : 'Reps'}{ex.weighted ? ' · dumbbell' : ''}</span>
              </span>
            </button>
          </li>
        ))}
        {!list.length && <li className="muted pad">No exercises match.</li>}
      </ul>
    </Modal>
  )
}
