import test from 'node:test'
import assert from 'node:assert/strict'
import useSyncQueueStore from './useSyncQueueStore.js'

test('useSyncQueueStore Unit Tests', async (t) => {
  t.beforeEach(() => {
    useSyncQueueStore.getState().clearQueue()
  })

  await t.test('deve adicionar uma tarefa à fila com status pending', () => {
    const store = useSyncQueueStore.getState()
    const id = store.enqueue('sheets', 'upsert', { name: 'Treino A' })
    
    const pending = store.getPendingTasks()
    assert.equal(pending.length, 1)
    assert.equal(pending[0].id, id)
    assert.equal(pending[0].status, 'pending')
    assert.equal(pending[0].retryCount, 0)
    assert.equal(pending[0].table, 'sheets')
  })

  await t.test('deve atualizar o status de uma tarefa', () => {
    const store = useSyncQueueStore.getState()
    const id = store.enqueue('sheets', 'upsert', { name: 'Treino A' })
    
    useSyncQueueStore.getState().updateTaskStatus(id, 'processing')
    
    const task = useSyncQueueStore.getState().queue.find(t => t.id === id)
    assert.equal(task.status, 'processing')
    assert.equal(useSyncQueueStore.getState().getPendingTasks().length, 0)
  })

  await t.test('deve incrementar retryCount e manter pending se falhar < 5 vezes', () => {
    const store = useSyncQueueStore.getState()
    const id = store.enqueue('sheets', 'upsert', { name: 'Treino A' })
    
    useSyncQueueStore.getState().markTaskFailed(id)
    
    const task = useSyncQueueStore.getState().queue.find(t => t.id === id)
    assert.equal(task.retryCount, 1)
    assert.equal(task.status, 'pending')
  })

  await t.test('deve marcar como failed definitivo após 5 falhas', () => {
    const store = useSyncQueueStore.getState()
    const id = store.enqueue('sheets', 'upsert', { name: 'Treino A' })
    
    // Falha 5 vezes
    for(let i=0; i<5; i++) {
      useSyncQueueStore.getState().markTaskFailed(id)
    }
    
    const task = useSyncQueueStore.getState().queue.find(t => t.id === id)
    assert.equal(task.retryCount, 5)
    assert.equal(task.status, 'failed')
  })

  await t.test('deve remover tarefas completadas ao chamar clearCompleted', () => {
    const store = useSyncQueueStore.getState()
    const id1 = store.enqueue('sheets', 'upsert', { name: 'Treino A' })
    const id2 = store.enqueue('logs', 'upsert', { effort: 8 })
    
    store.updateTaskStatus(id1, 'completed')
    store.clearCompleted()
    
    const queue = useSyncQueueStore.getState().queue
    assert.equal(queue.length, 1)
    assert.equal(queue[0].id, id2)
  })
})
