import type { AppState, Exercise, Template, TemplateItem } from '../types'
import figures from './figures.json'

// Exercises and templates from the "30-Day Intensive Forearm & Ab Routine"
// (PowerBlock Sport, 3–24 lb). Figures are extracted from the routine's
// illustrations by scripts/extract-figures.py.

type Def = [id: string, name: string, cue: string, measure: 'reps' | 'time', weighted: boolean]

const defs: Def[] = [
  ['standing-overhead-press', 'Standing Overhead Press', 'Brace your core, press straight up, ribs down so your lower back stays neutral.', 'reps', true],
  ['close-grip-floor-press', 'Close-Grip Floor Press', 'Elbows tucked about 45°; lower until upper arms touch the floor, then press.', 'reps', true],
  ['lateral-raise', 'Lateral Raise', 'Lead with the elbows, stop at shoulder height, lower slowly.', 'reps', true],
  ['overhead-tricep-extension', 'Overhead Tricep Extension', 'Elbows point forward and stay still; only the forearms move.', 'reps', true],
  ['wrist-curl', 'Wrist Curl', 'Forearm supported on thigh, palm up; let the weight roll to your fingertips, then curl.', 'reps', true],
  ['reverse-wrist-curl', 'Reverse Wrist Curl', 'Palm down, lighter weight than the wrist curl; lift with the back of the hand.', 'reps', true],
  ['reverse-curl', 'Reverse Curl', 'Overhand grip, elbows pinned, lift without letting the wrists bend back.', 'reps', true],
  ['weighted-sit-up', 'Weighted Sit-Up', 'Hold the dumbbell at your chest; curl up smoothly without yanking your neck.', 'reps', true],
  ['hanging-lying-leg-raise', 'Hanging / Lying Leg Raise', 'Press your lower back into the floor and lower legs without letting them drop.', 'reps', false],
  ['plank', 'Plank', 'Squeeze glutes and abs; no sagging hips or piking.', 'time', false],
  ['bent-over-row', 'Bent-Over Row', 'Hinge at the hips with a flat back; pull elbows toward your hips.', 'reps', true],
  ['hammer-curl', 'Hammer Curl', 'Palms face each other the whole time; keep elbows pinned to your sides.', 'reps', true],
  ['rear-delt-fly', 'Rear Delt Fly', 'Hinge forward, slight elbow bend, sweep the weights out to the sides.', 'reps', true],
  ['thick-grip-farmer-s-carry', "Thick-Grip Farmer's Carry", 'Towel-wrap the handles; tall posture, crush the handles, controlled steps.', 'time', true],
  ['single-arm-suitcase-carry', 'Single-Arm Suitcase Carry', "One dumbbell only; don't lean toward the free side, let your obliques fight the tilt.", 'time', true],
  ['zottman-curl', 'Zottman Curl', 'Curl up palms up, rotate to palms down at the top, lower slowly.', 'reps', true],
  ['radial-deviation', 'Radial Deviation', 'Hold the dumbbell by one end, forearm supported; tilt the wrist up and lower slowly.', 'reps', true],
  ['russian-twist', 'Russian Twist', 'Lean back slightly with a long spine; rotate from the ribcage, not just the arms.', 'reps', true],
  ['bicycle-crunch', 'Bicycle Crunch', 'Slow and controlled; bring the shoulder toward the opposite knee.', 'reps', false],
  ['curl-to-press', 'Curl to Press', 'One fluid motion: curl up, rotate, press overhead; lower with control.', 'reps', true],
  ['renegade-row', 'Renegade Row', 'Wide feet for stability; keep hips square as you row.', 'reps', true],
  ['pronation-supination-rotation', 'Pronation / Supination Rotation', 'Hold the bell near one end, forearm supported, rotate slowly through full range.', 'reps', true],
  ['mountain-climbers', 'Mountain Climbers', 'Shoulders over wrists, brisk steady pace, hips level.', 'time', false],
  ['v-up', 'V-Up', 'Reach hands toward toes as legs lift; lower slowly.', 'reps', false],
  ['side-plank-with-hip-dip', 'Side Plank with Hip Dip', 'Dip the hip toward the floor, then lift back above the straight line.', 'reps', false],
  ['bell-head-hold', 'Bell-Head Hold', 'Pinch the dumbbell by its head (not the handle) and hang it at your side until your grip gives out.', 'time', true],
]

const figs = figures as Record<string, Exercise['figures']>

export const seedExercises: Exercise[] = defs.map(([id, name, cue, measure, weighted]) => ({
  id,
  name,
  cue,
  measure,
  weighted,
  figures: figs[id],
}))

const reps = (exerciseId: string, sets: number, min: number, max?: number, perSide?: boolean): TemplateItem => ({
  exerciseId,
  sets,
  target: { kind: 'reps', min, max },
  perSide,
})
const time = (exerciseId: string, sets: number, min: number, max?: number, perSide?: boolean): TemplateItem => ({
  exerciseId,
  sets,
  target: { kind: 'time', min, max },
  perSide,
})

export const seedTemplates: Template[] = [
  {
    id: 'fa30-day1-push',
    name: 'Day 1 · Push + Forearms + Abs',
    notes: '30-Day Forearm & Ab Routine. Repeat on Day 4, adding 3 lb where you hit the top of the rep range.',
    builtIn: true,
    blocks: [
      {
        name: 'Push',
        rounds: 1,
        items: [
          reps('standing-overhead-press', 4, 8, 10),
          reps('close-grip-floor-press', 3, 10, 12),
          reps('lateral-raise', 3, 15),
          reps('overhead-tricep-extension', 3, 12, 15),
        ],
      },
      {
        name: 'Forearm block',
        rounds: 1,
        items: [reps('wrist-curl', 4, 15, 20), reps('reverse-wrist-curl', 4, 12, 15), reps('reverse-curl', 3, 12, 15)],
      },
      {
        name: 'Abs',
        rounds: 1,
        items: [reps('weighted-sit-up', 3, 15), reps('hanging-lying-leg-raise', 2, 15), time('plank', 2, 45, 60)],
      },
    ],
  },
  {
    id: 'fa30-day2-pull',
    name: 'Day 2 · Pull + Grip + Abs',
    notes: '30-Day Forearm & Ab Routine. Repeat on Day 5.',
    builtIn: true,
    blocks: [
      {
        name: 'Pull',
        rounds: 1,
        items: [reps('bent-over-row', 4, 8, 10), reps('hammer-curl', 3, 15), reps('rear-delt-fly', 3, 15)],
      },
      {
        name: 'Grip & forearms',
        rounds: 1,
        items: [
          time('thick-grip-farmer-s-carry', 4, 60),
          time('single-arm-suitcase-carry', 3, 45, undefined, true),
          reps('zottman-curl', 4, 12),
          reps('radial-deviation', 3, 12, 15),
        ],
      },
      {
        name: 'Light abs',
        rounds: 1,
        items: [reps('russian-twist', 2, 20), reps('bicycle-crunch', 2, 20)],
      },
    ],
  },
  {
    id: 'fa30-day3-conditioning',
    name: 'Day 3 · Conditioning Circuit',
    notes:
      '30-Day Forearm & Ab Routine. Circuit style, minimal rest within a round. Repeat on Day 6 (or swap in weighted plank reach / dead bug).',
    builtIn: true,
    blocks: [
      {
        name: 'Circuit',
        rounds: 3,
        items: [
          reps('curl-to-press', 1, 12, undefined, true),
          reps('renegade-row', 1, 10, undefined, true),
          reps('pronation-supination-rotation', 1, 12, undefined, true),
          reps('reverse-curl', 1, 12),
          time('mountain-climbers', 1, 30),
          reps('v-up', 1, 15),
          reps('side-plank-with-hip-dip', 1, 12, undefined, true),
        ],
      },
      {
        name: 'Grip finisher',
        rounds: 1,
        items: [
          { exerciseId: 'bell-head-hold', sets: 3, target: { kind: 'failure' } },
          { ...reps('wrist-curl', 1, 25), note: 'Burnout' },
          time('plank', 1, 60),
        ],
      },
    ],
  },
  {
    id: 'fa30-day7-recovery',
    name: 'Day 7 · Active Recovery',
    notes:
      '30-Day Forearm & Ab Routine. 20–30 min easy walk or light cardio, wrist and forearm mobility (circles, flexor/extensor stretches). No heavy lifting or loaded ab work.',
    builtIn: true,
    blocks: [
      {
        name: 'Light core & forearms',
        rounds: 1,
        items: [time('plank', 2, 30), { ...reps('wrist-curl', 2, 20), note: 'Light weight' }],
      },
    ],
  },
]

export function seedState(): AppState {
  return { version: 1, exercises: seedExercises, templates: seedTemplates, workouts: [] }
}
