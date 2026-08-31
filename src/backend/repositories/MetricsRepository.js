import { supabase } from '../supabaseClient.js'

export const MetricsRepository = {
  /**
   * CREATE: Adiciona uma nova avaliação corporal
   */
  async createMeasurement(measurement) {
    const { data, error } = await supabase
      .from('metrics')
      .insert([measurement])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * READ: Retorna todas as medições do usuário ordenadas por data
   */
  async getMeasurements() {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw error
    return data
  },

  /**
   * UPDATE: Atualiza uma medição específica
   */
  async updateMeasurement(id, updates) {
    const { data, error } = await supabase
      .from('metrics')
      .update(updates)
      .eq('id', id)
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
    return true
  }
}
