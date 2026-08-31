import { supabase } from '../supabaseClient.js'

export const WorkoutRepository = {
  /**
   * CREATE: Ficha de Treino
   */
  async createSheet(sheet) {
    const { data, error } = await supabase
      .from('sheets')
      .insert([sheet])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * READ: Retorna todas as Fichas de Treino do usuário logado
   */
  async getSheets() {
    const { data, error } = await supabase
      .from('sheets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  /**
   * UPDATE: Atualiza uma Ficha de Treino
   */
  async updateSheet(id, updates) {
    const { data, error } = await supabase
      .from('sheets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * DELETE: Exclui uma Ficha (exclui em cascata sheet_exercises)
   */
  async deleteSheet(id) {
    const { error } = await supabase
      .from('sheets')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // ============================================================
  // EXERCÍCIOS DA FICHA (sheet_exercises)
  // ============================================================

  async addSheetExercise(sheetExercise) {
    const { data, error } = await supabase
      .from('sheet_exercises')
      .insert([sheetExercise])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async replaceSheetExercises(sheetId, sheetExercises) {
    // 1. Remove antigos
    const { error: delError } = await supabase
      .from('sheet_exercises')
      .delete()
      .eq('sheet_id', sheetId)

    if (delError) throw delError

    // 2. Insere novos se houver
    if (sheetExercises.length === 0) return true

    const { data, error: insError } = await supabase
      .from('sheet_exercises')
      .insert(sheetExercises)
      .select()

    if (insError) throw insError
    return data
  }
}
