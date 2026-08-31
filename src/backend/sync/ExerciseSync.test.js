import test from 'node:test'
import assert from 'node:assert/strict'
import useExerciseStore from '../../stores/useExerciseStore.js'
import useSyncQueueStore from '../../stores/useSyncQueueStore.js'
import { syncManager } from './SyncQueueManager.js'
import { ExerciseRepository } from '../repositories/ExerciseRepository.js'

test('Phase 4.1: Exercise Sync Flow', async (t) => {
  t.beforeEach(() => {
    useExerciseStore.getState().setExercises([])
    useSyncQueueStore.getState().clearQueue()
    syncManager.isProcessing = false
  })

  await t.test('CREATE: addExercise atualiza Zustand e cria task pending', () => {
    const exerciseId = useExerciseStore.getState().addExercise({ name: 'Supino', muscleGroup: 'Peito' })
    
    // Verifica Zustand local
    const ex = useExerciseStore.getState().exercises.find(e => e.id === exerciseId)
    assert.ok(ex)
    assert.equal(ex.name, 'Supino')

    // Verifica Fila
    const queue = useSyncQueueStore.getState().queue
    assert.equal(queue.length, 1)
    
    const task = queue[0]
    assert.equal(task.table, 'exercises')
    assert.equal(task.action, 'upsert')
    assert.equal(task.status, 'pending')
    assert.equal(task.entityId, exerciseId) // Regra Crítica de ID
    assert.equal(task.payload.id, exerciseId)
  })

  await t.test('UPDATE: updateExercise cria task upsert com mesmo entityId', () => {
    const exerciseId = useExerciseStore.getState().addExercise({ name: 'Supino', muscleGroup: 'Peito' })
    useSyncQueueStore.getState().clearQueue() // Limpa o create para isolar o teste

    useExerciseStore.getState().updateExercise(exerciseId, { name: 'Supino Inclinado' })
    
    const queue = useSyncQueueStore.getState().queue
    assert.equal(queue.length, 1)
    
    const task = queue[0]
    assert.equal(task.table, 'exercises')
    assert.equal(task.action, 'upsert')
    assert.equal(task.entityId, exerciseId)
    assert.equal(task.payload.name, 'Supino Inclinado')
  })

  await t.test('DELETE: removeExercise cria task delete com mesmo entityId', () => {
    const exerciseId = useExerciseStore.getState().addExercise({ name: 'Supino', muscleGroup: 'Peito' })
    useSyncQueueStore.getState().clearQueue() 

    useExerciseStore.getState().removeExercise(exerciseId)
    
    const queue = useSyncQueueStore.getState().queue
    assert.equal(queue.length, 1)
    
    const task = queue[0]
    assert.equal(task.table, 'exercises')
    assert.equal(task.action, 'delete')
    assert.equal(task.entityId, exerciseId)
  })

  await t.test('PROCESSAMENTO: Simular pending -> processing -> completed', async () => {
    // Mock do repository
    const originalUpsert = ExerciseRepository.upsert
    let called = false
    ExerciseRepository.upsert = async (payload) => { called = true }

    try {
      useExerciseStore.getState().addExercise({ name: 'Agachamento' })
      const queueBefore = useSyncQueueStore.getState().queue
      assert.equal(queueBefore[0].status, 'pending')

      await syncManager.processQueue()

      assert.equal(called, true)
      const queueAfter = useSyncQueueStore.getState().queue
      assert.equal(queueAfter.length, 0) // clearCompleted removeu a task
    } finally {
      ExerciseRepository.upsert = originalUpsert
    }
  })

  await t.test('FALHA DE REDE: pending -> processing -> network error -> fila interrompida', async () => {
    const originalUpsert = ExerciseRepository.upsert
    ExerciseRepository.upsert = async () => { throw new Error('Failed to fetch') }

    try {
      // Adiciona 2 tarefas
      useExerciseStore.getState().addExercise({ name: 'Ex 1' })
      useExerciseStore.getState().addExercise({ name: 'Ex 2' })
      
      await syncManager.processQueue()

      const queue = useSyncQueueStore.getState().queue
      // Como a fila foi interrompida no erro da primeira task, a segunda não foi processada
      // e a primeira voltou pra pending (estado seguro para retentar).
      assert.equal(queue.length, 2)
      assert.equal(queue[0].status, 'pending')
      assert.equal(queue[1].status, 'pending')
    } finally {
      ExerciseRepository.upsert = originalUpsert
    }
  })

  await t.test('IDEMPOTÊNCIA: Múltiplos updates usam o mesmo ID', () => {
    const exerciseId = useExerciseStore.getState().addExercise({ name: 'Teste' })
    useExerciseStore.getState().updateExercise(exerciseId, { name: 'Teste 2' })
    useExerciseStore.getState().updateExercise(exerciseId, { name: 'Teste 3' })
    
    const queue = useSyncQueueStore.getState().queue
    // Teremos 3 tasks na fila (o CREATE e os dois UPDATEs)
    assert.equal(queue.length, 3)
    
    // Todos devem apontar para o mesmo Supabase Row (mesmo ID)
    for (const task of queue) {
      assert.equal(task.entityId, exerciseId)
    }
  })
})
