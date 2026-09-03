import { supabase } from '../supabaseClient.js'
import useWorkoutStore from '../../stores/useWorkoutStore.js'
import useLogStore from '../../stores/useLogStore.js'
import useMetricsStore from '../../stores/useMetricsStore.js'
import useExerciseStore from '../../stores/useExerciseStore.js'

export const SyncDownstream = {
  /**
   * Baixa todos os dados do usuário do Supabase e substitui o estado local.
   * Só deve ser chamado em um dispositivo "virgem" ou após confirmação.
   */
  restoreFromCloud: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      // 1. Buscar tudo (simultaneamente para otimizar, RLS já filtra por user_id)
      const [
        { data: exercises },
        { data: sheets },
        { data: sheetExercises },
        { data: logs },
        { data: sets },
        { data: metrics }
      ] = await Promise.all([
        supabase.from('exercises').select('*').or(`user_id.eq.${user.id},user_id.is.null`),
        supabase.from('sheets').select('*'),
        supabase.from('sheet_exercises').select('*'),
        supabase.from('logs').select('*'),
        supabase.from('sets').select('*'),
        supabase.from('metrics').select('*')
      ])

      // 2. Mapear de snake_case (banco) para camelCase (Zustand)
      
      const mapSheet = (s) => ({
        id: s.id,
        name: s.name,
        isActive: s.is_active,
        createdAt: s.created_at,
        updatedAt: s.updated_at
      })

      const mapSheetExercise = (se) => ({
        id: se.id,
        sheetId: se.sheet_id,
        exerciseId: se.exercise_id,
        order: se.order,
        targetSets: se.target_sets,
        targetRepsMin: se.target_reps_min,
        targetRepsMax: se.target_reps_max,
        targetRestSeconds: se.target_rest_seconds
      })

      const mapLog = (l) => ({
        id: l.id,
        sheetId: l.sheet_id,
        startedAt: l.started_at,
        finishedAt: l.finished_at,
        durationMinutes: l.duration_minutes,
        notes: l.notes,
        perceivedEffort: l.perceived_effort
      })

      const mapSet = (s) => ({
        id: s.id,
        logId: s.log_id,
        exerciseId: s.exercise_id,
        setNumber: s.set_number,
        reps: s.reps,
        weightKg: Number(s.weight_kg),
        restSeconds: s.rest_seconds,
        isDropSet: s.is_drop_set,
        isPR: s.is_pr,
        notes: s.notes
      })

      const mapMetric = (m) => ({
        id: m.id,
        date: m.date,
        weightKg: m.weight_kg ? Number(m.weight_kg) : null,
        bodyFatPct: m.body_fat_pct ? Number(m.body_fat_pct) : null,
        chestCm: m.chest_cm ? Number(m.chest_cm) : null,
        waistCm: m.waist_cm ? Number(m.waist_cm) : null,
        hipCm: m.hip_cm ? Number(m.hip_cm) : null,
        armCm: m.arm_cm ? Number(m.arm_cm) : null,
        thighCm: m.thigh_cm ? Number(m.thigh_cm) : null,
        calfCm: m.calf_cm ? Number(m.calf_cm) : null,
        notes: m.notes,
        createdAt: m.created_at,
        updatedAt: m.updated_at
      })

      const mapExercise = (e) => ({
        id: e.id,
        name: e.name,
        muscleGroup: e.muscle_group,
        isCustom: e.is_custom,
        createdAt: e.created_at
      })

      const mappedExercises = (exercises || []).map(mapExercise)
      const customExercises = mappedExercises.filter(e => e.isCustom)
      
      // Sempre atualizar o catálogo de exercícios, pois ele contém os exercícios do sistema (isCustom = false)
      const exerciseStore = useExerciseStore.getState()
      if (mappedExercises.length > 0) {
        exerciseStore.setExercises(mappedExercises)
      }

      // 3. Critério para verificar se a nuvem possui dados válidos (dados do USUÁRIO):
      const hasCloudData = (sheets?.length > 0) || (logs?.length > 0) || (metrics?.length > 0) || (customExercises.length > 0)

      if (hasCloudData) {
        // Atualizar as stores do Zustand localmente
        const workoutStore = useWorkoutStore.getState()
        workoutStore.setSheets((sheets || []).map(mapSheet))
        workoutStore.setSheetExercises((sheetExercises || []).map(mapSheetExercise))

        const logStore = useLogStore.getState()
        logStore.setLogs((logs || []).map(mapLog))
        logStore.setSets((sets || []).map(mapSet))

        const metricsStore = useMetricsStore.getState()
        metricsStore.setMeasurements((metrics || []).map(mapMetric))
      } else {
        console.log('[SyncDownstream] O banco de dados online está vazio para os dados deste usuário. Preservando os dados locais do usuário.')
      }

    } catch (error) {
      console.error('[SyncDownstream] Falha ao restaurar dados da nuvem', error)
      throw error
    }
  }
}
