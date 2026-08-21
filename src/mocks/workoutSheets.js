// ============================================================
// mocks/workoutSheets.js — Fichas de treino + exercícios da ficha
// ============================================================

/** @type {import('../types').WorkoutSheet[]} */
export const seedWorkoutSheets = [
  {
    id: 'sheet-001',
    profileId: 'profile-001',
    name: 'Treino A – Push',
    description: 'Peito, Ombros e Tríceps',
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'sheet-002',
    profileId: 'profile-001',
    name: 'Treino B – Pull',
    description: 'Costas e Bíceps',
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'sheet-003',
    profileId: 'profile-001',
    name: 'Treino C – Legs',
    description: 'Quadríceps, Posterior e Glúteos',
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
]

/** @type {import('../types').SheetExercise[]} */
export const seedSheetExercises = [
  // ── Treino A – Push ────────────────────────────────────────
  { id: 'se-001', sheetId: 'sheet-001', exerciseId: 'ex-001', order: 1, targetSets: 4, targetRepsMin: 6,  targetRepsMax: 10, targetRestSeconds: 120, notes: 'Exercício principal' },
  { id: 'se-002', sheetId: 'sheet-001', exerciseId: 'ex-002', order: 2, targetSets: 3, targetRepsMin: 8,  targetRepsMax: 12, targetRestSeconds: 90,  notes: '' },
  { id: 'se-003', sheetId: 'sheet-001', exerciseId: 'ex-007', order: 3, targetSets: 3, targetRepsMin: 8,  targetRepsMax: 12, targetRestSeconds: 90,  notes: '' },
  { id: 'se-004', sheetId: 'sheet-001', exerciseId: 'ex-008', order: 4, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRestSeconds: 60,  notes: 'Cadência lenta' },
  { id: 'se-005', sheetId: 'sheet-001', exerciseId: 'ex-011', order: 5, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRestSeconds: 75,  notes: '' },
  { id: 'se-006', sheetId: 'sheet-001', exerciseId: 'ex-012', order: 6, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRestSeconds: 60,  notes: '' },
  // ── Treino B – Pull ────────────────────────────────────────
  { id: 'se-007', sheetId: 'sheet-002', exerciseId: 'ex-004', order: 1, targetSets: 4, targetRepsMin: 4,  targetRepsMax: 6,  targetRestSeconds: 180, notes: 'RPE 8' },
  { id: 'se-008', sheetId: 'sheet-002', exerciseId: 'ex-006', order: 2, targetSets: 4, targetRepsMin: 8,  targetRepsMax: 12, targetRestSeconds: 90,  notes: '' },
  { id: 'se-009', sheetId: 'sheet-002', exerciseId: 'ex-005', order: 3, targetSets: 3, targetRepsMin: 8,  targetRepsMax: 12, targetRestSeconds: 90,  notes: '' },
  { id: 'se-010', sheetId: 'sheet-002', exerciseId: 'ex-009', order: 4, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetRestSeconds: 60,  notes: '' },
  { id: 'se-011', sheetId: 'sheet-002', exerciseId: 'ex-010', order: 5, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRestSeconds: 60,  notes: '' },
  // ── Treino C – Legs ────────────────────────────────────────
  { id: 'se-012', sheetId: 'sheet-003', exerciseId: 'ex-013', order: 1, targetSets: 4, targetRepsMin: 6,  targetRepsMax: 10, targetRestSeconds: 150, notes: 'Principal' },
  { id: 'se-013', sheetId: 'sheet-003', exerciseId: 'ex-014', order: 2, targetSets: 4, targetRepsMin: 10, targetRepsMax: 15, targetRestSeconds: 90,  notes: '' },
  { id: 'se-014', sheetId: 'sheet-003', exerciseId: 'ex-015', order: 3, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetRestSeconds: 60,  notes: '' },
  { id: 'se-015', sheetId: 'sheet-003', exerciseId: 'ex-016', order: 4, targetSets: 4, targetRepsMin: 10, targetRepsMax: 15, targetRestSeconds: 90,  notes: '' },
]
