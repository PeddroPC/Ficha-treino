// ============================================================
// main.jsx — Entry point: inicializa mocks e monta o React
// ============================================================
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeSeedData } from './mocks/index.js'
import useProfileStore   from './stores/useProfileStore.js'
import useExerciseStore  from './stores/useExerciseStore.js'
import useWorkoutStore   from './stores/useWorkoutStore.js'
import useLogStore       from './stores/useLogStore.js'
import { getItem, STORAGE_KEYS } from './lib/localStorage.js'

// 1. Inicializa o LocalStorage com dados semente (apenas na 1ª execução)
initializeSeedData()

// 2. Hidrata os stores Zustand com os dados do LocalStorage
//    Os stores com `persist` middleware já se auto-hidratam via LocalStorage,
//    mas aqui garantimos que os seeds foram carregados corretamente.
const hydrateStores = () => {
  const profile       = getItem(STORAGE_KEYS.PROFILE)
  const exercises     = getItem(STORAGE_KEYS.EXERCISE_CATALOG, [])
  const sheets        = getItem(STORAGE_KEYS.WORKOUT_SHEETS, [])
  const sheetExercises = getItem(STORAGE_KEYS.SHEET_EXERCISES, [])
  const logs          = getItem(STORAGE_KEYS.EXECUTION_LOGS, [])
  const sets          = getItem(STORAGE_KEYS.EXECUTION_SETS, [])

  if (profile)         useProfileStore.getState().setProfile(profile)
  if (exercises.length) useExerciseStore.getState().setExercises(exercises)
  if (sheets.length)   useWorkoutStore.getState().setSheets(sheets)
  if (sheetExercises.length) useWorkoutStore.getState().setSheetExercises(sheetExercises)
  if (logs.length)     useLogStore.getState().setLogs(logs)
  if (sets.length)     useLogStore.getState().setSets(sets)
}

hydrateStores()

// 3. Monta a aplicação
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
