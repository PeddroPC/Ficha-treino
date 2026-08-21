// ============================================================
// mocks/exerciseCatalog.js — Catálogo base de exercícios
// ============================================================
import { MuscleGroup, Equipment } from '../constants/enums.js'

/** @type {import('../types').ExerciseCatalog[]} */
export const seedExerciseCatalog = [
  // ── PEITO ──────────────────────────────────────────────────
  {
    id: 'ex-001',
    name: 'Supino Reto com Barra',
    muscleGroup: MuscleGroup.CHEST,
    equipment: Equipment.BARBELL,
    instructions: 'Deite no banco, pegada um pouco mais larga que os ombros. Desça a barra até o peito e empurre de volta.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-002',
    name: 'Supino Inclinado com Halter',
    muscleGroup: MuscleGroup.CHEST,
    equipment: Equipment.DUMBBELL,
    instructions: 'Banco a 30–45°. Controle a descida, toque o peito e empurre.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-003',
    name: 'Crossover na Polia',
    muscleGroup: MuscleGroup.CHEST,
    equipment: Equipment.CABLE,
    instructions: 'Polia alta, cruze os braços à frente do tronco com leve flexão nos cotovelos.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // ── COSTAS ─────────────────────────────────────────────────
  {
    id: 'ex-004',
    name: 'Levantamento Terra',
    muscleGroup: MuscleGroup.BACK,
    equipment: Equipment.BARBELL,
    instructions: 'Barra sobre o metatarso, pegada pronada, coluna neutra. Empurre o chão e suba.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-005',
    name: 'Remada Curvada com Barra',
    muscleGroup: MuscleGroup.BACK,
    equipment: Equipment.BARBELL,
    instructions: 'Tronco a ~45°, puxe a barra em direção ao umbigo. Retraia as escápulas.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-006',
    name: 'Puxada Frontal (Lat Pulldown)',
    muscleGroup: MuscleGroup.BACK,
    equipment: Equipment.CABLE,
    instructions: 'Pegada pronada larga, puxe a barra até a altura do queixo mantendo o peito alto.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // ── OMBROS ─────────────────────────────────────────────────
  {
    id: 'ex-007',
    name: 'Desenvolvimento Militar com Barra',
    muscleGroup: MuscleGroup.SHOULDERS,
    equipment: Equipment.BARBELL,
    instructions: 'Em pé ou sentado, pressione a barra acima da cabeça sem arquear a lombar.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-008',
    name: 'Elevação Lateral com Halter',
    muscleGroup: MuscleGroup.SHOULDERS,
    equipment: Equipment.DUMBBELL,
    instructions: 'Braços levemente flexionados, eleve até a altura dos ombros. Controle a descida.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // ── BÍCEPS ─────────────────────────────────────────────────
  {
    id: 'ex-009',
    name: 'Rosca Direta com Barra',
    muscleGroup: MuscleGroup.BICEPS,
    equipment: Equipment.BARBELL,
    instructions: 'Cotovelos fixos ao tronco, curl completo com supinação.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-010',
    name: 'Rosca Martelo com Halter',
    muscleGroup: MuscleGroup.BICEPS,
    equipment: Equipment.DUMBBELL,
    instructions: 'Pegada neutra (polegar aponta para cima), curl alternado.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // ── TRÍCEPS ────────────────────────────────────────────────
  {
    id: 'ex-011',
    name: 'Tríceps Testa (Skull Crusher)',
    muscleGroup: MuscleGroup.TRICEPS,
    equipment: Equipment.BARBELL,
    instructions: 'Deitado, cotovelos fixos, desça a barra até a testa e estenda.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-012',
    name: 'Tríceps Corda na Polia',
    muscleGroup: MuscleGroup.TRICEPS,
    equipment: Equipment.CABLE,
    instructions: 'Polia alta com corda, pressione para baixo e abra as mãos na posição final.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // ── PERNAS ─────────────────────────────────────────────────
  {
    id: 'ex-013',
    name: 'Agachamento Livre com Barra',
    muscleGroup: MuscleGroup.LEGS,
    equipment: Equipment.BARBELL,
    instructions: 'Barra na trapézio, desça até a coxa paralela ao chão. Joelhos alinhados aos pés.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-014',
    name: 'Leg Press 45°',
    muscleGroup: MuscleGroup.LEGS,
    equipment: Equipment.MACHINE,
    instructions: 'Pés na largura dos ombros, desça até 90° no joelho sem travar na extensão.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-015',
    name: 'Cadeira Extensora',
    muscleGroup: MuscleGroup.LEGS,
    equipment: Equipment.MACHINE,
    instructions: 'Estenda completamente o joelho, segure 1s no topo e desça controlado.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // ── GLÚTEOS ────────────────────────────────────────────────
  {
    id: 'ex-016',
    name: 'Hip Thrust com Barra',
    muscleGroup: MuscleGroup.GLUTES,
    equipment: Equipment.BARBELL,
    instructions: 'Ombros no banco, barra no quadril, empurre o quadril para cima até extensão completa.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // ── CORE ───────────────────────────────────────────────────
  {
    id: 'ex-017',
    name: 'Prancha Abdominal',
    muscleGroup: MuscleGroup.CORE,
    equipment: Equipment.BODYWEIGHT,
    instructions: 'Apoio nos antebraços e pontas dos pés. Corpo reto, sem elevar o quadril.',
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
]
