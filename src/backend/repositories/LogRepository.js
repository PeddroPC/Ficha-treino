import { supabase } from '../supabaseClient.js'

export const LogRepository = {
  async _getUserId() {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    const userId = authData?.user?.id
    if (authError || !userId) {
      throw new Error('Usuário não autenticado. Não é possível sincronizar.')
    }
    return userId
  },

  /**
   * UPSERT: Log de Treino
   */
  async upsertLog(log) {
    const userId = await this._getUserId()

    const dbPayload = {
      id: log.id,
      user_id: userId,
      sheet_id: log.sheetId,
      started_at: log.startedAt,
      finished_at: log.finishedAt,
      duration_minutes: log.durationMinutes,
      notes: log.notes,
      perceived_effort: log.perceivedEffort,
    }

    const { data, error } = await supabase
      .from('logs')
      .upsert(dbPayload, { onConflict: 'id' })
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
  },

  // ============================================================
  // SÉRIES (sets)
  // ============================================================

  async upsertSet(exerciseSet) {
    const userId = await this._getUserId()

    const dbPayload = {
      id: exerciseSet.id,
      user_id: userId,
      log_id: exerciseSet.logId,
      exercise_id: exerciseSet.exerciseId,
      set_number: exerciseSet.setNumber,
      reps: exerciseSet.reps,
      weight_kg: exerciseSet.weightKg,
      rest_seconds: exerciseSet.restSeconds,
      is_drop_set: exerciseSet.isDropSet ?? false,
      is_pr: exerciseSet.isPR ?? false,
      notes: exerciseSet.notes,
    }

    const { data, error } = await supabase
      .from('sets')
      .upsert(dbPayload, { onConflict: 'id' })
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
  }
}
