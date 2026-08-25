// ============================================================
// mocks/index.js — Ponto de entrada unificado dos mocks
// Inicializa o LocalStorage com dados semente na primeira execução.
// ============================================================
import { getItem, setItem, STORAGE_KEYS } from '../lib/localStorage.js'
import { seedProfile } from './profile.js'
import { seedExerciseCatalog } from './exerciseCatalog.js'
import { seedWorkoutSheets, seedSheetExercises } from './workoutSheets.js'
import { seedExecutionLogs, seedExecutionSets } from './executionLogs.js'

// Versão dos seeds — incremente quando quiser forçar reset dos mocks
const SEED_VERSION = '3'
const SEED_VERSION_KEY = 'fitprogress:seed_version'

/**
 * Chama esta função uma vez no bootstrap da aplicação.
 * Reseta automaticamente se a versão do seed mudou.
 */
export function initializeSeedData() {
  const storedVersion = localStorage.getItem(SEED_VERSION_KEY)

  // Se a versão mudou, apaga tudo e recarrega os seeds
  if (storedVersion !== SEED_VERSION) {
    console.info(`[FitProgress] Seed v${SEED_VERSION} detectado — resetando dados de demonstração.`)
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
  }

  if (!getItem(STORAGE_KEYS.PROFILE)) {
    setItem(STORAGE_KEYS.PROFILE, seedProfile)
  }
  if (!getItem(STORAGE_KEYS.EXERCISE_CATALOG)) {
    setItem(STORAGE_KEYS.EXERCISE_CATALOG, seedExerciseCatalog)
  }
  if (!getItem(STORAGE_KEYS.WORKOUT_SHEETS)) {
    setItem(STORAGE_KEYS.WORKOUT_SHEETS, seedWorkoutSheets)
  }
  if (!getItem(STORAGE_KEYS.SHEET_EXERCISES)) {
    setItem(STORAGE_KEYS.SHEET_EXERCISES, seedSheetExercises)
  }
  if (!getItem(STORAGE_KEYS.EXECUTION_LOGS)) {
    setItem(STORAGE_KEYS.EXECUTION_LOGS, seedExecutionLogs)
  }
  if (!getItem(STORAGE_KEYS.EXECUTION_SETS)) {
    setItem(STORAGE_KEYS.EXECUTION_SETS, seedExecutionSets)
  }
}

// Re-exporta seeds para uso direto em testes
export { seedProfile, seedExerciseCatalog, seedWorkoutSheets, seedSheetExercises, seedExecutionLogs, seedExecutionSets }
