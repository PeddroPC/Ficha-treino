// ============================================================
// main.jsx — Entry point: inicializa mocks e monta o React
// ============================================================
import { StrictMode }    from 'react'
import { createRoot }    from 'react-dom/client'
import './index.css'
import App               from './App.jsx'
import { seedProfile }          from './mocks/profile.js'
import { seedExerciseCatalog }  from './mocks/exerciseCatalog.js'
import { seedWorkoutSheets, seedSheetExercises } from './mocks/workoutSheets.js'
import { seedExecutionLogs, seedExecutionSets }  from './mocks/executionLogs.js'
import useProfileStore  from './stores/useProfileStore.js'
import useExerciseStore from './stores/useExerciseStore.js'
import useWorkoutStore  from './stores/useWorkoutStore.js'
import useLogStore      from './stores/useLogStore.js'

// ── Versão dos dados seed ─────────────────────────────────
// Incremente este número sempre que alterar os mocks.
// Isso força a limpeza completa do localStorage na próxima carga.
const SEED_VERSION     = '4'
const SEED_VERSION_KEY = 'fitprogress:seed_version'

// ── Limpa TODO o localStorage do app ─────────────────────
function clearAllAppStorage() {
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('fitprogress:')) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k))
  console.info(`[FitProgress] Limpou ${keysToRemove.length} chaves do LocalStorage.`)
}

// ── Escreve os seeds diretamente nos stores Zustand ───────
// (sem passar pelo localStorage — evita race condition com persist)
function hydrateSeedsIntoStores() {
  useProfileStore.getState().setProfile(seedProfile)
  useExerciseStore.getState().setExercises(seedExerciseCatalog)
  useWorkoutStore.getState().setSheets(seedWorkoutSheets)
  useWorkoutStore.getState().setSheetExercises(seedSheetExercises)
  useLogStore.getState().setLogs(seedExecutionLogs)
  useLogStore.getState().setSets(seedExecutionSets)
}

// ── Bootstrap ─────────────────────────────────────────────
const storedVersion = localStorage.getItem(SEED_VERSION_KEY)

if (storedVersion !== SEED_VERSION) {
  // 1. Apaga TODO o localStorage (inclui chaves do Zustand persist)
  clearAllAppStorage()
  // 2. Grava nova versão
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
  // 3. Força os stores com os seeds novos
  hydrateSeedsIntoStores()
  console.info(`[FitProgress] Seeds v${SEED_VERSION} carregados (${seedExecutionLogs.length} logs, ${seedExecutionSets.length} sets).`)
} else {
  // Sessão normal: os stores Zustand persist já se auto-hidrataram
  // Garante que dados existem (caso localStorage tenha sido limpo manualmente)
  if (useLogStore.getState().logs.length === 0) {
    hydrateSeedsIntoStores()
    console.info('[FitProgress] Store vazio detectado — seeds recarregados.')
  }
}

// ── Monta a aplicação ─────────────────────────────────────
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
