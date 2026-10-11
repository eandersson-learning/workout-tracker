import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { seedState } from './data/seed'
import { loadState, saveState } from './storage'
import { StoreContext } from './storeContext'
import type { AppState } from './types'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null)
  const loaded = useRef(false)

  useEffect(() => {
    loadState().then((s) => {
      loaded.current = true
      setState(s ?? seedState())
    })
  }, [])

  useEffect(() => {
    if (!state || !loaded.current) return
    const t = setTimeout(() => saveState(state), 200)
    return () => clearTimeout(t)
  }, [state])

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => (s ? fn(s) : s)), [])

  if (!state) return <div className="loading">Loading…</div>
  return <StoreContext.Provider value={{ state, update }}>{children}</StoreContext.Provider>
}
