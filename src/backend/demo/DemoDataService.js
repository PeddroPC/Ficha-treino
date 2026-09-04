import { supabase } from '../supabaseClient.js'
import useWorkoutStore from '../../stores/useWorkoutStore.js'
import useLogStore from '../../stores/useLogStore.js'

export const DemoDataService = {
  /**
   * Avalia e injeta os dados de demonstração caso o usuário seja elegível.
   * Só deve ser chamado APÓS o sync downstream ser concluído.
   */
  seedDemoDataIfNeeded: async (user) => {
    if (!user) return

    try {
      // 1. Verificação 1: Cloud Flag (Sincronizada entre dispositivos via auth_users)
      if (user.user_metadata?.has_seen_demo) {
        console.log('[DemoDataService] Usuário já recebeu a demo (Cloud Flag). Abortando.')
        return
      }

      // 2. Verificação 2: IDs Determinísticos no Local (Zustand)
      const sheetDemoId = `demo_sheet_${user.id}`
      const workoutStore = useWorkoutStore.getState()
      
      const sheetExists = workoutStore.sheets.some(s => s.id === sheetDemoId)
      if (sheetExists) {
        console.log('[DemoDataService] Ficha de demo já existe localmente. Abortando.')
        return
      }

      // 3. Verificação 3: Logs de demonstração (caso ele tenha apagado a ficha mas os logs sobraram)
      const logDemoId = `demo_log_supino_1_${user.id}`
      const logStore = useLogStore.getState()
      if (logStore.logs.some(l => l.id === logDemoId)) {
        console.log('[DemoDataService] Logs de demo já existem localmente. Abortando.')
        return
      }

      // 4. Verificação 4: O usuário antigo já tem dados reais? (não podemos poluir a conta de um usuário antigo)
      // Se ele já tem fichas ou logs, mas não tem a flag (usuário criado antes dessa feature), não criamos a demo.
      if (workoutStore.sheets.length > 0 || logStore.logs.length > 0) {
        console.log('[DemoDataService] Usuário já possui dados reais. Abortando e atualizando flag.')
        await supabase.auth.updateUser({ data: { has_seen_demo: true } })
        return
      }

      // Se passou por todas as travas, criar os dados!
      console.log('[DemoDataService] Iniciando geração de dados de demonstração...')
      await DemoDataService._injectData(user.id, sheetDemoId)

      // Marcar na nuvem (Supabase Auth Metadata) para garantir idempotência em outros devices,
      // mesmo que o usuário apague os dados gerados localmente e na nuvem.
      await supabase.auth.updateUser({
        data: { has_seen_demo: true }
      })
      console.log('[DemoDataService] Geração concluída e flag salva na nuvem.')

    } catch (error) {
      console.error('[DemoDataService] Erro ao injetar dados de demonstração:', error)
    }
  },

  _injectData: async (userId, sheetDemoId) => {
    const workoutStore = useWorkoutStore.getState()
    const logStore = useLogStore.getState()

    // --- FICHA ---
    workoutStore.addSheet({
      id: sheetDemoId,
      name: 'Hipertrofia ABC (Demonstração)'
    })

    // Lista de exercícios requeridos com IDs do catálogo
    const exercisesConfig = [
      // TREINO A
      { id: `demo_se_1_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-peito-01', order: 1, targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, targetRestSeconds: 90 },
      { id: `demo_se_2_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-peito-05', order: 2, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRestSeconds: 90 },
      { id: `demo_se_3_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-peito-10', order: 3, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRestSeconds: 60 },
      { id: `demo_se_4_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-ombros-05', order: 4, targetSets: 4, targetRepsMin: 12, targetRepsMax: 15, targetRestSeconds: 60 },
      { id: `demo_se_5_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-triceps-01', order: 5, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRestSeconds: 60 },
      { id: `demo_se_6_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-triceps-06', order: 6, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRestSeconds: 60 },
      
      // TREINO B
      { id: `demo_se_7_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-costas-06', order: 7, targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, targetRestSeconds: 90 },
      { id: `demo_se_8_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-costas-08', order: 8, targetSets: 4, targetRepsMin: 8, targetRepsMax: 12, targetRestSeconds: 90 },
      { id: `demo_se_9_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-costas-05', order: 9, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRestSeconds: 90 },
      { id: `demo_se_10_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-costas-14', order: 10, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRestSeconds: 60 },
      { id: `demo_se_11_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-biceps-01', order: 11, targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRestSeconds: 60 },
      { id: `demo_se_12_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-biceps-03', order: 12, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRestSeconds: 60 },
      
      // TREINO C
      { id: `demo_se_13_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-pernas-01', order: 13, targetSets: 4, targetRepsMin: 6, targetRepsMax: 8, targetRestSeconds: 120 },
      { id: `demo_se_14_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-pernas-07', order: 14, targetSets: 4, targetRepsMin: 10, targetRepsMax: 12, targetRestSeconds: 120 },
      { id: `demo_se_15_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-pernas-12', order: 15, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRestSeconds: 90 },
      { id: `demo_se_16_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-pernas-13', order: 16, targetSets: 4, targetRepsMin: 10, targetRepsMax: 12, targetRestSeconds: 90 },
      { id: `demo_se_17_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-pernas-16', order: 17, targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRestSeconds: 90 },
      { id: `demo_se_18_${userId}`, sheetId: sheetDemoId, exerciseId: 'ex-panturrilha-01', order: 18, targetSets: 4, targetRepsMin: 12, targetRepsMax: 15, targetRestSeconds: 60 }
    ]

    workoutStore.replaceSheetExercises(sheetDemoId, exercisesConfig)

    // --- HISTÓRICO ---
    const msInDay = 24 * 60 * 60 * 1000
    const today = Date.now()
    const getPastDate = (daysAgo) => new Date(today - daysAgo * msInDay).toISOString()

    const createHistory = (baseLogId, exerciseId, historyData) => {
      historyData.forEach((data, index) => {
        const logId = `${baseLogId}_${index + 1}_${userId}`
        logStore.addLog({
          id: logId,
          sheetId: sheetDemoId,
          startedAt: getPastDate(data.daysAgo),
          finishedAt: getPastDate(data.daysAgo - 0.04), // approx 1 hora depois
          durationMinutes: 60,
          notes: 'Treino de demonstração',
          perceivedEffort: 7
        })

        // Adiciona apenas 1 set para representar o PR do dia
        logStore.addSet({
          id: `demo_set_${baseLogId}_${index + 1}_${userId}`,
          logId: logId,
          exerciseId: exerciseId,
          setNumber: 1,
          reps: data.reps,
          weightKg: data.weightKg,
          restSeconds: 90,
          isDropSet: false,
          isPR: false,
          notes: ''
        })
      })
    }

    // 1. Supino reto (ex-peito-01)
    createHistory('demo_log_supino', 'ex-peito-01', [
      { daysAgo: 24, weightKg: 60, reps: 10 },
      { daysAgo: 17, weightKg: 62.5, reps: 10 },
      { daysAgo: 10, weightKg: 65, reps: 9 },
      { daysAgo: 3, weightKg: 70, reps: 8 },
    ])

    // 2. Puxada alta (ex-costas-06)
    createHistory('demo_log_puxada', 'ex-costas-06', [
      { daysAgo: 23, weightKg: 55, reps: 10 },
      { daysAgo: 16, weightKg: 60, reps: 10 },
      { daysAgo: 9, weightKg: 60, reps: 12 },
      { daysAgo: 2, weightKg: 65, reps: 10 },
    ])

    // 3. Agachamento livre (ex-pernas-01)
    createHistory('demo_log_agachamento', 'ex-pernas-01', [
      { daysAgo: 22, weightKg: 70, reps: 8 },
      { daysAgo: 15, weightKg: 72.5, reps: 8 },
      { daysAgo: 8, weightKg: 75, reps: 8 },
      { daysAgo: 1, weightKg: 80, reps: 8 },
    ])
  }
}
