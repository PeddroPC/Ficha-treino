import { seedProfile } from '../mocks/profile.js'
import { seedExerciseCatalog } from '../mocks/exerciseCatalog.js'
import { seedWorkoutSheets, seedSheetExercises } from '../mocks/workoutSheets.js'
import { seedExecutionLogs, seedExecutionSets } from '../mocks/executionLogs.js'
import useProfileStore from '../stores/useProfileStore.js'
import useExerciseStore from '../stores/useExerciseStore.js'
import useWorkoutStore from '../stores/useWorkoutStore.js'
import useLogStore from '../stores/useLogStore.js'
import useSettingsStore from '../stores/useSettingsStore.js'

export function clearAllAppStorage() {
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('fitprogress:') && key !== 'fitprogress:settings') {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k))
}

export function hydrateSeedsIntoStores() {
  useProfileStore.getState().setProfile(seedProfile)
  useExerciseStore.getState().setExercises(seedExerciseCatalog)
  useWorkoutStore.getState().setSheets(seedWorkoutSheets)
  useWorkoutStore.getState().setSheetExercises(seedSheetExercises)
  useLogStore.getState().setLogs(seedExecutionLogs)
  useLogStore.getState().setSets(seedExecutionSets)
}

export function enableDemoMode() {
  clearAllAppStorage()
  useSettingsStore.getState().setDemoMode(true)
  hydrateSeedsIntoStores()
  window.location.reload()
}

export function enableRealMode() {
  clearAllAppStorage()
  useSettingsStore.getState().setDemoMode(false)
  
  // Reseta os estados imediatamente antes de recarregar
  useProfileStore.getState().setProfile(null)
  useExerciseStore.getState().setExercises([])
  useWorkoutStore.getState().setSheets([])
  useWorkoutStore.getState().setSheetExercises([])
  useLogStore.getState().setLogs([])
  useLogStore.getState().setSets([])

  window.location.reload()
}

export function exportDataAsJson() {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('fitprogress:')) {
      data[key] = localStorage.getItem(key)
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fitprogress-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importDataFromJson(jsonString) {
  try {
    const data = JSON.parse(jsonString)
    for (const key in data) {
      if (key.startsWith('fitprogress:')) {
        localStorage.setItem(key, data[key])
      }
    }
    window.location.reload()
    return true
  } catch (error) {
    console.error("Erro ao importar JSON", error)
    return false
  }
}
