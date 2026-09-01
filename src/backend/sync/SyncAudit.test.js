import test from 'node:test'
import assert from 'node:assert/strict'
import useSyncQueueStore from '../../stores/useSyncQueueStore.js'
import { syncManager } from './SyncQueueManager.js'
import { ExerciseRepository } from '../repositories/ExerciseRepository.js'

test('Auditoria SyncQueue: Edge Cases e Idempotência', async (t) => {
  t.beforeEach(() => {
    useSyncQueueStore.getState().clearQueue()
    syncManager.isProcessing = false
  })

  await t.test('Idempotência de duplicação: a mesma task executada duas vezes não deve falhar se o Supabase upsert suportar', async () => {
    let callCount = 0
    const originalUpsert = ExerciseRepository.upsert
    
    // Mock do repositório
    ExerciseRepository.upsert = async (payload) => {
      callCount++
      // Simula upsert (não falha na segunda vez)
      return { id: payload.id }
    }

    try {
      const store = useSyncQueueStore.getState()
      // Enfileira a mesma ação duas vezes simulando uma anomalia de abas duplicadas
      store.enqueue('exercises', 'upsert', { id: 'ex-999', name: 'Rosca' })
      store.enqueue('exercises', 'upsert', { id: 'ex-999', name: 'Rosca' })
      
      await syncManager.processQueue()
      
      const pending = store.getPendingTasks()
      assert.equal(pending.length, 0, 'Todas as tarefas devem ser concluídas')
      assert.equal(callCount, 2, 'Upsert deve ter sido chamado duas vezes sem quebrar')
    } finally {
      ExerciseRepository.upsert = originalUpsert
    }
  })

  await t.test('App restart: As tarefas persistem no Zustand (simulado)', async () => {
    // Na prática, persist é feito pelo zustand/middleware localstorage.
    // Garantimos que a estrutura da queue não se perde.
    const store = useSyncQueueStore.getState()
    store.enqueue('exercises', 'delete', { id: 'ex-000' })
    
    const queue = useSyncQueueStore.getState().queue
    assert.equal(queue.length, 1)
    assert.equal(queue[0].action, 'delete')
    assert.equal(queue[0].status, 'pending')
    assert.ok(queue[0].createdAt, 'Deve ter data de criação para LWW futuro')
  })
})
