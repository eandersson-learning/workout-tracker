import type { AppState } from './types'

// The whole app state lives in one IndexedDB record so uploaded images
// (stored as data: URLs) don't hit localStorage's ~5 MB cap. Falls back to
// localStorage when IndexedDB is unavailable (e.g. some private windows).

const DB_NAME = 'workout-tracker'
const STORE = 'kv'
const KEY = 'state'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function loadState(): Promise<AppState | undefined> {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).get(KEY)
      req.onsuccess = () => resolve(req.result as AppState | undefined)
      req.onerror = () => reject(req.error)
    })
  } catch {
    try {
      const raw = localStorage.getItem(DB_NAME)
      return raw ? (JSON.parse(raw) as AppState) : undefined
    } catch {
      return undefined
    }
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(state, KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    try {
      localStorage.setItem(DB_NAME, JSON.stringify(state))
    } catch {
      // Storage full or blocked; nothing more we can do.
    }
  }
}
