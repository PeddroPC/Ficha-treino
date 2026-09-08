// ============================================================
// storeReset.js — Resets and rehydrates Zustand stores per user
// ============================================================
import { getActiveUserId, setActiveUserId } from './localStorage.js'
import useWorkoutStore from '../stores/useWorkoutStore.js'
import useLogStore from '../stores/useLogStore.js'
import useMetricsStore from '../stores/useMetricsStore.js'
import useProfileStore from '../stores/useProfileStore.js'
import useSyncQueueStore from '../stores/useSyncQueueStore.js'
import useExerciseStore from '../stores/useExerciseStore.js'

/**
 * Reseta o estado em memória de todas as stores do Zustand para o estado inicial limpo.
 * Deve ser chamado no logout ou antes de alternar de usuário.
 */
export function resetAllStores() {
  useWorkoutStore.setState({ sheets: [], sheetExercises: [] })
  useLogStore.setState({ logs: [], sets: [] })
  useMetricsStore.setState({ measurements: [] })
  useProfileStore.setState({ profile: null })
  useSyncQueueStore.setState({ queue: [] })
  
  const exerciseStore = useExerciseStore.getState()
  if (exerciseStore && Array.isArray(exerciseStore.exercises)) {
    const systemOnly = exerciseStore.exercises.filter((e) => !e.isCustom)
    useExerciseStore.setState({ exercises: systemOnly })
  }
}

/**
 * Alterna com segurança o usuário ativo, evitando vazamento de estado em memória
 * e reidratando os dados do novo usuário a partir do LocalStorage isolado.
 */
export async function switchActiveUser(newUserId) {
  const currentUserId = getActiveUserId()

  if (currentUserId !== newUserId) {
    console.log(`[StoreReset] Alternando usuário ativo de "${currentUserId}" para "${newUserId}". Limpando memória local...`)
    
    // 1. Limpa o estado em memória de todas as stores
    resetAllStores()

    // 2. Atualiza a chave active_user_id no LocalStorage
    setActiveUserId(newUserId)

    // 3. Se houver novo usuário, reidrata as stores com os dados do LocalStorage do novo usuário
    if (newUserId) {
      await Promise.all([
        useWorkoutStore.persist?.rehydrate?.(),
        useLogStore.persist?.rehydrate?.(),
        useMetricsStore.persist?.rehydrate?.(),
        useProfileStore.persist?.rehydrate?.(),
        useSyncQueueStore.persist?.rehydrate?.(),
        useExerciseStore.persist?.rehydrate?.()
      ])
    }
  }
}
