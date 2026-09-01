import test from 'node:test'
import assert from 'node:assert/strict'
import { getActiveUserId, setActiveUserId, userBoundStorage, STORAGE_KEYS } from './localStorage.js'

test('localStorage Custom Storage Engine (Isolated Identities)', async (t) => {
  t.beforeEach(() => {
    // Limpar simulação do LocalStorage (no ambiente node nativo não há, vamos mockar se necessário ou usar um polyfill).
    // O Node.js não tem localStorage nativo, usaremos global.localStorage
    global.localStorage = {
      store: {},
      getItem(key) { return this.store[key] || null },
      setItem(key, value) { this.store[key] = value },
      removeItem(key) { delete this.store[key] },
      clear() { this.store = {} }
    }
  })

  await t.test('Deve lidar com usuário legacy (deslogado)', () => {
    setActiveUserId(null)
    
    assert.equal(getActiveUserId(), 'legacy')

    userBoundStorage.setItem('fitprogress:test', 'legacy-data')
    
    // A chave real gerada não deve ter sufixo
    assert.equal(global.localStorage.getItem('fitprogress:test'), 'legacy-data')
  })

  await t.test('Deve separar fisicamente os dados de dois usuários diferentes', () => {
    // Usuário A salva
    setActiveUserId('user-a')
    userBoundStorage.setItem('fitprogress:test', 'dados-do-a')

    // Usuário B salva
    setActiveUserId('user-b')
    userBoundStorage.setItem('fitprogress:test', 'dados-do-b')

    // Usuário A lê
    setActiveUserId('user-a')
    assert.equal(userBoundStorage.getItem('fitprogress:test'), 'dados-do-a')

    // Usuário B lê
    setActiveUserId('user-b')
    assert.equal(userBoundStorage.getItem('fitprogress:test'), 'dados-do-b')

    // Prova criptográfica da isolação real no storage
    assert.equal(global.localStorage.getItem('fitprogress:test_user-a'), 'dados-do-a')
    assert.equal(global.localStorage.getItem('fitprogress:test_user-b'), 'dados-do-b')
  })
})
