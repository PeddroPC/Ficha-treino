import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../lib/localStorage.js'
import { generateId } from '../utils/idGenerator.js'

/**
 * @typedef {'pending' | 'processing' | 'completed' | 'failed'} SyncStatus
 * 
 * @typedef {Object} SyncTask
 * @property {string} id - ID único da tarefa na fila
 * @property {string} table - Tabela de destino (ex: 'sheets', 'logs')
 * @property {'upsert' | 'delete'} action - Ação a ser realizada
 * @property {Object} payload - Dados a serem enviados
 * @property {SyncStatus} status - Status atual da tarefa
 * @property {number} retryCount - Número de tentativas falhas
 * @property {string} createdAt - Timestamp de criação
 * @property {string} updatedAt - Timestamp de atualização
 */

const useSyncQueueStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      /** @type {SyncTask[]} */
      queue: [],

      // ── Actions ─────────────────────────────────────────────

      /**
       * Adiciona uma nova tarefa à fila
       */
      enqueue: (table, action, payload) => {
        const id = generateId('task')
        const now = new Date().toISOString()
        const newTask = {
          id,
          table,
          action,
          payload,
          status: 'pending',
          retryCount: 0,
          createdAt: now,
          updatedAt: now
        }

        set((state) => ({
          queue: [...state.queue, newTask]
        }))

        return id
      },

      /**
       * Atualiza o status de uma tarefa
       */
      updateTaskStatus: (id, status) => {
        set((state) => ({
          queue: state.queue.map((task) => 
            task.id === id 
              ? { ...task, status, updatedAt: new Date().toISOString() } 
              : task
          )
        }))
      },

      /**
       * Incrementa o contador de retries e marca como failed ou pending
       */
      markTaskFailed: (id) => {
        set((state) => ({
          queue: state.queue.map((task) => {
            if (task.id === id) {
              const newRetryCount = task.retryCount + 1
              // Se falhou mais de 5 vezes, fica como failed definitivo, senão volta pra pending pra tentar de novo
              const newStatus = newRetryCount >= 5 ? 'failed' : 'pending'
              return { 
                ...task, 
                retryCount: newRetryCount, 
                status: newStatus,
                updatedAt: new Date().toISOString() 
              }
            }
            return task
          })
        }))
      },

      /**
       * Remove tarefas completadas ou falhas definitivas da fila
       */
      clearCompleted: () => {
        set((state) => ({
          queue: state.queue.filter(t => t.status !== 'completed')
        }))
      },

      /**
       * Limpa toda a fila (útil para logout ou reset)
       */
      clearQueue: () => set({ queue: [] }),

      // ── Selectors ───────────────────────────────────────────
      
      /** Retorna as tarefas pendentes */
      getPendingTasks: () => get().queue.filter(t => t.status === 'pending'),
    }),
    {
      name: `fitprogress:${STORAGE_KEYS.SYNC_QUEUE || 'syncQueue'}`,
    }
  )
)

export default useSyncQueueStore
