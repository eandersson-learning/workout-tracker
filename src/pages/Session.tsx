import { useState } from 'react'
import { ExerciseImage } from '../components/ExerciseImage'
import { ExercisePicker } from '../components/ExercisePicker'
import { Modal } from '../components/Modal'
import { Timer } from '../components/Timer'
import { WeightSelect } from '../components/WeightSelect'
import { formatDuration, formatTarget } from '../format'
import { useStore } from '../storeContext'
import { useNow } from '../useNow'
import type { Exercise, SetLog, Workout, WorkoutEntry } from '../types'
import { completedSets, defaultValue, entryForExercise, totalSets } from '../workout'

export function Session({ workout }: { workout: Workout }) {
  const { state, update } = useStore()
  const [picking, setPicking] = useState(false)
  const [info, setInfo] = useState<Exercise | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const now = useNow(30000)

  const save = (fn: (w: Workout) => Workout) =>
    update((s) => ({ ...s, workouts: s.workouts.map((w) => (w.id === workout.id ? fn(w) : w)) }))

  const saveEntry = (entryId: string, fn: (e: WorkoutEntry) => WorkoutEntry) =>
    save((w) => ({ ...w, entries: w.entries.map((e) => (e.id === entryId ? fn(e) : e)) }))

  const finish = () =>
    update((s) => ({
      ...s,
      activeWorkoutId: undefined,
      workouts: s.workouts.map((w) => (w.id === workout.id ? { ...w, finishedAt: Date.now() } : w)),
    }))

  const discard = () =>
    update((s) => ({ ...s, activeWorkoutId: undefined, workouts: s.workouts.filter((w) => w.id !== workout.id) }))

  const addExercise = (ex: Exercise) => {
    setPicking(false)
    const blockIndex = workout.blocks.length - 1
    save((w) => ({ ...w, entries: [...w.entries, entryForExercise(state, ex, blockIndex)] }))
  }

  const exercise = (id: string) => state.exercises.find((e) => e.id === id)
  const done = completedSets(workout)
  const total = totalSets(workout)

  return (
    <div className="session">
      <div className="session-head">
        <div>
          <h1>{workout.name}</h1>
          <p className="muted">
            Started {formatDuration(now - workout.startedAt)} ago · {done}/{total} sets
          </p>
        </div>
        <button className="btn primary" onClick={finish}>
          Finish
        </button>
      </div>
      <div className="progress" aria-hidden="true">
        <div style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>
      {workout.notes && <p className="note">{workout.notes}</p>}

      {workout.blocks.map((block, bi) => {
        const entries = workout.entries.filter((e) => e.blockIndex === bi)
        if (!entries.length) return null
        return (
          <section key={bi} className="block">
            <h2 className="block-title">
              {block.name}
              {block.rounds > 1 && <span className="pill">{block.rounds} rounds</span>}
            </h2>
            {block.rounds > 1
              ? Array.from({ length: block.rounds }, (_, r) => (
                  <div key={r} className="round">
                    <h3 className="round-title">Round {r + 1}</h3>
                    {entries.map((entry) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        exercise={exercise(entry.exerciseId)}
                        round={r + 1}
                        onInfo={setInfo}
                        onChange={(fn) => saveEntry(entry.id, fn)}
                      />
                    ))}
                  </div>
                ))
              : entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    exercise={exercise(entry.exerciseId)}
                    onInfo={setInfo}
                    onChange={(fn) => saveEntry(entry.id, fn)}
                    onRemove={() => save((w) => ({ ...w, entries: w.entries.filter((e) => e.id !== entry.id) }))}
                  />
                ))}
          </section>
        )
      })}

      <div className="session-actions">
        <button className="btn" onClick={() => setPicking(true)}>
          + Add exercise
        </button>
        <button className="btn danger-text" onClick={() => setConfirmDiscard(true)}>
          Discard workout
        </button>
      </div>

      {picking && <ExercisePicker onPick={addExercise} onClose={() => setPicking(false)} />}
      {info && (
        <Modal title={info.name} onClose={() => setInfo(null)}>
          <ExerciseImage exercise={info} />
          <p className="cue">{info.cue}</p>
        </Modal>
      )}
      {confirmDiscard && (
        <Modal
          title="Discard this workout?"
          onClose={() => setConfirmDiscard(false)}
          footer={
            <>
              <button className="btn" onClick={() => setConfirmDiscard(false)}>
                Keep going
              </button>
              <button className="btn danger" onClick={discard}>
                Discard
              </button>
            </>
          }
        >
          <p>Nothing from this session will be saved.</p>
        </Modal>
      )}
    </div>
  )
}

type EntryProps = {
  entry: WorkoutEntry
  exercise: Exercise | undefined
  /** In a circuit, only this round's sets are shown. */
  round?: number
  onInfo: (ex: Exercise) => void
  onChange: (fn: (e: WorkoutEntry) => WorkoutEntry) => void
  onRemove?: () => void
}

function EntryCard({ entry, exercise, round, onInfo, onChange, onRemove }: EntryProps) {
  if (!exercise) return null
  const timed = entry.target ? entry.target.kind !== 'reps' : exercise.measure === 'time'
  const indexes = entry.sets.map((s, i) => [s, i] as const).filter(([s]) => round === undefined || s.round === round)
  const allDone = indexes.length > 0 && indexes.every(([s]) => s.done)

  const setAt = (i: number, patch: Partial<SetLog>) =>
    onChange((e) => ({ ...e, sets: e.sets.map((s, j) => (j === i ? { ...s, ...patch } : s)) }))

  // Changing a set's weight carries forward to later sets that haven't been done yet.
  const setWeight = (i: number, weight: number | undefined) =>
    onChange((e) => ({
      ...e,
      sets: e.sets.map((s, j) => (j === i || (j > i && !s.done && s.weight === e.sets[i].weight) ? { ...s, weight } : s)),
    }))

  const toggle = (i: number) => {
    const s = entry.sets[i]
    if (s.done) return setAt(i, { done: false })
    const fill = defaultValue(entry.target)
    setAt(i, timed ? { done: true, seconds: s.seconds ?? fill } : { done: true, reps: s.reps ?? fill })
  }

  const addSet = () =>
    onChange((e) => {
      const last = e.sets[e.sets.length - 1]
      return { ...e, sets: [...e.sets, { round: (last?.round ?? 0) + 1, weight: last?.weight, done: false }] }
    })

  return (
    <article className={`entry${allDone ? ' entry-done' : ''}`}>
      <header className="entry-head">
        <button className="entry-thumb" onClick={() => onInfo(exercise)} aria-label={`How to do ${exercise.name}`}>
          <ExerciseImage exercise={exercise} size="thumb" />
        </button>
        <div className="entry-title">
          <h4>{exercise.name}</h4>
          <p className="muted">
            {round === undefined && entry.target ? `${entry.sets.length} × ` : ''}
            {formatTarget(entry.target, entry.perSide)}
            {entry.note ? ` · ${entry.note}` : ''}
          </p>
        </div>
        {onRemove && (
          <button className="icon-btn" onClick={onRemove} aria-label={`Remove ${exercise.name}`}>
            ✕
          </button>
        )}
      </header>
      <table className="sets">
        <thead>
          <tr>
            <th>{round === undefined ? 'Set' : ''}</th>
            {exercise.weighted && <th>lb</th>}
            <th>{timed ? 'Sec' : 'Reps'}</th>
            <th aria-label="Done" />
          </tr>
        </thead>
        <tbody>
          {indexes.map(([s, i]) => (
            <tr key={i} className={s.done ? 'done' : ''}>
              <td className="set-n">{round === undefined ? i + 1 : ''}</td>
              {exercise.weighted && (
                <td>
                  <WeightSelect value={s.weight} onChange={(weight) => setWeight(i, weight)} />
                </td>
              )}
              <td>
                <div className="val-cell">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    aria-label={timed ? 'Seconds' : 'Reps'}
                    placeholder={String(defaultValue(entry.target) ?? (timed ? 'sec' : 'reps'))}
                    value={(timed ? s.seconds : s.reps) ?? ''}
                    onChange={(e) => {
                      const v = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value))
                      setAt(i, timed ? { seconds: v } : { reps: v })
                    }}
                  />
                  {timed && !s.done && (
                    <Timer target={defaultValue(entry.target)} onStop={(seconds) => setAt(i, { seconds, done: true })} />
                  )}
                </div>
              </td>
              <td>
                <button
                  className={`check${s.done ? ' on' : ''}`}
                  onClick={() => toggle(i)}
                  aria-label={s.done ? 'Mark set not done' : 'Mark set done'}
                  aria-pressed={s.done}
                >
                  ✓
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {round === undefined && (
        <div className="entry-foot">
          <button className="link-btn" onClick={addSet}>
            + Add set
          </button>
          {entry.sets.length > 1 && (
            <button className="link-btn muted" onClick={() => onChange((e) => ({ ...e, sets: e.sets.slice(0, -1) }))}>
              − Remove set
            </button>
          )}
        </div>
      )}
    </article>
  )
}
