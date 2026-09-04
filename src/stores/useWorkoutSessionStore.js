// ============================================================
// stores/useWorkoutSessionStore.js
// Controla a sessão de treino ativa (Modo Treino / Drawer)
// ============================================================
import { create } from 'zustand'
import { generateId } from '../utils/idGenerator.js'

const useWorkoutSessionStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────────
  isOpen: false,
  sheetId: null,
  logId: null,
  sessionDate: null,
  currentExerciseIndex: 0,
  currentSetNumber: 1,

  // ── Actions ──────────────────────────────────────────────

  /** Abre o drawer e inicia uma nova sessão */
  startSession: (sheetId, customDate = null) => {
    const logId = generateId('log')
    set({
      isOpen: true,
      sheetId,
      logId,
      sessionDate: customDate,
      currentExerciseIndex: 0,
      currentSetNumber: 1,
    })
    return logId
  },

  /** Fecha o drawer sem salvar o log final */
  closeSession: () =>
    set({
      isOpen: false,
      sheetId: null,
      logId: null,
      currentExerciseIndex: 0,
      currentSetNumber: 1,
    }),

  /** Avança para a próxima série do exercício atual */
  nextSet: () =>
    set((s) => ({ currentSetNumber: s.currentSetNumber + 1 })),

  /** Vai para o próximo exercício e reseta a contagem de séries */
  nextExercise: () =>
    set((s) => ({
      currentExerciseIndex: s.currentExerciseIndex + 1,
      currentSetNumber: 1,
    })),

  /** Volta para o exercício anterior */
  prevExercise: () =>
    set((s) => ({
      currentExerciseIndex: Math.max(0, s.currentExerciseIndex - 1),
      currentSetNumber: 1,
    })),

  /** Vai direto para um exercício específico */
  goToExercise: (index) =>
    set({ currentExerciseIndex: index, currentSetNumber: 1 }),
}))

export default useWorkoutSessionStore
