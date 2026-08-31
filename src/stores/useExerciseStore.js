// ============================================================
// stores/useExerciseStore.js
// Catálogo de exercícios (base + customizados pelo usuário).
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../lib/localStorage.js'
import { generateId } from '../utils/idGenerator.js'
import useSyncQueueStore from './useSyncQueueStore.js'

const useExerciseStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      exercises: [],

      // ── Actions ─────────────────────────────────────────────
      setExercises: (exercises) => set({ exercises }),

      addExercise: (exercise) => {
        const id = generateId('ex-custom')
        const now = new Date().toISOString()
        const newEx = {
          ...exercise,
          id,
          isCustom: true,
          createdAt: now,
        }

        useSyncQueueStore.getState().enqueue('exercises', 'upsert', newEx)

        set((state) => ({
          exercises: [...state.exercises, newEx],
        }))
        return id
      },

      updateExercise: (id, updates) => {
        set((state) => {
          const newExercises = state.exercises.map((ex) =>
            ex.id === id ? { ...ex, ...updates } : ex
          )
          
          const updatedEx = newExercises.find((ex) => ex.id === id)
          if (updatedEx) {
            useSyncQueueStore.getState().enqueue('exercises', 'upsert', updatedEx)
          }

          return { exercises: newExercises }
        })
      },

      removeExercise: (id) => {
        useSyncQueueStore.getState().enqueue('exercises', 'delete', { id })
        set((state) => ({
          exercises: state.exercises.filter((ex) => ex.id !== id),
        }))
      },

      // ── Selectors ───────────────────────────────────────────
      getById: (id) => get().exercises.find((ex) => ex.id === id) ?? null,

      getByMuscleGroup: (muscleGroup) =>
        get().exercises.filter((ex) => ex.muscleGroup === muscleGroup),
    }),
    {
      name: `fitprogress:${STORAGE_KEYS.EXERCISE_CATALOG}`,
    }
  )
)

export default useExerciseStore
