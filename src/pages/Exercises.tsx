import { useMemo, useState } from 'react'
import { ExerciseImage } from '../components/ExerciseImage'
import { Modal } from '../components/Modal'
import { formatDate, uid } from '../format'
import { useStore } from '../storeContext'
import type { Exercise } from '../types'

export function Exercises() {
  const { state } = useStore()
  const [q, setQ] = useState('')
  const [viewing, setViewing] = useState<Exercise | null>(null)
  const [editing, setEditing] = useState<Exercise | 'new' | null>(null)

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return [...state.exercises]
      .filter((e) => !needle || e.name.toLowerCase().includes(needle) || e.cue.toLowerCase().includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [state.exercises, q])

  return (
    <div>
      <div className="page-head">
        <h1>Exercises</h1>
        <button className="btn" onClick={() => setEditing('new')}>
          + New
        </button>
      </div>
      <input className="search" placeholder="Search exercises" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="ex-grid">
        {list.map((ex) => (
          <li key={ex.id}>
            <button className="ex-card" onClick={() => setViewing(ex)}>
              <ExerciseImage exercise={ex} />
              <strong>{ex.name}</strong>
              <span className="cue">{ex.cue}</span>
            </button>
          </li>
        ))}
      </ul>
      {viewing && (
        <ExerciseDetail
          exercise={state.exercises.find((e) => e.id === viewing.id) ?? viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing)
            setViewing(null)
          }}
        />
      )}
      {editing && <ExerciseEditor exercise={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function ExerciseDetail({ exercise, onClose, onEdit }: { exercise: Exercise; onClose: () => void; onEdit: () => void }) {
  const { state } = useStore()
  const history = state.workouts
    .filter((w) => w.finishedAt)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
    .flatMap((w) =>
      w.entries
        .filter((e) => e.exerciseId === exercise.id && e.sets.some((s) => s.done))
        .map((e) => ({ when: w.finishedAt!, sets: e.sets.filter((s) => s.done), perSide: e.perSide })),
    )
    .slice(0, 8)

  return (
    <Modal
      title={exercise.name}
      onClose={onClose}
      footer={
        <button className="btn" onClick={onEdit}>
          Edit
        </button>
      }
    >
      <ExerciseImage exercise={exercise} />
      <p className="cue">{exercise.cue}</p>
      <h3 className="small-head">Recent</h3>
      {history.length ? (
        <ul className="plain">
          {history.map((h, i) => (
            <li key={i}>
              <span>{formatDate(h.when)}</span>
              <span className="muted">
                {h.sets
                  .map((s) => `${s.reps ?? (s.seconds !== undefined ? `${s.seconds}s` : '—')}${s.weight ? ` @ ${s.weight}` : ''}`)
                  .join(', ')}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Not logged yet.</p>
      )}
    </Modal>
  )
}

const MAX_UPLOAD = 4 * 1024 * 1024

function ExerciseEditor({ exercise, onClose }: { exercise?: Exercise; onClose: () => void }) {
  const { state, update } = useStore()
  const [draft, setDraft] = useState<Exercise>(
    () => exercise ?? { id: uid(), name: '', cue: '', measure: 'reps', weighted: true, custom: true },
  )
  const [error, setError] = useState('')
  const inUse = state.templates.some((t) => t.blocks.some((b) => b.items.some((i) => i.exerciseId === draft.id)))

  const onFile = (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_UPLOAD) return setError('That file is over 4 MB; try a smaller image or GIF.')
    setError('')
    const reader = new FileReader()
    reader.onload = () => setDraft((d) => ({ ...d, imageUrl: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  const save = () => {
    const clean = { ...draft, name: draft.name.trim(), cue: draft.cue.trim(), imageUrl: draft.imageUrl?.trim() || undefined }
    update((s) => ({
      ...s,
      exercises: s.exercises.some((e) => e.id === clean.id)
        ? s.exercises.map((e) => (e.id === clean.id ? clean : e))
        : [...s.exercises, clean],
    }))
    onClose()
  }

  const remove = () => {
    update((s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== draft.id) }))
    onClose()
  }

  return (
    <Modal
      title={exercise ? 'Edit exercise' : 'New exercise'}
      onClose={onClose}
      footer={
        <>
          {exercise?.custom && !inUse && (
            <button className="btn danger-text" onClick={remove}>
              Delete
            </button>
          )}
          <span className="spacer" />
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" disabled={!draft.name.trim()} onClick={save}>
            Save
          </button>
        </>
      }
    >
      <label className="field">
        <span>Name</span>
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      </label>
      <label className="field">
        <span>Form cue (one line)</span>
        <input value={draft.cue} onChange={(e) => setDraft({ ...draft, cue: e.target.value })} />
      </label>
      <div className="row">
        <label className="field grow">
          <span>Measured in</span>
          <select value={draft.measure} onChange={(e) => setDraft({ ...draft, measure: e.target.value as Exercise['measure'] })}>
            <option value="reps">Reps</option>
            <option value="time">Seconds</option>
          </select>
        </label>
        <label className="inline">
          <input type="checkbox" checked={draft.weighted} onChange={(e) => setDraft({ ...draft, weighted: e.target.checked })} />
          Uses dumbbell
        </label>
      </div>
      <label className="field">
        <span>Image or GIF URL</span>
        <input
          type="url"
          placeholder="https://…"
          value={draft.imageUrl?.startsWith('data:') ? '' : (draft.imageUrl ?? '')}
          onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
        />
      </label>
      <label className="field">
        <span>…or upload one</span>
        <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      {error && <p className="error">{error}</p>}
      {draft.imageUrl && (
        <>
          <ExerciseImage exercise={draft} />
          <button className="link-btn" onClick={() => setDraft({ ...draft, imageUrl: undefined })}>
            {draft.figures ? 'Use the built-in illustration instead' : 'Remove image'}
          </button>
        </>
      )}
    </Modal>
  )
}
