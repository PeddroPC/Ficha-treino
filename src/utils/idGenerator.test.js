import test from 'node:test'
import assert from 'node:assert/strict'
import { generateId } from './idGenerator.js'

test('idGenerator Unit Tests', async (t) => {
  await t.test('deve gerar um ID sem prefixo', () => {
    const id = generateId()
    assert.ok(id)
    assert.equal(typeof id, 'string')
    // Verifica formato UUID simples (com ou sem hífens, mas o crypto.randomUUID tem hífens)
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  await t.test('deve gerar um ID com prefixo', () => {
    const id = generateId('sheet')
    assert.ok(id)
    assert.equal(typeof id, 'string')
    assert.ok(id.startsWith('sheet-'))
    assert.equal(id.length, 'sheet-'.length + 36) // prefixo + UUID
  })

  await t.test('deve gerar IDs únicos', () => {
    const id1 = generateId('log')
    const id2 = generateId('log')
    assert.notEqual(id1, id2)
  })

  await t.test('deve continuar compatível e gerar strings (mock de DB TEXT type)', () => {
    const id = generateId()
    const stringId = String(id)
    assert.strictEqual(id, stringId)
  })
})
