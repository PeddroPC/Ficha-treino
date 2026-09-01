import { getItem, STORAGE_KEYS } from '../../lib/localStorage.js'
import { WorkoutRepository } from '../repositories/WorkoutRepository.js'
import { LogRepository } from '../repositories/LogRepository.js'
import { MetricsRepository } from '../repositories/MetricsRepository.js'

export const MigrationService = {
  /**
   * Verifica se existe algum dado de treino relevante na base legacy
   */
  hasLegacyData: () => {
    // getItem usa o PREFIX padrão. Como não passamos sufixo, ele lê as chaves antigas sem o ID do usuário.
    const sheets = getItem(STORAGE_KEYS.WORKOUT_SHEETS)?.state?.sheets || []
    const logs = getItem(STORAGE_KEYS.EXECUTION_LOGS)?.state?.logs || []
    const metrics = getItem(STORAGE_KEYS.BODY_METRICS)?.state?.measurements || []
    
    return sheets.length > 0 || logs.length > 0 || metrics.length > 0
  },

  getLegacySummary: () => {
    const sheets = getItem(STORAGE_KEYS.WORKOUT_SHEETS)?.state?.sheets || []
    const logs = getItem(STORAGE_KEYS.EXECUTION_LOGS)?.state?.logs || []
    const metrics = getItem(STORAGE_KEYS.BODY_METRICS)?.state?.measurements || []
    const sets = getItem(STORAGE_KEYS.EXECUTION_LOGS)?.state?.sets || []
    
    return {
      sheetsCount: sheets.length,
      logsCount: logs.length,
      setsCount: sets.length,
      metricsCount: metrics.length
    }
  },

  /**
   * Envia os dados antigos (legacy) para o Supabase e vincula ao usuário autenticado.
   * Se der erro, lança exceção (não apaga os locais).
   */
  migrateLegacyToCloud: async () => {
    // 1. Snapshot da base local legada
    const sheetsStore = getItem(STORAGE_KEYS.WORKOUT_SHEETS)?.state || {}
    const logsStore = getItem(STORAGE_KEYS.EXECUTION_LOGS)?.state || {}
    const metricsStore = getItem(STORAGE_KEYS.BODY_METRICS)?.state || {}
    const exercisesStore = getItem(STORAGE_KEYS.EXERCISE_CATALOG)?.state || {}

    const sheets = sheetsStore.sheets || []
    const sheetExercises = sheetsStore.sheetExercises || []
    
    const logs = logsStore.logs || []
    const sets = logsStore.sets || []
    
    const metrics = metricsStore.measurements || []

    // Nota: Como Custom Exercises não têm repositório separado (eles têm, mas os defaults não sobem).
    // O FITPROGRESS original só usava catálogo estático na maioria. Não enviaremos exercícios agora, 
    // a menos que tivessem isCustom=true, mas eles vão quebrar a FK se não existirem.
    // O Supabase tem os exercícios padrão.

    // 2. Upload na ordem relacional

    // Fichas
    for (const sheet of sheets) {
      await WorkoutRepository.upsertSheet(sheet)
    }

    // Exercícios das fichas
    for (const se of sheetExercises) {
      await WorkoutRepository.upsertSheetExercise(se)
    }

    // Histórico de Treino
    for (const log of logs) {
      await LogRepository.upsertLog(log)
    }

    // Séries
    for (const set of sets) {
      await LogRepository.upsertSet(set)
    }

    // Métricas
    for (const metric of metrics) {
      await MetricsRepository.upsertMeasurement(metric)
    }
  },

  /**
   * Após sucesso, marca os dados antigos adicionando um sufixo ou movendo-os
   * para evitar nova proposta de migração futura.
   */
  markLegacyAsMigrated: () => {
    const rawSheets = localStorage.getItem(`fitprogress:${STORAGE_KEYS.WORKOUT_SHEETS}`)
    if (rawSheets) {
      localStorage.setItem(`fitprogress:${STORAGE_KEYS.WORKOUT_SHEETS}_migrated`, rawSheets)
      localStorage.removeItem(`fitprogress:${STORAGE_KEYS.WORKOUT_SHEETS}`)
    }
    
    const rawLogs = localStorage.getItem(`fitprogress:${STORAGE_KEYS.EXECUTION_LOGS}`)
    if (rawLogs) {
      localStorage.setItem(`fitprogress:${STORAGE_KEYS.EXECUTION_LOGS}_migrated`, rawLogs)
      localStorage.removeItem(`fitprogress:${STORAGE_KEYS.EXECUTION_LOGS}`)
    }
    
    const rawMetrics = localStorage.getItem(`fitprogress:${STORAGE_KEYS.BODY_METRICS}`)
    if (rawMetrics) {
      localStorage.setItem(`fitprogress:${STORAGE_KEYS.BODY_METRICS}_migrated`, rawMetrics)
      localStorage.removeItem(`fitprogress:${STORAGE_KEYS.BODY_METRICS}`)
    }
  },

  /**
   * Se o usuário escolher "Começar Vazio", apenas ocultamos o legacy sem deletar.
   */
  hideLegacy: () => {
    MigrationService.markLegacyAsMigrated()
  }
}
