// ============================================================
// stores/useExerciseStore.js
// Catálogo de exercícios (base + customizados pelo usuário).
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../lib/localStorage.js'

const useExerciseStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      exercises: [],

      // ── Actions ─────────────────────────────────────────────
      setExercises: (exercises) => set({ exercises }),

      addExercise: (exercise) =>
        set((state) => ({
          exercises: [
            ...state.exercises,
            {
              ...exercise,
              id: `ex-custom-${Date.now()}`,
              isCustom: true,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateExercise: (id, updates) =>
        set((state) => ({
          exercises: state.exercises.map((ex) =>
            ex.id === id ? { ...ex, ...updates } : ex
          ),
        })),

      removeExercise: (id) =>
        set((state) => ({
          exercises: state.exercises.filter((ex) => ex.id !== id),
        })),

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
