// ============================================================
// pages/ProgressaoPage.jsx — Analytics de Progressão
//
// GRÁFICO DINÂMICO:
//   0 exercícios selecionados → Overview por Grupo Muscular
//   1–5 exercícios selecionados → Progressão de Cargas (linhas)
//
// SELETOR DE EXERCÍCIOS:
//   Busca em tempo real + limite de 5 seleções + contador
// ============================================================
import { useState, useMemo, useCallback, useRef } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
  AreaChart, Area,
} from 'recharts'
import { Trophy, TrendingUp, Target, Flame, Search, X as XIcon } from 'lucide-react'
import { PageHeader }    from '../components/shared/PageHeader.jsx'
import useLogStore       from '../stores/useLogStore.js'
import useExerciseStore  from '../stores/useExerciseStore.js'
import { MuscleGroupLabel } from '../constants/enums.js'

// ── Paleta de cores (até 5 exercícios) ─────────────────────
const PALETTE = ['#3b82f6', '#22c55e', '#ef4444', '#f97316', '#a855f7']
const MAX_SELECTED = 5

// ── Cores por grupo muscular (overview) ──────────────────────
const MUSCLE_COLORS = {
  CHEST:     '#3b82f6',
  BACK:      '#22c55e',
  LEGS:      '#f97316',
  SHOULDERS: '#a855f7',
  BICEPS:    '#ec4899',
  TRICEPS:   '#14b8a6',
  CORE:      '#f59e0b',
  GLUTES:    '#ef4444',
  CALVES:    '#6b7280',
  FULL_BODY: '#0ea5e9',
}

// ── Períodos ─────────────────────────────────────────────────
const PERIODS = [
  { key: '7d',  label: 'Semanal',  days: 7  },
  { key: '30d', label: 'Mensal',   days: 30 },
  { key: '90d', label: '3 Meses',  days: 90 },
]

// ── Helpers de data ───────────────────────────────────────────
const daysAgo = (n) => {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0,0,0,0); return d
}
const fmtDate = (iso) => { const [,m,d] = iso.split('-'); return `${d}/${m}` }
const weekKey = (dateObj) => {
  const d = new Date(dateObj); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0)
  return d.toISOString().slice(0, 10)
}

// ── Tooltip do gráfico de linhas ──────────────────────────────
function LineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-brand-surface border border-brand-elevated rounded-xl shadow-xl p-3 text-xs min-w-[190px]">
      <p className="font-bold text-text-primary mb-2 border-b border-brand-elevated pb-1">{label}</p>
      {payload.map((entry) => {
        const isPR   = entry.payload[`${entry.name}_isPR`]
        const volume = entry.payload[`${entry.name}_vol`]
        return (
          <div key={entry.name} className="mb-2 last:mb-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
              <span className="font-semibold" style={{ color: entry.color }}>{entry.name}</span>
              {isPR && <span className="text-amber-500">⭐ PR!</span>}
            </div>
            <p className="text-text-primary font-bold ml-3.5 text-sm">
              {entry.value} {entry.payload?.unit ?? 'kg'}
            </p>
            {volume > 0 && (
              <p className="text-text-muted ml-3.5">Vol: {volume.toLocaleString('pt-BR')} kg</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
export default function ProgressaoPage() {
  const [period,  setPeriod]  = useState('30d')
  const [search,  setSearch]  = useState('')

  // activeIds: Set de exerciseId selecionados (0 = overview)
  const [activeIds, setActiveIds] = useState(new Set())
  // colorMapRef: atribui cor estável por exercício
  const colorMapRef  = useRef({})
  const usedColorsRef = useRef(new Set())

  const allExercises = useExerciseStore((s) => s.exercises)
  const logs         = useLogStore((s) => s.logs)
  const sets         = useLogStore((s) => s.sets)

  const periodDays = PERIODS.find((p) => p.key === period)?.days ?? 30
  const cutoff     = useMemo(() => daysAgo(periodDays), [periodDays])

  // ── Modo do gráfico ───────────────────────────────────────
  const chartMode = activeIds.size === 0 ? 'overview' : 'specific'

  // ── Logs no período ───────────────────────────────────────
  const logsInPeriod = useMemo(
    () => logs.filter((l) => new Date(l.startedAt) >= cutoff),
    [logs, cutoff]
  )

  // ── Exercícios ativos com cores estáveis ─────────────────
  const activeExercises = useMemo(
    () => [...activeIds].map((id) => ({
      id,
      label: allExercises.find((e) => e.id === id)?.name ?? id,
      color: PALETTE[colorMapRef.current[id] ?? 0],
    })),
    [activeIds, allExercises]
  )

  // ── Exercícios filtrados pela busca ───────────────────────
  const filteredExercises = useMemo(() => {
    const q = search.toLowerCase().trim()
    return q ? allExercises.filter((e) => e.name.toLowerCase().includes(q)) : allExercises
  }, [allExercises, search])

  // ── Toggle exercício (com limite de MAX_SELECTED) ─────────
  const toggleEx = useCallback((id) => {
    setActiveIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        const ci = colorMapRef.current[id]
        if (ci !== undefined) { usedColorsRef.current.delete(ci); delete colorMapRef.current[id] }
      } else {
        if (next.size >= MAX_SELECTED) return prev
        let ci = 0
        while (usedColorsRef.current.has(ci)) ci++
        colorMapRef.current[id] = ci
        usedColorsRef.current.add(ci)
        next.add(id)
      }
      return next
    })
  }, [])

  // ── Dados: Progressão de cargas (modo specific) ───────────
  const progressionData = useMemo(() => {
    if (chartMode !== 'specific') return []
    const byDay = {}
    logsInPeriod.forEach((log) => {
      const day = log.startedAt.slice(0, 10)
      if (!byDay[day]) byDay[day] = []
      byDay[day].push(log.id)
    })
    return Object.entries(byDay).sort(([a],[b]) => a.localeCompare(b)).map(([day, logIds]) => {
      const point = { date: fmtDate(day) }
      activeExercises.forEach(({ id, label }) => {
        const rel = sets.filter((s) => logIds.includes(s.logId) && s.exerciseId === id)
        if (rel.length) {
          point[label]             = Math.max(...rel.map((s) => s.weightKg))
          point[`${label}_vol`]   = Math.round(rel.reduce((t, s) => t + s.weightKg * s.reps, 0))
          point[`${label}_isPR`]  = rel.some((s) => s.isPR)
          point.unit = 'kg'
        }
      })
      return point
    })
  }, [chartMode, logsInPeriod, sets, activeExercises])

  // ── Dados: Volume por Grupo Muscular (modo overview) ──────
  const muscleGroupData = useMemo(() => {
    if (chartMode !== 'overview') return []
    const byDay = {}
    logsInPeriod.forEach((log) => {
      const day = log.startedAt.slice(0, 10)
      if (!byDay[day]) byDay[day] = { date: fmtDate(day) }
      sets.filter((s) => s.logId === log.id).forEach((s) => {
        const ex = allExercises.find((e) => e.id === s.exerciseId)
        if (!ex) return
        const g = ex.muscleGroup
        byDay[day][g] = (byDay[day][g] ?? 0) + Math.round(s.weightKg * s.reps)
      })
    })
    return Object.values(byDay)
  }, [chartMode, logsInPeriod, sets, allExercises])

  // Grupos musculares presentes nos dados
  const presentGroups = useMemo(() => {
    const keys = new Set()
    muscleGroupData.forEach((pt) => Object.keys(pt).forEach((k) => {
      if (k !== 'date' && MUSCLE_COLORS[k]) keys.add(k)
    }))
    return [...keys]
  }, [muscleGroupData])

  // ── Frequência semanal ─────────────────────────────────────
  const frequencyData = useMemo(() => {
    const byWeek = {}
    logsInPeriod.forEach((log) => {
      const wk = weekKey(new Date(log.startedAt))
      byWeek[wk] = (byWeek[wk] ?? 0) + 1
    })
    return Object.entries(byWeek).sort(([a],[b]) => a.localeCompare(b))
      .map(([wk, treinos]) => ({ week: fmtDate(wk), treinos }))
  }, [logsInPeriod])

  // ── Estatísticas do painel lateral ────────────────────────
  const stats = useMemo(() => {
    const mCut = daysAgo(30), pCut = daysAgo(60)
    const thisIds = logs.filter((l) => new Date(l.startedAt) >= mCut).map((l) => l.id)
    const prevIds = logs.filter((l) => { const d = new Date(l.startedAt); return d >= pCut && d < mCut }).map((l) => l.id)
    const vol = (ids) => sets.filter((s) => ids.includes(s.logId)).reduce((t, s) => t + s.weightKg * s.reps, 0)
    const tv = vol(thisIds), pv = vol(prevIds)
    const pct = pv > 0 ? Math.round(((tv - pv) / pv) * 100) : null
    const prSets = [...sets.filter((s) => s.isPR)].sort((a, b) => {
      const la = logs.find((l) => l.id === a.logId)?.startedAt ?? ''
      const lb = logs.find((l) => l.id === b.logId)?.startedAt ?? ''
      return lb.localeCompare(la)
    })
    return { thisVol: tv, volPct: pct, latestPR: prSets[0] ?? null }
  }, [logs, sets])

  // ── Marcos ────────────────────────────────────────────────
  const milestones = useMemo(() =>
    (activeIds.size > 0 ? activeExercises : allExercises.slice(0, 3).map((e) => ({ id: e.id, label: e.name }))).map(({ id, label }) => {
      const exSets  = sets.filter((s) => s.exerciseId === id)
      const current = exSets.length ? Math.max(...exSets.map((s) => s.weightKg)) : 0
      const target  = Math.ceil((current + 0.1) / 5) * 5
      const pct     = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
      return { label, current, target, pct }
    }),
    [activeIds, activeExercises, allExercises, sets]
  )

  // ── Dot de PR ─────────────────────────────────────────────
  const makeDot = (label, color) => (props) => {
    const { cx, cy, payload } = props
    const isPR = payload[`${label}_isPR`]
    return (
      <g key={`dot-${cx}-${cy}-${label}`}>
        <circle cx={cx} cy={cy} r={isPR ? 6 : 3} fill={color}
          stroke={isPR ? '#fff' : 'none'} strokeWidth={isPR ? 2 : 0} />
        {isPR && <text x={cx} y={cy - 12} textAnchor="middle" fontSize={13}>⭐</text>}
      </g>
    )
  }

  // ── Chart titles dinâmicos ─────────────────────────────────
  const chartTitle = chartMode === 'specific' ? 'Progressão de Cargas' : 'Volume por Grupo Muscular'
  const chartYUnit = chartMode === 'specific' ? 'kg' : ''

  const mainData  = chartMode === 'specific' ? progressionData : muscleGroupData
  const mainLines = chartMode === 'specific'
    ? activeExercises.map(({ id, label, color }) => ({ key: id, label, color }))
    : presentGroups.map((g) => ({ key: g, label: MuscleGroupLabel[g] ?? g, color: MUSCLE_COLORS[g] }))

  return (
    <div>
      <PageHeader
        title="Progressão de Cargas"
        subtitle="Acompanhe a evolução das suas cargas ao longo do tempo"
      />

      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ── Coluna principal ────────────────────────────── */}
        <div className="flex-1 w-full min-w-0 space-y-5">

          {/* 1. Gráfico dinâmico */}
          <div className="bg-brand-surface rounded-xl border border-brand-elevated p-5" data-testid={chartMode === 'specific' ? 'chart-progression' : 'chart-muscle-group'}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">
                  {chartTitle}
                </h2>
                {chartMode === 'overview' && (
                  <p className="text-xs text-text-secondary mt-0.5">
                    Selecione exercícios para ver progressão de cargas
                  </p>
                )}
              </div>
              {/* Seletor de período */}
              <div className="flex bg-brand-base border border-brand-elevated rounded-lg p-0.5 gap-0.5">
                {PERIODS.map((p) => (
                  <button key={p.key} type="button" onClick={() => setPeriod(p.key)}
                    className={[
                      'px-3 py-1.5 rounded-md text-xs font-bold transition-colors',
                      period === p.key ? 'bg-brand-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary',
                    ].join(' ')}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {mainData.length < 2 ? (
              <div className="h-56 flex flex-col items-center justify-center gap-2">
                <TrendingUp size={32} className="text-brand-elevated" />
                <p className="text-text-muted text-sm font-medium">Sem dados neste período</p>
                <p className="text-text-secondary text-xs">Faça um Registro Rápido para alimentar o gráfico</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={248}>
                <LineChart data={mainData} margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-elevated)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false}
                    unit={chartYUnit} width={chartMode === 'specific' ? 48 : 56}
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                  <Tooltip content={<LineTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '14px', color: 'var(--color-text-primary)' }} iconType="circle" iconSize={8} />
                  {mainLines.map(({ key, label, color }) => (
                    <Line key={key} type="monotone" dataKey={label} stroke={color}
                      strokeWidth={2.5}
                      dot={chartMode === 'specific' ? makeDot(label, color) : { r: 3, fill: color, strokeWidth: 0 }}
                      activeDot={{ r: 7, stroke: color, strokeWidth: 2, fill: 'var(--color-brand-base)' }}
                      connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 3. Frequência + Marcos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-brand-surface rounded-xl border border-brand-elevated p-5">
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
                Frequência Semana a Semana
              </h2>
              {frequencyData.length < 2 ? (
                <div className="h-32 flex items-center justify-center text-text-muted text-xs">
                  Dados insuficientes
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={frequencyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-elevated)" />
                    <XAxis dataKey="week" tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip cursor={{stroke: 'var(--color-brand-elevated)', strokeWidth: 1}} contentStyle={{ backgroundColor: 'var(--color-brand-surface)', borderColor: 'var(--color-brand-elevated)', borderRadius: '0.75rem', color: 'var(--color-text-primary)' }} formatter={(v) => [`${v} treino${v !== 1 ? 's' : ''}`, 'Frequência']} />
                    <Area type="monotone" dataKey="treinos" stroke="var(--color-brand-action)" fill="var(--color-brand-action)" fillOpacity={0.15}
                      strokeWidth={2} dot={{ r: 3, fill: 'var(--color-brand-action)', strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-brand-surface rounded-xl border border-brand-elevated p-5">
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
                Próximos Marcos de Carga
              </h2>
              <div className="space-y-4">
                {milestones.map(({ label, current, target, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-xs font-semibold text-text-primary truncate pr-2">{label}</span>
                      <span className="text-xs text-text-secondary shrink-0">
                        {current > 0 ? `${current}kg` : '–'} → <span className="font-bold text-brand-action">{target}kg</span>
                      </span>
                    </div>
                    <div className="relative h-2 bg-brand-base rounded-full overflow-hidden border border-brand-elevated">
                      <div className="absolute left-0 top-0 h-full bg-brand-action rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-right text-[10px] font-bold text-text-muted mt-1 uppercase">{pct}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar direita ──────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">

          {/* Resumo de Evolução */}
          <div className="bg-brand-surface rounded-xl border border-brand-elevated p-5">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
              Resumo de Evolução
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-text-secondary mb-1 flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-500" />
                  Carga Total Levantada (Mês)
                </p>
                <p className="text-2xl font-extrabold text-text-primary">
                  {stats.thisVol >= 1000 ? `${(stats.thisVol / 1000).toFixed(1)} t` : `${Math.round(stats.thisVol).toLocaleString('pt-BR')} kg`}
                </p>
                {stats.volPct !== null && (
                  <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${stats.volPct >= 0 ? 'text-emerald-600' : 'text-brand-action'}`}>
                    {stats.volPct >= 0 ? '+' : ''}{stats.volPct}% vs mês anterior
                  </p>
                )}
              </div>
              {stats.latestPR && (
                <div className="border-t border-brand-elevated pt-4">
                  <p className="text-xs font-medium text-text-secondary flex items-center gap-1.5 mb-2">
                    <Trophy size={14} className="text-amber-500" />
                    Recorde Pessoal Recente
                  </p>
                  <p className="font-bold text-text-primary text-sm">
                    {allExercises.find((e) => e.id === stats.latestPR.exerciseId)?.name ?? '–'}
                  </p>
                  <p className="text-lg font-extrabold text-brand-action mt-0.5">
                    {stats.latestPR.weightKg} kg
                    <span className="text-xs font-medium text-text-muted ml-1.5">× {stats.latestPR.reps} reps</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Seletor de Exercícios com busca + limite ──── */}
          <div className="bg-brand-surface rounded-xl border border-brand-elevated p-5">
            {/* Cabeçalho + contador */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">
                Selecionar Exercícios
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                activeIds.size >= MAX_SELECTED
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-brand-base text-brand-action border border-brand-elevated'
              }`}>
                {activeIds.size}/{MAX_SELECTED}
              </span>
            </div>

            {/* Botão limpar seleção */}
            {activeIds.size > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveIds(new Set())
                  colorMapRef.current = {}
                  usedColorsRef.current = new Set()
                }}
                className="w-full text-xs font-bold text-text-muted hover:text-brand-action flex items-center justify-center gap-1.5 mb-3 py-1.5 rounded-lg hover:bg-brand-base transition-colors"
              >
                <XIcon size={12} />
                Limpar seleção (ver overview)
              </button>
            )}

            {/* Campo de busca — fixo no topo */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar exercício..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-sm font-medium border border-brand-elevated rounded-xl focus:outline-none focus:border-brand-action bg-brand-base text-text-primary placeholder-text-muted transition-colors"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}
                  aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                  <XIcon size={14} />
                </button>
              )}
            </div>

            {/* Lista com scroll */}
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredExercises.length === 0 && (
                <p className="text-xs font-medium text-text-muted text-center py-4">Nenhum exercício encontrado</p>
              )}
              {filteredExercises.map((ex) => {
                const isActive   = activeIds.has(ex.id)
                const isDisabled = !isActive && activeIds.size >= MAX_SELECTED
                const colorIdx   = colorMapRef.current[ex.id]
                const color      = isActive && colorIdx !== undefined ? PALETTE[colorIdx] : 'var(--color-brand-elevated)'

                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => !isDisabled && toggleEx(ex.id)}
                    disabled={isDisabled}
                    className={[
                      'w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl transition-all',
                      isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-brand-base',
                      isActive ? 'bg-brand-base border border-brand-elevated/50' : 'border border-transparent'
                    ].join(' ')}
                  >
                    {/* Checkbox customizado */}
                    <div className="w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors"
                      style={{ borderColor: isActive ? color : 'var(--color-brand-elevated)', backgroundColor: isActive ? color : 'transparent' }}>
                      {isActive && (
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5">
                          <path d="M1 4l3 3 5-6" stroke="var(--color-brand-base)" strokeWidth="2" fill="none"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs font-bold flex-1 truncate ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {ex.name}
                    </span>
                    {/* Bolinha de cor quando ativo */}
                    {isActive && (
                      <div className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Dica de estado */}
            <p className="text-[10px] font-bold text-text-muted mt-3 text-center leading-snug uppercase tracking-wide">
              {activeIds.size === 0
                ? 'Nenhum selecionado — overview por grupo'
                : activeIds.size >= MAX_SELECTED
                ? 'Limite de 5 atingido. Desmarque algum.'
                : `${MAX_SELECTED - activeIds.size} slot${MAX_SELECTED - activeIds.size !== 1 ? 's' : ''} disponível`}
            </p>
          </div>

          {/* Análise por Exercício */}
          <div className="bg-brand-surface rounded-xl border border-brand-elevated p-5">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Target size={14} className="text-brand-action" />
              Análise por Exercício
            </h3>
            <div className="space-y-4">
              {milestones.map(({ label, current }) => {
                const ex = allExercises.find((e) => e.name === label)
                const exSets = sets.filter((s) => s.exerciseId === ex?.id)
                  .sort((a, b) => {
                    const la = logs.find((l) => l.id === a.logId)?.startedAt ?? ''
                    const lb = logs.find((l) => l.id === b.logId)?.startedAt ?? ''
                    return la.localeCompare(lb)
                  })
                const prev = exSets.length > 1 ? exSets.at(-2).weightKg : null
                const diff = prev !== null ? current - prev : 0
                return (
                  <div key={label} className="flex items-center justify-between pb-3 border-b border-brand-elevated last:border-0 last:pb-0">
                    <div>
                      <p className="text-xs font-bold text-text-secondary">{label}</p>
                      <p className="text-xl font-extrabold text-text-primary mt-0.5">{current > 0 ? `${current} kg` : '–'}</p>
                    </div>
                    {diff !== 0 && (
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${diff > 0 ? 'border-emerald-500/20 text-emerald-700 bg-emerald-500/10' : 'border-brand-action/20 text-brand-action bg-brand-action/10'}`}>
                        {diff > 0 ? '+' : ''}{diff}kg
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
