// ============================================================
// localStorage.js — Camada de acesso ao LocalStorage
// ============================================================

const PREFIX = 'fitprogress:'

export function getActiveUserId() {
  return localStorage.getItem(`${PREFIX}active_user_id`) || 'legacy'
}

export function setActiveUserId(id) {
  if (id) localStorage.setItem(`${PREFIX}active_user_id`, id)
  else localStorage.removeItem(`${PREFIX}active_user_id`)
}

export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`)
    return raw !== null ? JSON.parse(raw) : defaultValue
  } catch (err) {
    console.error(`[LocalStorage] Erro ao ler "${key}":`, err)
    return defaultValue
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value))
  } catch (err) {
    console.error(`[LocalStorage] Erro ao gravar "${key}":`, err)
  }
}

export function removeItem(key) {
  localStorage.removeItem(`${PREFIX}${key}`)
}

export function clearAll() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k))
}

/**
 * Storage Engine customizado para Zustand Persist
 * Isola fisicamente os dados de cada usuário no LocalStorage.
 */
export const userBoundStorage = {
  getItem: (name) => {
    const userId = getActiveUserId()
    const suffix = userId === 'legacy' ? '' : `_${userId}`
    return localStorage.getItem(`${name}${suffix}`)
  },
  setItem: (name, value) => {
    const userId = getActiveUserId()
    const suffix = userId === 'legacy' ? '' : `_${userId}`
    localStorage.setItem(`${name}${suffix}`, value)
  },
  removeItem: (name) => {
    const userId = getActiveUserId()
    const suffix = userId === 'legacy' ? '' : `_${userId}`
    localStorage.removeItem(`${name}${suffix}`)
  }
}

// Chaves canônicas — evita strings mágicas espalhadas pelo código
export const STORAGE_KEYS = Object.freeze({
  PROFILE: 'profile',
  WORKOUT_SHEETS: 'workoutSheets',
  SHEET_EXERCISES: 'sheetExercises',
  EXERCISE_CATALOG: 'exerciseCatalog',
  EXECUTION_LOGS: 'executionLogs',
  EXECUTION_SETS: 'executionSets',
  BODY_METRICS: 'bodyMetrics',
  SYNC_QUEUE: 'syncQueue',
})

