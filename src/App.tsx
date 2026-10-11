import { useState } from 'react'
import { Exercises } from './pages/Exercises'
import { History } from './pages/History'
import { Session } from './pages/Session'
import { Templates } from './pages/Templates'
import { StoreProvider } from './store'
import { useStore } from './storeContext'

type Tab = 'workout' | 'exercises' | 'history'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'workout', label: 'Workout', icon: '🏋️' },
  { id: 'exercises', label: 'Exercises', icon: '📖' },
  { id: 'history', label: 'History', icon: '🗓️' },
]

function Shell() {
  const { state } = useStore()
  const [tab, setTab] = useState<Tab>('workout')
  const active = state.workouts.find((w) => w.id === state.activeWorkoutId)

  return (
    <>
      <main className="main">
        {active && tab !== 'workout' && (
          <button className="resume-bar" onClick={() => setTab('workout')}>
            Workout in progress: {active.name} · Resume
          </button>
        )}
        {tab === 'workout' && (active ? <Session workout={active} /> : <Templates />)}
        {tab === 'exercises' && <Exercises />}
        {tab === 'history' && <History />}
      </main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)} aria-current={tab === t.id}>
            <span aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
