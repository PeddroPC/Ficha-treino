import { supabase } from '../supabaseClient.js'

export const LogRepository = {
  /**
   * CREATE: Inicia um novo Log de Treino
   */
  async createLog(log) {
    const { data, error } = await supabase
      .from('logs')
      .insert([log])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * READ: Retorna os logs do usuário logado
   */
  async getLogs() {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('started_at', { ascending: false })

    if (error) throw error
    return data
  },

  /**
   * UPDATE: Finaliza ou edita um Log
   */
  async updateLog(id, updates) {
    const { data, error } = await supabase
      .from('logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * DELETE: Exclui um Log (exclui séries em cascata devido à FK)
   */
  async deleteLog(id) {
    const { error } = await supabase
      .from('logs')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // ============================================================
  // SÉRIES (sets)
  // ============================================================

  async addSet(exerciseSet) {
    const { data, error } = await supabase
      .from('sets')
      .insert([exerciseSet])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteSet(id) {
    const { error } = await supabase
      .from('sets')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}
