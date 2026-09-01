import test from 'node:test'
import assert from 'node:assert/strict'
import useSyncQueueStore from '../../stores/useSyncQueueStore.js'
import { syncManager } from './SyncQueueManager.js'

test('SyncQueueManager Unit Tests', async (t) => {
  t.beforeEach(() => {
    useSyncQueueStore.getState().clearQueue()
    syncManager.isProcessing = false
  })

  await t.test('deve processar fila vazia sem erros', async () => {
    await syncManager.processQueue()
    assert.equal(syncManager.isProcessing, false)
  })

  await t.test('deve processar uma tarefa com sucesso e removê-la da fila', async () => {
    const store = useSyncQueueStore.getState()
    store.enqueue('test', 'upsert', { dummy: true })
    
    // Assegura que está pending
    assert.equal(useSyncQueueStore.getState().queue.length, 1)
    
    await syncManager.processQueue()
    
    // A tarefa completada deve ter sido limpa pelo clearCompleted no final do processo
    assert.equal(useSyncQueueStore.getState().queue.length, 0)
  })

  await t.test('deve simular falha, incrementar retry e manter na fila', async () => {
    const store = useSyncQueueStore.getState()
    // Payload com _simulateError forçará a promise a dar reject dentro de _simulateNetworkCall
    store.enqueue('test', 'upsert', { _simulateError: true, name: 'Treino Teste' })
    
    await syncManager.processQueue()
    
    const queue = useSyncQueueStore.getState().queue
    assert.equal(queue.length, 1)
    assert.equal(queue[0].retryCount, 1)
    assert.equal(queue[0].status, 'pending')
  })
})
