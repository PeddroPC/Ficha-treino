// ============================================================
// mocks/executionLogs.js — Histórico de 3 meses de treino PPL
//
// 36 sessões · 12 semanas · ~220 séries
// Cobre todos os exercícios das fichas A (Push), B (Pull) e C (Legs)
// Progressão linear de cargas ao longo do tempo para popular
// todos os gráficos: progressão, volume, frequência e overview
// por grupo muscular.
//
// Datas RELATIVAS a hoje → o gráfico sempre tem dados visíveis.
// ============================================================

/** Retorna ISO string de N dias atrás às `hour`h UTC */
const ago = (days, hour = 7) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setUTCHours(hour, 0, 0, 0)
  return d.toISOString()
}

/** Gera N séries idênticas com carga `w` e `r` reps */
const sets = (logId, exId, n, w, r, startId, isPR = false) =>
  Array.from({ length: n }, (_, i) => ({
    id:          `${startId}-${i + 1}`,
    logId,
    exerciseId:  exId,
    setNumber:   i + 1,
    reps:        r,
    weightKg:    w,
    restSeconds: 90,
    isDropSet:   false,
    isPR:        isPR && i === 0,   // só a 1ª série marca PR
    notes:       isPR && i === 0 ? 'PR!' : '',
  }))

// ──────────────────────────────────────────────────────────────
// LOGS (36 sessões em 84 dias, ~3 treinos/semana)
// ──────────────────────────────────────────────────────────────
export const seedExecutionLogs = [
  // ── Semana 12 (84-78 dias atrás) ─────────────────────────
  { id: 'log-001', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: ago(84), finishedAt: ago(84, 8), durationMinutes: 70, notes: '', perceivedEffort: 6 },
  { id: 'log-002', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: ago(82), finishedAt: ago(82, 8), durationMinutes: 65, notes: '', perceivedEffort: 7 },
  { id: 'log-003', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: ago(80), finishedAt: ago(80, 8), durationMinutes: 80, notes: '', perceivedEffort: 7 },
  // ── Semana 11 ─────────────────────────────────────────────
  { id: 'log-004', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: ago(77), finishedAt: ago(77, 8), durationMinutes: 72, notes: '', perceivedEffort: 7 },
  { id: 'log-005', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: ago(75), finishedAt: ago(75, 8), durationMinutes: 68, notes: '', perceivedEffort: 8 },
  { id: 'log-006', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: ago(73), finishedAt: ago(73, 8), durationMinutes: 82, notes: '', perceivedEffort: 8 },
  // ── Semana 10 ─────────────────────────────────────────────
  { id: 'log-007', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: ago(70), finishedAt: ago(70, 8), durationMinutes: 70, notes: '', perceivedEffort: 7 },
  { id: 'log-008', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: ago(68), finishedAt: ago(68, 8), durationMinutes: 66, notes: '', perceivedEffort: 7 },
  { id: 'log-009', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: ago(66), finishedAt: ago(66, 8), durationMinutes: 85, notes: '', perceivedEffort: 8 },
  // ── Semana 9 ──────────────────────────────────────────────
  { id: 'log-010', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: ago(63), finishedAt: ago(63, 8), durationMinutes: 73, notes: '', perceivedEffort: 8 },
  { id: 'log-011', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: ago(61), finishedAt: ago(61, 8), durationMinutes: 70, notes: 'PR Deadlift!', perceivedEffort: 9 },
  { id: 'log-012', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: ago(59), finishedAt: ago(59, 8), durationMinutes: 88, notes: '', perceivedEffort: 8 },
  // ── Semana 8 ──────────────────────────────────────────────
  { id: 'log-013', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: ago(56), finishedAt: ago(56, 8), durationMinutes: 75, notes: '', perceivedEffort: 7 },
  { id: 'log-014', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: ago(54), finishedAt: ago(54, 8), durationMinutes: 68, notes: '', perceivedEffort: 7 },
  { id: 'log-015', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: ago(52), finishedAt: ago(52, 8), durationMinutes: 83, notes: '', perceivedEffort: 9 },
  // ── Semana 7 ──────────────────────────────────────────────
  { id: 'log-016', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: ago(49), finishedAt: ago(49, 8), durationMinutes: 71, notes: '', perceivedEffort: 7 },
  { id: 'log-017', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: ago(47), finishedAt: ago(47, 8), durationMinutes: 72, notes: '', perceivedEffort: 8 },
  { id: 'log-018', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: ago(45), finishedAt: ago(45, 8), durationMinutes: 80, notes: '', perceivedEffort: 8 },
  // ── Semana 6 ──────────────────────────────────────────────
  { id: 'log-019', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: ago(42), finishedAt: ago(42, 8), durationMinutes: 74, notes: 'PR Supino!', perceivedEffort: 9 },
  { id: 'log-020', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: ago(40), finishedAt: ago(40, 8), durationMinutes: 70, notes: '', perceivedEffort: 8 },
  { id: 'log-021', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: ago(38), finishedAt: ago(38, 8), durationMinutes: 87, notes: '', perceivedEffort: 9 },
  // ── Semana 5 ──────────────────────────────────────────────
  { id: 'log-022', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: ago(35), finishedAt: ago(35, 8), durationMinutes: 73, notes: '', perceivedEffort: 7 },
  { id: 'log-023', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: ago(33), finishedAt: ago(33, 8), durationMinutes: 69, notes: '', perceivedEffort: 7 },
  { id: 'log-024', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: ago(31), finishedAt: ago(31, 8), durationMinutes: 82, notes: '', perceivedEffort: 8 },
  // ── Semana 4 ──────────────────────────────────────────────
  { id: 'log-025', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: ago(28), finishedAt: ago(28, 8), durationMinutes: 75, notes: '', perceivedEffort: 8 },
  { id: 'log-026', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: ago(26), finishedAt: ago(26, 8), durationMinutes: 71, notes: '', perceivedEffort: 8 },
  { id: 'log-027', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: ago(24), finishedAt: ago(24, 8), durationMinutes: 85, notes: '', perceivedEffort: 9 },
  // ── Semana 3 ──────────────────────────────────────────────
  { id: 'log-028', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: ago(21), finishedAt: ago(21, 8), durationMinutes: 74, notes: '', perceivedEffort: 7 },
  { id: 'log-029', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: ago(19), finishedAt: ago(19, 8), durationMinutes: 70, notes: '', perceivedEffort: 8 },
  { id: 'log-030', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: ago(17), finishedAt: ago(17, 8), durationMinutes: 88, notes: '', perceivedEffort: 8 },
  // ── Semana 2 ──────────────────────────────────────────────
  { id: 'log-031', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: ago(14), finishedAt: ago(14, 8), durationMinutes: 76, notes: '', perceivedEffort: 8 },
  { id: 'log-032', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: ago(12), finishedAt: ago(12, 8), durationMinutes: 72, notes: 'PR Deadlift!', perceivedEffort: 9 },
  { id: 'log-033', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: ago(10), finishedAt: ago(10, 8), durationMinutes: 90, notes: '', perceivedEffort: 9 },
  // ── Semana 1 (mais recente) ───────────────────────────────
  { id: 'log-034', profileId: 'profile-001', sheetId: 'sheet-001', startedAt: ago(7),  finishedAt: ago(7,  8), durationMinutes: 78, notes: 'PR Supino!', perceivedEffort: 9 },
  { id: 'log-035', profileId: 'profile-001', sheetId: 'sheet-002', startedAt: ago(5),  finishedAt: ago(5,  8), durationMinutes: 73, notes: '', perceivedEffort: 8 },
  { id: 'log-036', profileId: 'profile-001', sheetId: 'sheet-003', startedAt: ago(3),  finishedAt: ago(3,  8), durationMinutes: 92, notes: 'PR Agachamento!', perceivedEffort: 9 },
]

// ──────────────────────────────────────────────────────────────
// CARGA BASE POR EXERCÍCIO (semana 1, mais antiga = menor carga)
// Progressão: +2.5kg a cada 2 semanas nos compostos
//             +1.25kg a cada 2 semanas nos isoladores
// ──────────────────────────────────────────────────────────────
//
// Ficha A – Push: ex-001(Supino), ex-002(Supino Inc), ex-007(Dev Mil), ex-008(El Lat), ex-011(Triceps Testa), ex-012(Triceps Corda)
// Ficha B – Pull: ex-004(Terra), ex-006(Puxada), ex-005(Remada), ex-009(Rosca), ex-010(Martelo)
// Ficha C – Legs: ex-013(Agach), ex-014(Leg Press), ex-015(Cadeira), ex-016(Hip Thrust)

// Progressão de carga ao longo das 12 semanas
// Semana: 12→11→10→9→8→7→6→5→4→3→2→1
// Index:   0   1   2  3  4  5  6  7  8  9 10 11

const W = {
  // Supino (compostos: +2.5 cada 2 sem)
  sup:  [72.5, 72.5, 75,   75,   77.5, 77.5, 80,   80,   82.5, 82.5, 85,   87.5],
  // Supino Inclinado
  sinc: [52.5, 52.5, 55,   55,   57.5, 57.5, 60,   60,   62.5, 62.5, 65,   65  ],
  // Desenvolvimento Militar
  mil:  [45,   45,   47.5, 47.5, 50,   50,   52.5, 52.5, 55,   55,   57.5, 57.5],
  // Elevação Lateral (+1.25 cada 2 sem)
  elat: [8,    8,    9,    9,    10,   10,   11,   11,   12,   12,   12,   13  ],
  // Tríceps Testa
  tric: [27.5, 27.5, 30,   30,   32.5, 32.5, 35,   35,   37.5, 37.5, 37.5, 40  ],
  // Tríceps Corda
  cord: [22.5, 22.5, 25,   25,   27.5, 27.5, 30,   30,   32.5, 32.5, 32.5, 35  ],
  // Levantamento Terra (+2.5 cada 2 sem)
  dead: [115,  115,  120,  120,  122.5,122.5,125,  125,  127.5,127.5,130,  132.5],
  // Puxada Frontal
  pull: [52.5, 52.5, 55,   55,   57.5, 57.5, 60,   60,   62.5, 62.5, 65,   67.5],
  // Remada Curvada
  rem:  [60,   60,   62.5, 62.5, 65,   65,   67.5, 67.5, 70,   70,   72.5, 75  ],
  // Rosca Direta
  rosc: [30,   30,   32.5, 32.5, 35,   35,   37.5, 37.5, 40,   40,   40,   42.5],
  // Rosca Martelo
  mart: [14,   14,   15,   15,   16,   16,   17,   17,   18,   18,   18,   19  ],
  // Agachamento (+2.5 cada 2 sem)
  agac: [92.5, 92.5, 95,   95,   100,  100,  102.5,102.5,105,  105,  107.5,110  ],
  // Leg Press
  leg:  [160,  160,  170,  170,  180,  180,  190,  190,  200,  200,  210,  220  ],
  // Cadeira Extensora
  cad:  [45,   45,   47.5, 47.5, 50,   50,   52.5, 52.5, 55,   55,   57.5, 60  ],
  // Hip Thrust
  hip:  [80,   80,   85,   85,   90,   90,   95,   95,   100,  100,  105,  110  ],
}

// Log IDs mapeados ao índice de semana (12=0 ... 1=11)
// Cada log é uma sessão; 3 sessões/semana → índice = Math.floor(logNum / 3)
const wi = (logId) => {
  const num = parseInt(logId.replace('log-', '')) - 1   // 0-based
  return Math.floor(num / 3)                            // 0=semana mais antiga
}

// ──────────────────────────────────────────────────────────────
// GERADOR DE SETS
// ──────────────────────────────────────────────────────────────
let _setCounter = 0
const nextSetId = () => `es-${String(++_setCounter).padStart(3, '0')}`

const makeSets = (logId, exerciseId, n, w, r, isPR = false) =>
  Array.from({ length: n }, (_, i) => ({
    id:          nextSetId(),
    logId,
    exerciseId,
    setNumber:   i + 1,
    reps:        r,
    weightKg:    w,
    restSeconds: 90,
    isDropSet:   false,
    isPR:        isPR && i === 0,
    notes:       isPR && i === 0 ? 'PR!' : '',
  }))

// ──────────────────────────────────────────────────────────────
// SETS POR SESSÃO
// ──────────────────────────────────────────────────────────────
// Ficha A – Push (logs: 001,004,007,010,013,016,019,022,025,028,031,034)
const pushLogs = [
  'log-001','log-004','log-007','log-010','log-013',
  'log-016','log-019','log-022','log-025','log-028',
  'log-031','log-034',
]
// Ficha B – Pull (logs: 002,005,008,011,014,017,020,023,026,029,032,035)
const pullLogs = [
  'log-002','log-005','log-008','log-011','log-014',
  'log-017','log-020','log-023','log-026','log-029',
  'log-032','log-035',
]
// Ficha C – Legs (logs: 003,006,009,012,015,018,021,024,027,030,033,036)
const legsLogs = [
  'log-003','log-006','log-009','log-012','log-015',
  'log-018','log-021','log-024','log-027','log-030',
  'log-033','log-036',
]

// PRs notáveis (semana 9=idx3 supino, semana 6=idx6, semana 2=idx10, semana 1=idx11)
const isPRSupino = (idx) => [6, 11].includes(idx)
const isPRDead   = (idx) => [3, 10].includes(idx)
const isPRAgac   = (idx) => [6, 11].includes(idx)
const isPRRosc   = (idx) => [8].includes(idx)

export const seedExecutionSets = [

  // ════════════════════════════════════════════════════════════
  // PUSH — Peito, Ombros, Tríceps
  // ════════════════════════════════════════════════════════════
  ...pushLogs.flatMap((logId, idx) => [
    // Supino Reto – 4 séries
    ...makeSets(logId, 'ex-001', 4, W.sup[idx],  8, isPRSupino(idx)),
    // Supino Inclinado – 3 séries
    ...makeSets(logId, 'ex-002', 3, W.sinc[idx], 10),
    // Desenvolvimento Militar – 3 séries
    ...makeSets(logId, 'ex-007', 3, W.mil[idx],  10),
    // Elevação Lateral – 3 séries
    ...makeSets(logId, 'ex-008', 3, W.elat[idx], 12),
    // Tríceps Testa – 3 séries
    ...makeSets(logId, 'ex-011', 3, W.tric[idx], 10),
    // Tríceps Corda – 3 séries
    ...makeSets(logId, 'ex-012', 3, W.cord[idx], 12),
  ]),

  // ════════════════════════════════════════════════════════════
  // PULL — Costas, Bíceps
  // ════════════════════════════════════════════════════════════
  ...pullLogs.flatMap((logId, idx) => [
    // Levantamento Terra – 4 séries
    ...makeSets(logId, 'ex-004', 4, W.dead[idx], 5, isPRDead(idx)),
    // Puxada Frontal – 4 séries
    ...makeSets(logId, 'ex-006', 4, W.pull[idx], 10),
    // Remada Curvada – 3 séries
    ...makeSets(logId, 'ex-005', 3, W.rem[idx],  10),
    // Rosca Direta – 3 séries
    ...makeSets(logId, 'ex-009', 3, W.rosc[idx], 10, isPRRosc(idx)),
    // Rosca Martelo – 3 séries
    ...makeSets(logId, 'ex-010', 3, W.mart[idx], 12),
  ]),

  // ════════════════════════════════════════════════════════════
  // LEGS — Pernas, Glúteos
  // ════════════════════════════════════════════════════════════
  ...legsLogs.flatMap((logId, idx) => [
    // Agachamento – 4 séries
    ...makeSets(logId, 'ex-013', 4, W.agac[idx], 8, isPRAgac(idx)),
    // Leg Press – 4 séries
    ...makeSets(logId, 'ex-014', 4, W.leg[idx],  12),
    // Cadeira Extensora – 3 séries
    ...makeSets(logId, 'ex-015', 3, W.cad[idx],  15),
    // Hip Thrust – 4 séries
    ...makeSets(logId, 'ex-016', 4, W.hip[idx],  12),
  ]),
]
