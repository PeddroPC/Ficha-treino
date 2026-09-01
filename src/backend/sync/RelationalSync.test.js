import test from 'node:test'
import assert from 'node:assert/strict'
import useWorkoutStore from '../../stores/useWorkoutStore.js'
import useLogStore from '../../stores/useLogStore.js'
import useSyncQueueStore from '../../stores/useSyncQueueStore.js'
import { syncManager } from './SyncQueueManager.js'
import { WorkoutRepository } from '../repositories/WorkoutRepository.js'
import { LogRepository } from '../repositories/LogRepository.js'

test('Phase 4.2: Relational Sync Flow (Sheets & Logs)', async (t) => {
  t.beforeEach(() => {
    useWorkoutStore.getState().setSheets([])
    useWorkoutStore.getState().setSheetExercises([])
    useLogStore.getState().setLogs([])
    useLogStore.getState().setSets([])
    useSyncQueueStore.getState().clearQueue()
    syncManager.isProcessing = false
  })

  await t.test('CREATE sheet e CREATE sheet_exercise geram tasks sequenciais', () => {
    const sheetId = useWorkoutStore.getState().addSheet({ name: 'Treino A' })
    const exerciseId = 'ex-123'
    
    useWorkoutStore.getState().addSheetExercise({ sheetId, exerciseId, targetSets: 3 })
    
    const queue = useSyncQueueStore.getState().queue
    assert.equal(queue.length, 2)
    
    assert.equal(queue[0].table, 'sheets')
    assert.equal(queue[0].action, 'upsert')
    assert.equal(queue[0].entityId, sheetId)
    
    assert.equal(queue[1].table, 'sheet_exercises')
    assert.equal(queue[1].action, 'upsert')
    assert.equal(queue[1].payload.sheetId, sheetId) // FK exists
  })

  await t.test('DELETE sheet gera task delete sheet_exercise antes do delete sheet', () => {
    const sheetId = useWorkoutStore.getState().addSheet({ name: 'Treino A' })
    useWorkoutStore.getState().addSheetExercise({ sheetId, exerciseId: 'ex-1' })
    
    useSyncQueueStore.getState().clearQueue() // isola o delete

    useWorkoutStore.getState().removeSheet(sheetId)
    
    const queue = useSyncQueueStore.getState().queue
    assert.equal(queue.length, 2)
    
    // A ordem importa muito! sheet_exercises deleta ANTES do sheet para não quebrar cascade offline/online.
    assert.equal(queue[0].table, 'sheet_exercises')
    assert.equal(queue[0].action, 'delete')
    
    assert.equal(queue[1].table, 'sheets')
    assert.equal(queue[1].action, 'delete')
    assert.equal(queue[1].entityId, sheetId)
  })

  await t.test('FALHA DE REDE NO PAI: aborta loop e não processa o FILHO', async () => {
    const originalSheetUpsert = WorkoutRepository.upsertSheet
    const originalSheetExUpsert = WorkoutRepository.upsertSheetExercise
    
    WorkoutRepository.upsertSheet = async () => { throw new Error('Failed to fetch') } // erro de rede
    
    let childCalled = false
    WorkoutRepository.upsertSheetExercise = async () => { childCalled = true }

    try {
      const sheetId = useWorkoutStore.getState().addSheet({ name: 'Treino A' })
      useWorkoutStore.getState().addSheetExercise({ sheetId, exerciseId: 'ex-1' })
      
      await syncManager.processQueue()

      const queue = useSyncQueueStore.getState().queue
      assert.equal(queue.length, 2)
      assert.equal(queue[0].status, 'pending') // falhou e voltou pra pending
      assert.equal(queue[1].status, 'pending') // nem tentou
      assert.equal(childCalled, false, 'O filho não deve ser processado se o pai falhar')
    } finally {
      WorkoutRepository.upsertSheet = originalSheetUpsert
      WorkoutRepository.upsertSheetExercise = originalSheetExUpsert
    }
  })

  await t.test('CREATE log e CREATE set geram tasks sequenciais', () => {
    useLogStore.getState().addLog({ id: 'log-1', sheetId: 'sheet-1' })
    useLogStore.getState().addSet({ logId: 'log-1', exerciseId: 'ex-1', reps: 10 })
    
    const queue = useSyncQueueStore.getState().queue
    assert.equal(queue.length, 2)
    
    assert.equal(queue[0].table, 'logs')
    assert.equal(queue[1].table, 'sets')
    assert.equal(queue[1].payload.logId, 'log-1')
  })
})
