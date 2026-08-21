// ============================================================
// mocks/executionLogs.js — Histórico de treinos executados
// Simula 8 semanas de treino PPL para popular o Dashboard.
// ============================================================

/** @type {import('../types').ExecutionLog[]} */
export const seedExecutionLogs = [
  { id: 'log-001', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: '2024-05-06T07:00:00Z', finishedAt: '2024-05-06T08:10:00Z', durationMinutes: 70, notes: '', perceivedEffort: 7 },
  { id: 'log-002', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: '2024-05-08T07:00:00Z', finishedAt: '2024-05-08T08:05:00Z', durationMinutes: 65, notes: '', perceivedEffort: 8 },
  { id: 'log-003', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: '2024-05-10T07:00:00Z', finishedAt: '2024-05-10T08:20:00Z', durationMinutes: 80, notes: 'Perna pesada', perceivedEffort: 9 },
  { id: 'log-004', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: '2024-05-13T07:00:00Z', finishedAt: '2024-05-13T08:15:00Z', durationMinutes: 75, notes: '', perceivedEffort: 7 },
  { id: 'log-005', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: '2024-05-15T07:00:00Z', finishedAt: '2024-05-15T08:10:00Z', durationMinutes: 70, notes: '', perceivedEffort: 8 },
  { id: 'log-006', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: '2024-05-17T07:00:00Z', finishedAt: '2024-05-17T08:25:00Z', durationMinutes: 85, notes: '', perceivedEffort: 8 },
  { id: 'log-007', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: '2024-05-20T07:00:00Z', finishedAt: '2024-05-20T08:10:00Z', durationMinutes: 70, notes: '', perceivedEffort: 7 },
  { id: 'log-008', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: '2024-05-22T07:00:00Z', finishedAt: '2024-05-22T08:00:00Z', durationMinutes: 60, notes: '', perceivedEffort: 6 },
  { id: 'log-009', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: '2024-05-24T07:00:00Z', finishedAt: '2024-05-24T08:20:00Z', durationMinutes: 80, notes: '', perceivedEffort: 9 },
  { id: 'log-010', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: '2024-05-27T07:00:00Z', finishedAt: '2024-05-27T08:15:00Z', durationMinutes: 75, notes: 'PR no supino!', perceivedEffort: 9 },
  { id: 'log-011', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: '2024-05-29T07:00:00Z', finishedAt: '2024-05-29T08:10:00Z', durationMinutes: 70, notes: '', perceivedEffort: 7 },
  { id: 'log-012', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: '2024-05-31T07:00:00Z', finishedAt: '2024-05-31T08:30:00Z', durationMinutes: 90, notes: '', perceivedEffort: 8 },
]

/**
 * ExecutionSets vinculados aos logs acima.
 * Representa a progressão de cargas ao longo das semanas.
 * @type {import('../types').ExecutionSet[]}
 */
export const seedExecutionSets = [
  // ── log-001 (Treino A – Push, semana 1) ───────────────────
  // Supino Reto (ex-001)
  { id: 'es-001', logId: 'log-001', exerciseId: 'ex-001', setNumber: 1, reps: 8,  weightKg: 80, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-002', logId: 'log-001', exerciseId: 'ex-001', setNumber: 2, reps: 8,  weightKg: 80, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-003', logId: 'log-001', exerciseId: 'ex-001', setNumber: 3, reps: 7,  weightKg: 80, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-004', logId: 'log-001', exerciseId: 'ex-001', setNumber: 4, reps: 6,  weightKg: 80, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },

  // ── log-004 (Treino A – Push, semana 2) ───────────────────
  { id: 'es-005', logId: 'log-004', exerciseId: 'ex-001', setNumber: 1, reps: 9,  weightKg: 80, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-006', logId: 'log-004', exerciseId: 'ex-001', setNumber: 2, reps: 8,  weightKg: 80, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-007', logId: 'log-004', exerciseId: 'ex-001', setNumber: 3, reps: 8,  weightKg: 80, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-008', logId: 'log-004', exerciseId: 'ex-001', setNumber: 4, reps: 7,  weightKg: 80, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },

  // ── log-007 (Treino A – Push, semana 3) ───────────────────
  { id: 'es-009', logId: 'log-007', exerciseId: 'ex-001', setNumber: 1, reps: 8,  weightKg: 82.5, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-010', logId: 'log-007', exerciseId: 'ex-001', setNumber: 2, reps: 8,  weightKg: 82.5, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-011', logId: 'log-007', exerciseId: 'ex-001', setNumber: 3, reps: 7,  weightKg: 82.5, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-012', logId: 'log-007', exerciseId: 'ex-001', setNumber: 4, reps: 6,  weightKg: 82.5, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },

  // ── log-010 (Treino A – Push, semana 4 — PR!) ─────────────
  { id: 'es-013', logId: 'log-010', exerciseId: 'ex-001', setNumber: 1, reps: 8,  weightKg: 85, restSeconds: 120, isDropSet: false, isPR: true,  notes: 'PR pessoal!' },
  { id: 'es-014', logId: 'log-010', exerciseId: 'ex-001', setNumber: 2, reps: 8,  weightKg: 85, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-015', logId: 'log-010', exerciseId: 'ex-001', setNumber: 3, reps: 7,  weightKg: 85, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-016', logId: 'log-010', exerciseId: 'ex-001', setNumber: 4, reps: 6,  weightKg: 85, restSeconds: 120, isDropSet: false, isPR: false, notes: '' },

  // ── log-002 (Treino B – Pull, semana 1) ───────────────────
  // Levantamento Terra (ex-004)
  { id: 'es-017', logId: 'log-002', exerciseId: 'ex-004', setNumber: 1, reps: 5, weightKg: 120, restSeconds: 180, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-018', logId: 'log-002', exerciseId: 'ex-004', setNumber: 2, reps: 5, weightKg: 120, restSeconds: 180, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-019', logId: 'log-002', exerciseId: 'ex-004', setNumber: 3, reps: 4, weightKg: 120, restSeconds: 180, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-020', logId: 'log-002', exerciseId: 'ex-004', setNumber: 4, reps: 4, weightKg: 120, restSeconds: 180, isDropSet: false, isPR: false, notes: '' },

  // ── log-005 (Treino B – Pull, semana 2) ───────────────────
  { id: 'es-021', logId: 'log-005', exerciseId: 'ex-004', setNumber: 1, reps: 5, weightKg: 125, restSeconds: 180, isDropSet: false, isPR: true,  notes: 'PR!' },
  { id: 'es-022', logId: 'log-005', exerciseId: 'ex-004', setNumber: 2, reps: 5, weightKg: 125, restSeconds: 180, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-023', logId: 'log-005', exerciseId: 'ex-004', setNumber: 3, reps: 4, weightKg: 125, restSeconds: 180, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-024', logId: 'log-005', exerciseId: 'ex-004', setNumber: 4, reps: 4, weightKg: 125, restSeconds: 180, isDropSet: false, isPR: false, notes: '' },

  // ── log-003 (Treino C – Legs, semana 1) ───────────────────
  // Agachamento (ex-013)
  { id: 'es-025', logId: 'log-003', exerciseId: 'ex-013', setNumber: 1, reps: 8, weightKg: 100, restSeconds: 150, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-026', logId: 'log-003', exerciseId: 'ex-013', setNumber: 2, reps: 8, weightKg: 100, restSeconds: 150, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-027', logId: 'log-003', exerciseId: 'ex-013', setNumber: 3, reps: 7, weightKg: 100, restSeconds: 150, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-028', logId: 'log-003', exerciseId: 'ex-013', setNumber: 4, reps: 6, weightKg: 100, restSeconds: 150, isDropSet: false, isPR: false, notes: '' },

  // ── log-009 (Treino C – Legs, semana 3) ───────────────────
  { id: 'es-029', logId: 'log-009', exerciseId: 'ex-013', setNumber: 1, reps: 8, weightKg: 105, restSeconds: 150, isDropSet: false, isPR: true,  notes: 'PR!' },
  { id: 'es-030', logId: 'log-009', exerciseId: 'ex-013', setNumber: 2, reps: 8, weightKg: 105, restSeconds: 150, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-031', logId: 'log-009', exerciseId: 'ex-013', setNumber: 3, reps: 7, weightKg: 105, restSeconds: 150, isDropSet: false, isPR: false, notes: '' },
  { id: 'es-032', logId: 'log-009', exerciseId: 'ex-013', setNumber: 4, reps: 6, weightKg: 105, restSeconds: 150, isDropSet: false, isPR: false, notes: '' },
]
