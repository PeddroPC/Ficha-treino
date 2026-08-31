import useSyncQueueStore from '../../stores/useSyncQueueStore.js'
import { ExerciseRepository } from '../repositories/ExerciseRepository.js'

/**
 * SyncQueueManager
 * 
 * Gerencia o processamento da fila de sincronização offline-first.
 * Escaneia tarefas 'pending' e tenta processá-las.
 */
class SyncQueueManager {
  constructor() {
    this.isProcessing = false
  }

  /**
   * Inicia o processamento das tarefas pendentes.
   */
  async processQueue() {
    if (this.isProcessing) return
    this.isProcessing = true

    const store = useSyncQueueStore.getState()
    const pendingTasks = store.getPendingTasks()

    if (pendingTasks.length === 0) {
      this.isProcessing = false
      return
    }

    console.log(`[SyncQueueManager] Iniciando processamento de ${pendingTasks.length} tarefa(s) pendente(s).`)

    for (const task of pendingTasks) {
      store.updateTaskStatus(task.id, 'processing')

      try {
        await this._processTask(task)
        
        store.updateTaskStatus(task.id, 'completed')
        console.log(`[SyncQueueManager] Tarefa ${task.id} completada com sucesso.`)

      } catch (error) {
        console.error(`[SyncQueueManager] Erro na tarefa ${task.id}:`, error)

        // 1. Erros de rede (Failed to fetch) ou Timeout
        const isNetworkError = error.message.includes('Failed to fetch') || error.message.includes('Network Error')
        
        // 2. Erros de permissão/RLS
        const isAuthError = error.message.includes('autenticado') || (error.code && error.code.startsWith('42501'))

        // 3. Erros permanentes HTTP (4xx) do Supabase (ex: foreign key violation = 23503)
        const isPermanentError = error.code && (error.code.startsWith('23') || error.code === '400')

        if (isNetworkError) {
          console.warn('[SyncQueueManager] Erro de rede detectado. Fila pausada. Retornando task para pending.')
          store.updateTaskStatus(task.id, 'pending')
          break // ABORTA O LOOP PARA MANTER A ORDEM
        } else if (isAuthError) {
          console.error('[SyncQueueManager] Erro de autenticação/RLS. Fila pausada.')
          store.updateTaskStatus(task.id, 'pending')
          break // Auth é pre-requisito
        } else if (isPermanentError) {
          console.error('[SyncQueueManager] Erro permanente (ex: schema, fk, validação). Task marcada como failed permanente para não travar a fila.')
          for (let i = task.retryCount; i < 5; i++) {
             store.markTaskFailed(task.id) // Força atingir 5 retries para virar failed
          }
        } else {
          // Erros genéricos ou temporários (5xx)
          store.markTaskFailed(task.id)
        }
      }
    }

    // Limpa completadas da fila
    useSyncQueueStore.getState().clearCompleted()

    this.isProcessing = false
  }

  async _processTask(task) {
    if (task.table === 'exercises') {
      if (task.action === 'upsert') {
        await ExerciseRepository.upsert(task.payload)
      } else if (task.action === 'delete') {
        await ExerciseRepository.delete(task.entityId)
      }
    } else {
      // Mock para entidades futuras não implementadas
      await this._simulateNetworkCall(task)
    }
  }

  /**
   * Simula uma chamada de rede com 20% de chance de falha para testar o retry.
   * @private
   */
  async _simulateNetworkCall(task) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Para testes determinísticos, podemos ler uma flag no payload
        if (task.payload && task.payload._simulateError) {
          reject(new Error('Simulated network error'))
        } else {
          resolve()
        }
      }, 300)
    })
  }
}

export const syncManager = new SyncQueueManager()
