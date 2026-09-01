import { supabase } from '../supabaseClient.js'

export const MetricsRepository = {
  async _getUserId() {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    const userId = authData?.user?.id
    if (authError || !userId) {
      throw new Error('Usuário não autenticado. Não é possível sincronizar.')
    }
    return userId
  },

  /**
   * UPSERT: Avaliação corporal
   */
  async upsertMeasurement(measurement) {
    const userId = await this._getUserId()

    const dbPayload = {
      id: measurement.id,
      user_id: userId,
      date: measurement.date,
      weight_kg: measurement.weightKg,
      body_fat_pct: measurement.bodyFatPct,
      chest_cm: measurement.chestCm,
      waist_cm: measurement.waistCm,
      hip_cm: measurement.hipCm,
      arm_cm: measurement.armCm,
      thigh_cm: measurement.thighCm,
      calf_cm: measurement.calfCm,
      notes: measurement.notes,
      created_at: measurement.createdAt ?? new Date().toISOString(),
      updated_at: measurement.updatedAt ?? new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('metrics')
      .upsert(dbPayload, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * DELETE: Remove uma medição
   */
  async deleteMeasurement(id) {
    const { error } = await supabase
      .from('metrics')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
