// ============================================================
// stores/useWorkoutStore.js
// Fichas de treino e exercícios da ficha (SheetExercises).
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../lib/localStorage.js'
import { generateId } from '../utils/idGenerator.js'
import useSyncQueueStore from './useSyncQueueStore.js'

const useWorkoutStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      sheets: [],         // WorkoutSheet[]
      sheetExercises: [], // SheetExercise[]

      // ── Sheet Actions ────────────────────────────────────────
      setSheets: (sheets) => set({ sheets }),

      addSheet: (sheet) =>
        (() => {
          const id = generateId('sheet')
          const now = new Date().toISOString()
          const newSheet = { ...sheet, id, isActive: true, createdAt: now, updatedAt: now }
          
          useSyncQueueStore.getState().enqueue('sheets', 'upsert', newSheet, id)

          set((state) => ({
            sheets: [...state.sheets, newSheet],
          }))
          return id
        })(),

      updateSheet: (id, updates) =>
        set((state) => {
          const newSheets = state.sheets.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          )
          
          const updatedSheet = newSheets.find((s) => s.id === id)
          if (updatedSheet) {
            useSyncQueueStore.getState().enqueue('sheets', 'upsert', updatedSheet, id)
          }

          return { sheets: newSheets }
        }),

      removeSheet: (id) =>
        set((state) => {
          // Precisamos deletar os exercícios vinculados na fila PRIMEIRO para respeitar as chaves estrangeiras
          const relatedExercises = state.sheetExercises.filter((se) => se.sheetId === id)
          for (const se of relatedExercises) {
            useSyncQueueStore.getState().enqueue('sheet_exercises', 'delete', { id: se.id }, se.id)
          }
          
          // E depois deletar a ficha
          useSyncQueueStore.getState().enqueue('sheets', 'delete', { id }, id)

          return {
            sheets: state.sheets.filter((s) => s.id !== id),
            sheetExercises: state.sheetExercises.filter((se) => se.sheetId !== id),
          }
        }),

      // ── SheetExercise Actions ────────────────────────────────
      setSheetExercises: (sheetExercises) => set({ sheetExercises }),

      replaceSheetExercises: (sheetId, exercises) =>
        set((state) => {
          const oldExercises = state.sheetExercises.filter((se) => se.sheetId === sheetId)
          
          // Deleta os antigos na fila
          for (const se of oldExercises) {
            useSyncQueueStore.getState().enqueue('sheet_exercises', 'delete', { id: se.id }, se.id)
          }

          // Gera os novos
          const newExercises = exercises.map((exercise, index) => ({
            ...exercise,
            id: exercise.id ?? generateId('se'),
            sheetId,
            order: index + 1,
          }))

          // Insere os novos na fila
          for (const se of newExercises) {
            useSyncQueueStore.getState().enqueue('sheet_exercises', 'upsert', se, se.id)
          }

          return {
            sheetExercises: [
              ...state.sheetExercises.filter((se) => se.sheetId !== sheetId),
              ...newExercises,
            ],
          }
        }),

      addSheetExercise: (sheetExercise) =>
        set((state) => {
          const currentMax = state.sheetExercises
            .filter((se) => se.sheetId === sheetExercise.sheetId)
            .reduce((max, se) => Math.max(max, se.order), 0)
            
          const newSe = {
            ...sheetExercise,
            id: generateId('se'),
            order: currentMax + 1,
          }

          useSyncQueueStore.getState().enqueue('sheet_exercises', 'upsert', newSe, newSe.id)

          return {
            sheetExercises: [...state.sheetExercises, newSe],
          }
        }),

      removeSheetExercise: (id) =>
        set((state) => {
          useSyncQueueStore.getState().enqueue('sheet_exercises', 'delete', { id }, id)
          return {
            sheetExercises: state.sheetExercises.filter((se) => se.id !== id),
          }
        }),

      reorderSheetExercises: (sheetId, orderedIds) =>
        set((state) => {
          const newSheetExercises = state.sheetExercises.map((se) => {
            if (se.sheetId !== sheetId) return se
            const newOrder = orderedIds.indexOf(se.id) + 1
            return newOrder > 0 ? { ...se, order: newOrder } : se
          })

          // Encontra os que foram alterados dessa ficha para sincronizar a nova ordem
          const affected = newSheetExercises.filter(se => se.sheetId === sheetId)
          for (const se of affected) {
            useSyncQueueStore.getState().enqueue('sheet_exercises', 'upsert', se, se.id)
          }

          return { sheetExercises: newSheetExercises }
        }),

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
