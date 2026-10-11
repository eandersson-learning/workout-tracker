import { useState } from 'react'
import { ExercisePicker } from '../components/ExercisePicker'
import { Modal } from '../components/Modal'
import { uid } from '../format'
import { useStore } from '../storeContext'
import type { Target, Template, TemplateBlock, TemplateItem } from '../types'

type Props = { template?: Template; onClose: () => void }

const blank = (): Template => ({ id: uid(), name: '', blocks: [{ name: 'Main', rounds: 1, items: [] }] })

export function TemplateEditor({ template, onClose }: Props) {
  const { state, update } = useStore()
  const [draft, setDraft] = useState<Template>(() => structuredClone(template ?? blank()))
  const [pickFor, setPickFor] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const setBlock = (bi: number, fn: (b: TemplateBlock) => TemplateBlock) =>
    setDraft((d) => ({ ...d, blocks: d.blocks.map((b, i) => (i === bi ? fn(b) : b)) }))
  const setItem = (bi: number, ii: number, patch: Partial<TemplateItem>) =>
    setBlock(bi, (b) => ({ ...b, items: b.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) }))
  const moveItem = (bi: number, ii: number, dir: -1 | 1) =>
    setBlock(bi, (b) => {
      const items = [...b.items]
      const j = ii + dir
      if (j < 0 || j >= items.length) return b
      ;[items[ii], items[j]] = [items[j], items[ii]]
      return { ...b, items }
    })

  const valid = draft.name.trim() && draft.blocks.some((b) => b.items.length)

  const save = () => {
    const clean = { ...draft, name: draft.name.trim(), blocks: draft.blocks.filter((b) => b.items.length) }
    update((s) => ({
      ...s,
      templates: s.templates.some((t) => t.id === clean.id)
        ? s.templates.map((t) => (t.id === clean.id ? clean : t))
        : [...s.templates, clean],
    }))
    onClose()
  }

  const remove = () => {
    update((s) => ({ ...s, templates: s.templates.filter((t) => t.id !== draft.id) }))
    onClose()
  }

  return (
    <Modal
      title={template ? 'Edit template' : 'New template'}
      onClose={onClose}
      footer={
        <>
          {template && (
            <button className="btn danger-text" onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          )}
          <span className="spacer" />
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" disabled={!valid} onClick={save}>
            Save
          </button>
        </>
      }
    >
      <label className="field">
        <span>Name</span>
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Upper body" />
      </label>
      <label className="field">
        <span>Notes</span>
        <textarea rows={2} value={draft.notes ?? ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
      </label>

      {draft.blocks.map((block, bi) => (
        <fieldset key={bi} className="block-edit">
          <div className="row">
            <input
              className="grow"
              aria-label="Block name"
              value={block.name}
              onChange={(e) => setBlock(bi, (b) => ({ ...b, name: e.target.value }))}
            />
            <label className="inline">
              Rounds
              <input
                type="number"
                inputMode="numeric"
                min={1}
                className="num"
                value={block.rounds}
                onChange={(e) => setBlock(bi, (b) => ({ ...b, rounds: Math.max(1, Number(e.target.value) || 1) }))}
              />
            </label>
            {draft.blocks.length > 1 && (
              <button
                className="icon-btn"
                aria-label="Remove block"
                onClick={() => setDraft((d) => ({ ...d, blocks: d.blocks.filter((_, i) => i !== bi) }))}
              >
                ✕
              </button>
            )}
          </div>
          {block.rounds > 1 && <p className="muted small">Circuit: each round runs through every exercise once.</p>}

          {block.items.map((item, ii) => {
            const ex = state.exercises.find((e) => e.id === item.exerciseId)
            return (
              <div key={ii} className="item-edit">
                <div className="row">
                  <strong className="grow">{ex?.name ?? 'Unknown'}</strong>
                  <button className="icon-btn" aria-label="Move up" onClick={() => moveItem(bi, ii, -1)}>
                    ↑
                  </button>
                  <button className="icon-btn" aria-label="Move down" onClick={() => moveItem(bi, ii, 1)}>
                    ↓
                  </button>
                  <button
                    className="icon-btn"
                    aria-label="Remove exercise"
                    onClick={() => setBlock(bi, (b) => ({ ...b, items: b.items.filter((_, j) => j !== ii) }))}
                  >
                    ✕
                  </button>
                </div>
                <TargetEditor item={item} onChange={(patch) => setItem(bi, ii, patch)} />
              </div>
            )
          })}
          <button className="link-btn" onClick={() => setPickFor(bi)}>
            + Add exercise
          </button>
        </fieldset>
      ))}
      <button
        className="btn"
        onClick={() => setDraft((d) => ({ ...d, blocks: [...d.blocks, { name: `Block ${d.blocks.length + 1}`, rounds: 1, items: [] }] }))}
      >
        + Add block
      </button>

      {pickFor !== null && (
        <ExercisePicker
          onClose={() => setPickFor(null)}
          onPick={(ex) => {
            const target: Target = ex.measure === 'time' ? { kind: 'time', min: 30 } : { kind: 'reps', min: 8, max: 12 }
            setBlock(pickFor, (b) => ({ ...b, items: [...b.items, { exerciseId: ex.id, sets: b.rounds > 1 ? 1 : 3, target }] }))
            setPickFor(null)
          }}
        />
      )}
      {confirmDelete && (
        <Modal
          title="Delete this template?"
          onClose={() => setConfirmDelete(false)}
          footer={
            <>
              <button className="btn" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button className="btn danger" onClick={remove}>
                Delete
              </button>
            </>
          }
        >
          <p>Past workouts logged from it stay in your history.</p>
        </Modal>
      )}
    </Modal>
  )
}

function TargetEditor({ item, onChange }: { item: TemplateItem; onChange: (p: Partial<TemplateItem>) => void }) {
  const t = item.target
  const setKind = (kind: Target['kind']) =>
    onChange({
      target: kind === 'failure' ? { kind } : { kind, min: t.kind === 'failure' ? (kind === 'time' ? 30 : 10) : t.min, max: t.kind === 'failure' ? undefined : t.max },
    })
  const num = (v: string) => (v === '' ? undefined : Math.max(0, Number(v)))

  return (
    <div className="target-edit">
      <label className="inline">
        Sets
        <input
          type="number"
          inputMode="numeric"
          min={1}
          className="num"
          value={item.sets}
          onChange={(e) => onChange({ sets: Math.max(1, Number(e.target.value) || 1) })}
        />
      </label>
      <select aria-label="Target type" value={t.kind} onChange={(e) => setKind(e.target.value as Target['kind'])}>
        <option value="reps">Reps</option>
        <option value="time">Seconds</option>
        <option value="failure">To failure</option>
      </select>
      {t.kind !== 'failure' && (
        <>
          <input
            type="number"
            inputMode="numeric"
            className="num"
            aria-label="Minimum"
            value={t.min}
            onChange={(e) => onChange({ target: { ...t, min: num(e.target.value) ?? 0 } })}
          />
          <span className="muted">to</span>
          <input
            type="number"
            inputMode="numeric"
            className="num"
            aria-label="Maximum (optional)"
            placeholder="max"
            value={t.max ?? ''}
            onChange={(e) => onChange({ target: { ...t, max: num(e.target.value) } })}
          />
        </>
      )}
      <label className="inline">
        <input type="checkbox" checked={!!item.perSide} onChange={(e) => onChange({ perSide: e.target.checked || undefined })} />
        per side
      </label>
    </div>
  )
}
