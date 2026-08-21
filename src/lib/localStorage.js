// ============================================================
// localStorage.js — Camada de acesso ao LocalStorage
// Abstrai JSON.parse/stringify e trata erros de forma uniforme.
// Substituível por chamadas a uma API REST sem alterar os stores.
// ============================================================

const PREFIX = 'fitprogress:'

/**
 * Lê um valor do LocalStorage e o desserializa.
 * @param {string} key
 * @param {*} defaultValue  Retornado quando a chave não existe ou ocorre erro.
 */
export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`)
    return raw !== null ? JSON.parse(raw) : defaultValue
  } catch (err) {
    console.error(`[LocalStorage] Erro ao ler "${key}":`, err)
    return defaultValue
  }
}

/**
 * Serializa e grava um valor no LocalStorage.
 * @param {string} key
 * @param {*} value
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value))
  } catch (err) {
    console.error(`[LocalStorage] Erro ao gravar "${key}":`, err)
  }
}

/**
 * Remove uma chave do LocalStorage.
 * @param {string} key
 */
export function removeItem(key) {
  localStorage.removeItem(`${PREFIX}${key}`)
}

/**
 * Remove todas as chaves do FitProgress.
 */
export function clearAll() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k))
}

// Chaves canônicas — evita strings mágicas espalhadas pelo código
export const STORAGE_KEYS = Object.freeze({
  PROFILE: 'profile',
  WORKOUT_SHEETS: 'workoutSheets',
  SHEET_EXERCISES: 'sheetExercises',
  EXERCISE_CATALOG: 'exerciseCatalog',
  EXECUTION_LOGS: 'executionLogs',
  EXECUTION_SETS: 'executionSets',
})
