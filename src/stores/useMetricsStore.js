// ============================================================
// stores/useMetricsStore.js
// Rastreamento de avaliações físicas (medidas corporais)
// Cada avaliação = snapshot em data com todas as medidas
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../lib/localStorage.js'
import { generateId } from '../utils/idGenerator.js'
import useSyncQueueStore from './useSyncQueueStore.js'

/**
 * Gera um ID único para a avaliação
 * @returns {string}
 */
const genId = () => generateId('metric')

const useMetricsStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────
      /** @type {Array<{
       *   id: string, date: string,
       *   weightKg: number|null, waistCm: number|null,
       *   hipCm: number|null, chestCm: number|null,
       *   armCm: number|null, thighCm: number|null,
       *   calfCm: number|null, bodyFatPct: number|null,
       *   notes: string
       * }>} */
      measurements: [],

      // ── Actions ──────────────────────────────────────────────
      addMeasurement: (data) => {
        const newMeasurement = {
          ...data,
          id: genId(),
          createdAt: new Date().toISOString(),
        }

        useSyncQueueStore.getState().enqueue('metrics', 'upsert', newMeasurement, newMeasurement.id)

        set((state) => ({
          measurements: [...state.measurements, newMeasurement].sort(
            (a, b) => a.date.localeCompare(b.date)
          ),
        }))
        return newMeasurement.id
      },

      updateMeasurement: (id, updates) =>
        set((state) => {
          const newMeasurements = state.measurements
            .map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
            .sort((a, b) => a.date.localeCompare(b.date))

          const updatedMeasurement = newMeasurements.find(m => m.id === id)
          if (updatedMeasurement) {
            useSyncQueueStore.getState().enqueue('metrics', 'upsert', updatedMeasurement, id)
          }

          return { measurements: newMeasurements }
        }),

      removeMeasurement: (id) =>
        set((state) => {
          useSyncQueueStore.getState().enqueue('metrics', 'delete', { id }, id)
          return {
            measurements: state.measurements.filter((m) => m.id !== id),
          }
        }),

      /** Retorna a medição mais recente */
      getLatest: () => {
        const { measurements } = get()
        return measurements.length > 0 ? measurements[measurements.length - 1] : null
      },

      /** Retorna medições ordenadas do mais antigo para o mais recente */
      getSorted: () => {
        return [...get().measurements].sort((a, b) => a.date.localeCompare(b.date))
      },
    }),
    {
      name: `fitprogress:${STORAGE_KEYS.BODY_METRICS}`,
    }
  )
)

export default useMetricsStore
