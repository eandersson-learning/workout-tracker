import { createContext, useContext } from 'react'
import type { AppState } from './types'

export type Store = {
  state: AppState
  update: (fn: (s: AppState) => AppState) => void
}

export const StoreContext = createContext<Store | null>(null)

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore outside StoreProvider')
  return ctx
}
