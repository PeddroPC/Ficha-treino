// ============================================================
// stores/useWorkoutStore.js
// Fichas de treino e exercícios da ficha (SheetExercises).
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../lib/localStorage.js'

const useWorkoutStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      sheets: [],         // WorkoutSheet[]
      sheetExercises: [], // SheetExercise[]

      // ── Sheet Actions ────────────────────────────────────────
      setSheets: (sheets) => set({ sheets }),

      addSheet: (sheet) =>
        set((state) => ({
          sheets: [
            ...state.sheets,
            {
              ...sheet,
              id: `sheet-${Date.now()}`,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateSheet: (id, updates) =>
        set((state) => ({
          sheets: state.sheets.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        })),

      removeSheet: (id) =>
        set((state) => ({
          sheets: state.sheets.filter((s) => s.id !== id),
          // Remove os exercícios vinculados também
          sheetExercises: state.sheetExercises.filter((se) => se.sheetId !== id),
        })),

      // ── SheetExercise Actions ────────────────────────────────
      setSheetExercises: (sheetExercises) => set({ sheetExercises }),

      addSheetExercise: (sheetExercise) =>
        set((state) => {
          const currentMax = state.sheetExercises
            .filter((se) => se.sheetId === sheetExercise.sheetId)
            .reduce((max, se) => Math.max(max, se.order), 0)
          return {
            sheetExercises: [
              ...state.sheetExercises,
              {
                ...sheetExercise,
                id: `se-${Date.now()}`,
                order: currentMax + 1,
              },
            ],
          }
        }),

      removeSheetExercise: (id) =>
        set((state) => ({
          sheetExercises: state.sheetExercises.filter((se) => se.id !== id),
        })),

      reorderSheetExercises: (sheetId, orderedIds) =>
        set((state) => ({
          sheetExercises: state.sheetExercises.map((se) => {
            if (se.sheetId !== sheetId) return se
            const newOrder = orderedIds.indexOf(se.id) + 1
            return newOrder > 0 ? { ...se, order: newOrder } : se
          }),
        })),

      // ── Selectors ───────────────────────────────────────────
      getSheetById: (id) => get().sheets.find((s) => s.id === id) ?? null,

      getExercisesBySheet: (sheetId) =>
        get()
          .sheetExercises.filter((se) => se.sheetId === sheetId)
          .sort((a, b) => a.order - b.order),

      getActiveSheets: () => get().sheets.filter((s) => s.isActive),
    }),
    {
      name: `fitprogress:${STORAGE_KEYS.WORKOUT_SHEETS}`,
    }
  )
)

export default useWorkoutStore
