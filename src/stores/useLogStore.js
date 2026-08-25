// ============================================================
// stores/useLogStore.js
// Logs de execução e séries individuais (ExecutionSets).
// Contém seletores analíticos usados pelo Dashboard.
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../lib/localStorage.js'

const useLogStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      logs: [],  // ExecutionLog[]
      sets: [],  // ExecutionSet[]

      // ── Log Actions ──────────────────────────────────────────
      setLogs: (logs) => set({ logs }),
      setSets: (sets) => set({ sets }),

      addLog: (log) =>
        set((state) => ({
          logs: [
            ...state.logs,
            {
              startedAt: new Date().toISOString(),
              ...log,                               // id do caller tem prioridade
            },
          ],
        })),

      finishLog: (logId, { finishedAt, durationMinutes, notes, perceivedEffort }) =>
        set((state) => ({
          logs: state.logs.map((l) =>
            l.id === logId
              ? { ...l, finishedAt, durationMinutes, notes, perceivedEffort }
              : l
          ),
        })),

      addSet: (exerciseSet) =>
        set((state) => ({
          sets: [
            ...state.sets,
            {
              id: `es-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              ...exerciseSet,                       // id do caller sobrescreve se fornecido
            },
          ],
        })),

      removeSet: (id) =>
        set((state) => ({
          sets: state.sets.filter((s) => s.id !== id),
        })),

      // ── Selectors analíticos (usados no Dashboard) ──────────

      /** Retorna os N logs mais recentes, ordenados por data */
      getRecentLogs: (n = 5) =>
        [...get().logs]
          .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
          .slice(0, n),

      /** Total de treinos nos últimos N dias */
      getWorkoutsInPeriod: (days = 30) => {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        return get().logs.filter((l) => new Date(l.startedAt) >= cutoff).length
      },

      /** Sets de um exercício específico, ordenados cronologicamente */
      getSetsByExercise: (exerciseId) =>
        get()
          .sets.filter((s) => s.exerciseId === exerciseId)
          .sort((a, b) => {
            const logA = get().logs.find((l) => l.id === a.logId)
            const logB = get().logs.find((l) => l.id === b.logId)
            return new Date(logA?.startedAt ?? 0) - new Date(logB?.startedAt ?? 0)
          }),

      /** PRs por exercício: { exerciseId → { weightKg, reps, date } } */
      getPersonalRecords: () => {
        const prMap = {}
        get().sets.forEach((s) => {
          if (!s.isPR) return
          if (!prMap[s.exerciseId] || s.weightKg > prMap[s.exerciseId].weightKg) {
            const log = get().logs.find((l) => l.id === s.logId)
            prMap[s.exerciseId] = {
              weightKg: s.weightKg,
              reps: s.reps,
              date: log?.startedAt ?? null,
            }
          }
        })
        return prMap
      },

      /** Volume total (kg × reps) de um log específico */
      getVolumeByLog: (logId) =>
        get()
          .sets.filter((s) => s.logId === logId)
          .reduce((total, s) => total + s.weightKg * s.reps, 0),

      /** Séries de um log específico */
      getSetsByLog: (logId) =>
        get().sets.filter((s) => s.logId === logId),
    }),
    {
      name: `fitprogress:${STORAGE_KEYS.EXECUTION_LOGS}`,
    }
  )
)

export default useLogStore
