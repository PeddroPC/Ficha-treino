import test from 'node:test'
import assert from 'node:assert/strict'
import useLogStore from './useLogStore.js'

test('getLastSessionSets', async (t) => {
  // Configuração inicial: limpar a store
  const store = useLogStore.getState()
  store.setLogs([])
  store.setSets([])

  // Cria dados de mock
  const exerciseId = 'ex-1'
  const otherExerciseId = 'ex-2'
  
  // Treino 1 (Mais antigo)
  const log1 = { id: 'log-1', startedAt: '2023-01-01T10:00:00Z' }
  // Treino 2 (Sessão mais recente concluída)
  const log2 = { id: 'log-2', startedAt: '2023-01-02T10:00:00Z' }
  // Treino 3 (Sessão atual)
  const log3 = { id: 'log-3', startedAt: '2023-01-03T10:00:00Z' }

  store.setLogs([log1, log2, log3])

  // Sets para o log 1
  store.setSets([
    { logId: 'log-1', exerciseId, setNumber: 1, weightKg: 50, reps: 10 },
    { logId: 'log-1', exerciseId, setNumber: 2, weightKg: 50, reps: 10 },
    // Sets para o log 2 (A última sessão concluída deste exercício)
    { logId: 'log-2', exerciseId, setNumber: 1, weightKg: 60, reps: 8 },
    { logId: 'log-2', exerciseId, setNumber: 2, weightKg: 60, reps: 8 },
    // Sets para o log 2 mas outro exercício
    { logId: 'log-2', exerciseId: otherExerciseId, setNumber: 1, weightKg: 100, reps: 5 },
    // Sets para o log 3 (Sessão atual)
    { logId: 'log-3', exerciseId, setNumber: 1, weightKg: 65, reps: 5 }
  ])

  await t.test('Retorna as séries da última sessão concluída (ignorando a atual)', () => {
    // Simulando que 'log-3' é a sessão aberta no momento
    const result = useLogStore.getState().getLastSessionSets(exerciseId, 'log-3')
    
    assert.ok(result, 'O resultado não deve ser nulo')
    assert.equal(result.length, 2, 'Deve retornar as 2 séries da sessão anterior (log-2)')
    assert.equal(result[0].weightKg, 60, 'Deve retornar os dados da carga corretos da última sessão')
  })

  await t.test('Retorna null se não houver histórico anterior', () => {
    // Um exercício que nunca foi feito
    const result = useLogStore.getState().getLastSessionSets('ex-999', 'log-3')
    assert.equal(result, null, 'Deve retornar null se não há histórico')
  })

  await t.test('Retorna as séries da sessão atual se o currentLogId for nulo (cenário de QuickLog sem log criado ainda)', () => {
    // Se o log não foi criado ainda, a sessão mais recente é o log-3
    const result = useLogStore.getState().getLastSessionSets(exerciseId, null)
    
    assert.ok(result, 'O resultado não deve ser nulo')
    assert.equal(result.length, 1, 'Deve retornar 1 série')
    assert.equal(result[0].logId, 'log-3', 'Deve puxar do log mais recente disponível no banco')
    assert.equal(result[0].weightKg, 65, 'O peso deve bater com o log-3')
  })

  await t.test('Ignora corretamente dados incompletos ou exercícios diferentes', () => {
    const result = useLogStore.getState().getLastSessionSets(otherExerciseId, 'log-3')
    assert.ok(result)
    assert.equal(result.length, 1)
    assert.equal(result[0].weightKg, 100, 'Deve puxar corretamente o outro exercício')
  })
})
