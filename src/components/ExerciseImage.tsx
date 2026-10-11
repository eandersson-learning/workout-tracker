import type { Exercise } from '../types'

type Props = { exercise: Exercise; size?: 'thumb' | 'full' }

/** Shows an exercise's custom image/GIF, or its built-in start/finish figures. */
export function ExerciseImage({ exercise, size = 'full' }: Props) {
  if (exercise.imageUrl) {
    return (
      <div className={`ex-img ex-img-${size}`}>
        <img src={exercise.imageUrl} alt={exercise.name} loading="lazy" />
      </div>
    )
  }
  const figs = exercise.figures ?? []
  if (!figs.length) {
    return (
      <div className={`ex-img ex-img-${size} ex-img-empty`} aria-hidden="true">
        {exercise.name.slice(0, 1)}
      </div>
    )
  }
  const shown = size === 'thumb' ? figs.slice(-1) : figs
  return (
    <div className={`ex-img ex-img-${size}`}>
      {shown.map((f, i) => (
        // Figures are trusted SVG bundled with the app (see scripts/extract-figures.py).
        <figure key={i}>
          <div className="fig" dangerouslySetInnerHTML={{ __html: f.svg }} />
          {size === 'full' && <figcaption>{f.caption}</figcaption>}
        </figure>
      ))}
    </div>
  )
}
