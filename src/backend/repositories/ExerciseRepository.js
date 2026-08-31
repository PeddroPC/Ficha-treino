import { supabase } from '../supabaseClient.js'

/**
 * ExerciseRepository
 * Lida com as operações de banco de dados para a tabela `exercises`.
 */
export const ExerciseRepository = {
  /**
   * Faz o upsert de um exercício no banco.
   * Transforma camelCase local para snake_case do Supabase.
   * 
   * @param {Object} exercise - Exercício local (Zustand state)
   * @returns {Promise<Object>}
   */
  async upsert(exercise) {
    // ⚠️ Em um sistema real autenticado, o user_id é injetado pelo Supabase Auth.
    // Como estamos na fase inicial e o RLS exige o user_id na policy,
    // usaremos a sessão atual. Se não houver sessão, a request falhará.
    
    // Obter a sessão atual para o user_id. Como estamos permitindo offline,
    // o SyncQueue só enviará se houver rede, e a auth é exigida.
    // (Opcionalmente, podemos tentar pegar da auth.getUser())
    const { data: authData, error: authError } = await supabase.auth.getUser()
    const userId = authData?.user?.id
    
    if (authError || !userId) {
      throw new Error('Usuário não autenticado. Não é possível sincronizar exercícios.')
    }

    const dbPayload = {
      id: exercise.id,
      user_id: userId,
      name: exercise.name,
      muscle_group: exercise.muscleGroup,
      is_custom: exercise.isCustom ?? true,
      created_at: exercise.createdAt ?? new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('exercises')
      .upsert(dbPayload, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Deleta um exercício.
   * 
   * @param {string} id - ID do exercício
   * @returns {Promise<void>}
   */
  async delete(id) {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
