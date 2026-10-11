import { useState } from 'react'
import { Modal } from '../components/Modal'
import { formatDate, formatDuration } from '../format'
import { useStore } from '../storeContext'
import type { SetLog, Workout } from '../types'
import { completedSets } from '../workout'

function describeSet(s: SetLog, perSide?: boolean): string {
  const amount = s.reps !== undefined ? `${s.reps}` : s.seconds !== undefined ? `${s.seconds}s` : '—'
  return `${amount}${perSide ? '/side' : ''}${s.weight ? ` @ ${s.weight} lb` : ''}`
}

export function History() {
  const { state, update } = useStore()
  const [open, setOpen] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Workout | null>(null)
  const done = state.workouts.filter((w) => w.finishedAt).sort((a, b) => b.startedAt - a.startedAt)
  const name = (id: string) => state.exercises.find((e) => e.id === id)?.name ?? 'Unknown exercise'

  return (
    <div>
      <div className="page-head">
        <h1>History</h1>
      </div>
      {!done.length && <p className="muted">Finished workouts show up here.</p>}
      <ul className="cards">
        {done.map((w) => {
          const expanded = open === w.id
          return (
            <li key={w.id} className="card">
              <button className="template-summary" onClick={() => setOpen(expanded ? null : w.id)} aria-expanded={expanded}>
                <strong>{w.name}</strong>
                <span className="muted">
                  {formatDate(w.startedAt)} · {formatDuration((w.finishedAt ?? w.startedAt) - w.startedAt)} · {completedSets(w)} sets
                </span>
              </button>
              {expanded && (
                <div className="template-detail">
                  <ul className="plain">
                    {w.entries
                      .filter((e) => e.sets.some((s) => s.done))
                      .map((e) => (
                        <li key={e.id}>
                          <span>{name(e.exerciseId)}</span>
                          <span className="muted">
                            {e.sets
                              .filter((s) => s.done)
                              .map((s) => describeSet(s, e.perSide))
                              .join(', ')}
                          </span>
                        </li>
                      ))}
                  </ul>
                  <button className="link-btn danger-text" onClick={() => setDeleting(w)}>
                    Delete workout
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {deleting && (
        <Modal
          title="Delete this workout?"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <button className="btn" onClick={() => setDeleting(null)}>
                Cancel
              </button>
              <button
                className="btn danger"
                onClick={() => {
                  update((s) => ({ ...s, workouts: s.workouts.filter((x) => x.id !== deleting.id) }))
                  setDeleting(null)
                }}
              >
                Delete
              </button>
            </>
          }
        >
          <p>
            {deleting.name} from {formatDate(deleting.startedAt)} will be removed.
          </p>
        </Modal>
      )}
    </div>
  )
}
