import { POWERBLOCK_WEIGHTS } from '../weights'

type Props = { value: number | undefined; onChange: (lb: number | undefined) => void; label?: string }

/** Weight picker limited to PowerBlock Sport settings (3–24 lb, 3 lb steps). */
export function WeightSelect({ value, onChange, label = 'Weight' }: Props) {
  return (
    <select
      className="weight-select"
      aria-label={label}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
    >
      <option value="">— lb</option>
      {POWERBLOCK_WEIGHTS.map((w) => (
        <option key={w} value={w}>
          {w} lb
        </option>
      ))}
    </select>
  )
}
