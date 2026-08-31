import test from 'node:test'
import assert from 'node:assert/strict'

// Mocking o supabase client antes de importar o repositório
import { supabase } from '../supabaseClient.js'
import { WorkoutRepository } from './WorkoutRepository.js'

// Mock setup
const mockSupabase = {
  from: (table) => {
    return {
      insert: (data) => ({
        select: () => ({
          single: async () => {
            if (table === 'sheets') {
              return { data: { ...data[0], id: 'sheet-mock' }, error: null }
            }
            if (table === 'sheet_exercises') {
              return { data: { ...data[0], id: 'se-mock' }, error: null }
            }
            return { data: null, error: new Error('Table not mocked') }
          },
          async then(resolve) {
            if (table === 'sheet_exercises') {
              resolve({ data: data, error: null })
            }
          }
        })
      }),
      select: (query) => ({
        order: async (column, options) => {
          if (table === 'sheets') {
            return { data: [{ id: 'sheet-1', name: 'Mock Sheet' }], error: null }
          }
          return { data: [], error: null }
        }
      }),
      update: (updates) => ({
        eq: (col, val) => ({
          select: () => ({
            single: async () => {
              return { data: { id: val, ...updates }, error: null }
            }
          })
        })
      }),
      delete: () => ({
        eq: async (col, val) => {
          return { error: null }
        }
      })
    }
  }
}

// Intercepta a chamada para o supabaseClient original no escopo do Node
// Como usamos ES Modules e o node:test não suporta mocking de ESM de forma trivial
// sem flags experimentais, vamos injetar o mock diretamente no objeto instanciado
test('WorkoutRepository Unit Tests (Mocked)', async (t) => {
  
  // Guardamos a referência original (embora não deva ser chamada com chaves inválidas)
  const originalFrom = supabase.from
  
  t.beforeEach(() => {
    supabase.from = mockSupabase.from
  })

  t.afterEach(() => {
    supabase.from = originalFrom
  })

  await t.test('createSheet: deve formatar a chamada para a tabela sheets', async () => {
    const sheet = { name: 'Treino A', user_id: 'uuid-123' }
    const result = await WorkoutRepository.createSheet(sheet)
    
    assert.ok(result)
    assert.equal(result.id, 'sheet-mock')
    assert.equal(result.name, 'Treino A')
  })

  await t.test('getSheets: deve recuperar da tabela sheets e ordenar', async () => {
    const result = await WorkoutRepository.getSheets()
    assert.equal(result.length, 1)
    assert.equal(result[0].id, 'sheet-1')
  })

  await t.test('updateSheet: deve atualizar dados e retornar', async () => {
    const result = await WorkoutRepository.updateSheet('sheet-1', { name: 'Treino B' })
    assert.equal(result.name, 'Treino B')
    assert.equal(result.id, 'sheet-1')
  })

  await t.test('deleteSheet: deve chamar o delete corretamente', async () => {
    const result = await WorkoutRepository.deleteSheet('sheet-1')
    assert.equal(result, true)
  })

  await t.test('replaceSheetExercises: deve deletar e depois inserir os novos', async () => {
    const exercises = [{ exercise_id: 'ex-1', sheet_id: 'sheet-1', order: 1 }]
    const result = await WorkoutRepository.replaceSheetExercises('sheet-1', exercises)
    assert.equal(result.length, 1)
    assert.equal(result[0].exercise_id, 'ex-1')
  })
})
