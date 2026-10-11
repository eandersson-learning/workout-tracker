import { useState } from 'react'
import { formatPrescription } from '../format'
import { useStore } from '../storeContext'
import type { Template, Workout } from '../types'
import { emptyWorkout, workoutFromTemplate } from '../workout'
import { TemplateEditor } from './TemplateEditor'

export function Templates() {
  const { state, update } = useStore()
  const [editing, setEditing] = useState<Template | 'new' | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  const start = (w: Workout) => update((s) => ({ ...s, workouts: [...s.workouts, w], activeWorkoutId: w.id }))
  const name = (id: string) => state.exercises.find((e) => e.id === id)?.name ?? 'Unknown exercise'

  return (
    <div>
      <div className="page-head">
        <h1>Start a workout</h1>
        <button className="btn" onClick={() => start(emptyWorkout())}>
          Empty workout
        </button>
      </div>

      <div className="section-head">
        <h2>Templates</h2>
        <button className="link-btn" onClick={() => setEditing('new')}>
          + New template
        </button>
      </div>
      <ul className="cards">
        {state.templates.map((t) => {
          const count = t.blocks.reduce((n, b) => n + b.items.length, 0)
          const expanded = open === t.id
          return (
            <li key={t.id} className="card template-card">
              <button className="template-summary" onClick={() => setOpen(expanded ? null : t.id)} aria-expanded={expanded}>
                <strong>{t.name}</strong>
                <span className="muted">
                  {count} exercises · {t.blocks.map((b) => b.name + (b.rounds > 1 ? ` ×${b.rounds}` : '')).join(', ')}
                </span>
              </button>
              {expanded && (
                <div className="template-detail">
                  {t.notes && <p className="muted small">{t.notes}</p>}
                  {t.blocks.map((b, bi) => (
                    <div key={bi}>
                      <h4 className="block-label">
                        {b.name}
                        {b.rounds > 1 && ` · ${b.rounds} rounds`}
                      </h4>
                      <ol className="plain">
                        {b.items.map((it, ii) => (
                          <li key={ii}>
                            <span>{name(it.exerciseId)}</span>
                            <span className="muted">{formatPrescription(it.sets, it.target, it.perSide)}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
              <div className="card-actions">
                <button className="btn primary" onClick={() => start(workoutFromTemplate(state, t))}>
                  Start
                </button>
                <button className="btn" onClick={() => setEditing(t)}>
                  Edit
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      {editing && <TemplateEditor template={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
