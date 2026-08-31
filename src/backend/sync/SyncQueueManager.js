import useSyncQueueStore from '../../stores/useSyncQueueStore.js'

/**
 * SyncQueueManager
 * 
 * Gerencia o processamento da fila de sincronização offline-first.
 * Escaneia tarefas 'pending' e tenta processá-las.
 * 
 * NOTA (Fase 3): Conforme especificação, ainda NÃO estamos conectando 
 * ao Supabase real nem aos Repositories. O processamento aqui é simulado 
 * para validar os estados (pending -> processing -> completed/failed) e o retry.
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
      // 1. Marca como processing
      store.updateTaskStatus(task.id, 'processing')

      try {
        // 2. Simula chamada de rede (Substituir pelos Repositories na próxima fase)
        await this._simulateNetworkCall(task)
        
        // 3. Sucesso: Marca como completed
        store.updateTaskStatus(task.id, 'completed')
        console.log(`[SyncQueueManager] Tarefa ${task.id} completada com sucesso.`)

      } catch (error) {
        // 4. Erro: Incrementa retry ou falha definitiva
        store.markTaskFailed(task.id)
        console.error(`[SyncQueueManager] Erro na tarefa ${task.id}:`, error.message)
      }
    }

    // Limpa completadas da fila
    useSyncQueueStore.getState().clearCompleted()

    this.isProcessing = false
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
