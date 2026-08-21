// ============================================================
// enums.js — Constantes de domínio do FitProgress
// Espelhadas em UPPER_SNAKE_CASE para facilitar migração para
// tipos/enums SQL/Prisma no futuro.
// ============================================================

export const MuscleGroup = Object.freeze({
  CHEST: 'CHEST',
  BACK: 'BACK',
  SHOULDERS: 'SHOULDERS',
  BICEPS: 'BICEPS',
  TRICEPS: 'TRICEPS',
  LEGS: 'LEGS',
  GLUTES: 'GLUTES',
  CORE: 'CORE',
  CALVES: 'CALVES',
  FULL_BODY: 'FULL_BODY',
})

export const MuscleGroupLabel = Object.freeze({
  CHEST: 'Peito',
  BACK: 'Costas',
  SHOULDERS: 'Ombros',
  BICEPS: 'Bíceps',
  TRICEPS: 'Tríceps',
  LEGS: 'Pernas',
  GLUTES: 'Glúteos',
  CORE: 'Core / Abdômen',
  CALVES: 'Panturrilha',
  FULL_BODY: 'Corpo Inteiro',
})

export const Equipment = Object.freeze({
  BARBELL: 'BARBELL',
  DUMBBELL: 'DUMBBELL',
  CABLE: 'CABLE',
  MACHINE: 'MACHINE',
  BODYWEIGHT: 'BODYWEIGHT',
  KETTLEBELL: 'KETTLEBELL',
  RESISTANCE_BAND: 'RESISTANCE_BAND',
})

export const EquipmentLabel = Object.freeze({
  BARBELL: 'Barra',
  DUMBBELL: 'Halter',
  CABLE: 'Cabo / Polia',
  MACHINE: 'Máquina',
  BODYWEIGHT: 'Peso Corporal',
  KETTLEBELL: 'Kettlebell',
  RESISTANCE_BAND: 'Elástico',
})

export const Goal = Object.freeze({
  HYPERTROPHY: 'HYPERTROPHY',
  STRENGTH: 'STRENGTH',
  ENDURANCE: 'ENDURANCE',
  WEIGHT_LOSS: 'WEIGHT_LOSS',
})

export const GoalLabel = Object.freeze({
  HYPERTROPHY: 'Hipertrofia',
  STRENGTH: 'Força',
  ENDURANCE: 'Resistência',
  WEIGHT_LOSS: 'Emagrecimento',
})
