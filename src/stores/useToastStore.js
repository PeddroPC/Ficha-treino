// ============================================================
// stores/useToastStore.js — Sistema de toast notifications
// ============================================================
import { create } from 'zustand'
import { generateId } from '../utils/idGenerator.js'

const useToastStore = create((set) => ({
  toasts: [],

  /**
   * Exibe um toast e o remove automaticamente após `duration` ms.
   * @param {{ message: string, type?: 'success'|'error'|'info', duration?: number }} opts
   */
  addToast: ({ message, type = 'success', duration = 3500 }) => {
    const id = generateId('toast')
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, duration)
    return id
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export default useToastStore
