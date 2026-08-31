// ============================================================
// stores/useLogStore.js
// Logs de execução e séries individuais (ExecutionSets).
// Contém seletores analíticos usados pelo Dashboard.
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../lib/localStorage.js'
import { generateId } from '../utils/idGenerator.js'

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
              id: generateId('es'),
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

      /** 
       * Retorna as séries do último treino de um exercício específico, 
       * ignorando a sessão atual. 
       */
      getLastSessionSets: (exerciseId, currentLogId = null) => {
        const { logs, sets } = get()
        // 1. Achar todos os logs que têm esse exercício e não são o atual
        const logsWithEx = logs.filter(log => {
          if (currentLogId && log.id === currentLogId) return false;
          return sets.some(s => s.logId === log.id && s.exerciseId === exerciseId);
        });
        
        if (logsWithEx.length === 0) return null; // Sem histórico

        // 2. Ordenar por data decrescente e pegar o mais recente
        const lastLog = logsWithEx.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0];

        // 3. Retornar as séries desse log, ordenadas pelo número da série
        return sets
          .filter(s => s.logId === lastLog.id && s.exerciseId === exerciseId)
          .sort((a, b) => a.setNumber - b.setNumber);
      },
    }),
    {
      name: `fitprogress:${STORAGE_KEYS.EXECUTION_LOGS}`,
    }
  )
)

export default useLogStore
