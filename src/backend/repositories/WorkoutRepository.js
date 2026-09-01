import { supabase } from '../supabaseClient.js'

export const WorkoutRepository = {
  async _getUserId() {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    const userId = authData?.user?.id
    if (authError || !userId) {
      throw new Error('Usuário não autenticado. Não é possível sincronizar.')
    }
    return userId
  },

  /**
   * UPSERT: Ficha de Treino
   */
  async upsertSheet(sheet) {
    const userId = await this._getUserId()

    const dbPayload = {
      id: sheet.id,
      user_id: userId,
      name: sheet.name,
      is_active: sheet.isActive ?? true,
      created_at: sheet.createdAt ?? new Date().toISOString(),
      updated_at: sheet.updatedAt ?? new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('sheets')
      .upsert(dbPayload, { onConflict: 'id' })
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
  },

  // ============================================================
  // EXERCÍCIOS DA FICHA (sheet_exercises)
  // ============================================================

  async upsertSheetExercise(sheetExercise) {
    const userId = await this._getUserId()

    const dbPayload = {
      id: sheetExercise.id,
      user_id: userId,
      sheet_id: sheetExercise.sheetId,
      exercise_id: sheetExercise.exerciseId,
      order: sheetExercise.order,
      target_sets: sheetExercise.targetSets,
      target_reps_min: sheetExercise.targetRepsMin,
      target_reps_max: sheetExercise.targetRepsMax,
      target_rest_seconds: sheetExercise.targetRestSeconds,
    }

    const { data, error } = await supabase
      .from('sheet_exercises')
      .upsert(dbPayload, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteSheetExercise(id) {
    const { error } = await supabase
      .from('sheet_exercises')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
