// ============================================================
// pages/BodyMetricsPage.jsx
// Página de métricas corporais:
//   1. Painel de Tendência ("Estou no caminho certo?")
//   2. Calculadora de TMB (3 fórmulas + multiplicador de atividade)
//   3. Gráfico de evolução das medidas
//   4. Histórico de avaliações com edição/exclusão
// ============================================================
import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Minus as MinusIcon,
  PlusCircle, Pencil, Trash2, Ruler, Calculator,
  ChevronDown, CheckCircle, AlertCircle, Info,
} from 'lucide-react'
import { PageHeader }        from '../components/shared/PageHeader.jsx'
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal.jsx'
import { FormMeasurement }   from '../components/metrics/FormMeasurement.jsx'
import useMetricsStore       from '../stores/useMetricsStore.js'
import useProfileStore       from '../stores/useProfileStore.js'

// ── Campos trackáveis ──────────────────────────────────────
const TRACKED_FIELDS = [
  { key: 'weightKg',   label: 'Peso',        unit: 'kg',  higherIsBetter: true,  color: '#3b82f6' },
  { key: 'waistCm',    label: 'Cintura',      unit: 'cm',  higherIsBetter: false, color: '#ef4444' },
  { key: 'hipCm',      label: 'Quadril',      unit: 'cm',  higherIsBetter: null,  color: '#a855f7' },
  { key: 'chestCm',    label: 'Peitoral',     unit: 'cm',  higherIsBetter: true,  color: '#f97316' },
  { key: 'armCm',      label: 'Bícep',        unit: 'cm',  higherIsBetter: true,  color: '#22c55e' },
  { key: 'thighCm',    label: 'Coxa',         unit: 'cm',  higherIsBetter: true,  color: '#14b8a6' },
  { key: 'calfCm',     label: 'Panturrilha',  unit: 'cm',  higherIsBetter: true,  color: '#f59e0b' },
  { key: 'bodyFatPct', label: '% Gordura',    unit: '%',   higherIsBetter: false, color: '#ec4899' },
]

// ── Multiplicadores de atividade ───────────────────────────
const ACTIVITY_LEVELS = [
  { key: 'sedentary',   label: 'Sedentário (sem exercício)',      factor: 1.2   },
  { key: 'light',       label: 'Leve (1–3× semana)',              factor: 1.375 },
  { key: 'moderate',    label: 'Moderado (3–5× semana)',          factor: 1.55  },
  { key: 'active',      label: 'Muito ativo (6–7× semana)',       factor: 1.725 },
  { key: 'extra',       label: 'Extra ativo (2× por dia)',        factor: 1.9   },
]

// ── Cálculo de TMB ──────────────────────────────────────────
function calcAge(birthDate) {
  if (!birthDate) return null
  const born = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - born.getFullYear()
  const m = today.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--
  return age
}

function calcTMB(weightKg, heightCm, birthDate, gender) {
  if (!weightKg || !heightCm || !birthDate) return null
  const w = parseFloat(weightKg)
  const h = parseFloat(heightCm)
  const a = calcAge(birthDate)
  if (!a || a <= 0) return null
  const male = gender !== 'F' && gender !== 'female'

  return {
    harrisBenedictOriginal: male
      ? 66.5 + 13.75 * w + 5.003 * h - 6.75 * a
      : 655.1 + 9.563 * w + 1.85 * h - 4.676 * a,
    harrisBenedictRevised: male
      ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
      : 447.593 + 9.247 * w + 3.098 * h - 4.33 * a,
    mifflinStJeor: male
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161,
  }
}

// ── Formata data pt-BR ──────────────────────────────────────
const fmtDate = (iso) => {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

const fmtDateFull = (iso) => {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ── Componente de tendência ─────────────────────────────────
function TrendCard({ field, latest, previous }) {
  const latestVal  = latest?.[field.key]
  const prevVal    = previous?.[field.key]

  if (latestVal == null) return null

  const diff = prevVal != null ? latestVal - prevVal : null
  const hasProgress = diff !== null

  let status = 'neutral'
  if (hasProgress && field.higherIsBetter !== null) {
    if (field.higherIsBetter) status = diff >= 0 ? 'good' : 'bad'
    else status = diff <= 0 ? 'good' : 'bad'
  }

  const statusConfig = {
    good:    { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    bad:     { icon: AlertCircle, color: 'text-red-500',     bg: 'bg-red-500/10',     border: 'border-red-500/20'     },
    neutral: { icon: Info,        color: 'text-text-muted',  bg: 'bg-brand-base',     border: 'border-brand-elevated' },
  }
  const cfg = statusConfig[status]
  const Icon = cfg.icon
  const TrendIcon = !hasProgress ? MinusIcon : diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : MinusIcon
  const trendColor = !hasProgress
    ? 'text-text-muted'
    : field.higherIsBetter === null
    ? 'text-text-secondary'
    : status === 'good' ? 'text-emerald-500' : 'text-red-500'

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-3 flex items-center gap-3`}>
      <Icon size={18} className={`shrink-0 ${cfg.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-secondary truncate">{field.label}</p>
        <p className="text-base font-extrabold text-text-primary">
          {latestVal}{field.unit}
        </p>
      </div>
      <div className="text-right shrink-0">
        <TrendIcon size={14} className={trendColor} />
        {hasProgress && diff !== 0 && (
          <p className={`text-xs font-bold mt-0.5 ${trendColor}`}>
            {diff > 0 ? '+' : ''}{diff.toFixed(1)}{field.unit}
          </p>
        )}
        {!hasProgress && (
          <p className="text-xs text-text-muted mt-0.5">1ª med.</p>
        )}
      </div>
    </div>
  )
}

// ── Seção de Calculadora de TMB ─────────────────────────────
function TmbSection({ tmb, activityLevel, setActivityLevel, actFactor, profile, latestWeight }) {
  const missingFields = []
  if (!latestWeight && !profile?.weightKg) missingFields.push('peso')
  if (!profile?.heightCm) missingFields.push('altura')
  if (!profile?.birthDate) missingFields.push('data de nascimento')
  
  // O gênero sempre tem um padrão na fórmula (se não tiver F, é M), mas para ser didático:
  if (!profile?.gender) missingFields.push('gênero')

  const age = calcAge(profile?.birthDate)
  if (profile?.birthDate && (!age || age <= 0)) {
    missingFields.push('data de nascimento válida (idade > 0)')
  }

  return (
    <section className="bg-brand-surface rounded-2xl border border-brand-elevated p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Calculator size={18} className="text-blue-500" />
        <h2 className="text-sm font-bold text-text-primary">Calculadora de Gasto Calórico</h2>
      </div>
      <p className="text-xs text-text-muted mb-4">
        Baseado no seu peso, altura e data de nascimento do perfil + fator de atividade.
      </p>

      {!tmb ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-600">
          ⚠️ Complete seu perfil para ver os cálculos. Faltam preencher: <strong>{missingFields.join(', ')}</strong>.
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="activity-level" className="text-xs font-semibold text-text-secondary block mb-1.5">
              Nível de atividade física
            </label>
            <div className="relative">
              <select
                id="activity-level"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full appearance-none border border-brand-elevated rounded-xl px-3 py-2.5 pr-8 text-sm bg-brand-base text-text-primary focus:outline-none focus:border-brand-action transition-all"
              >
                {ACTIVITY_LEVELS.map((a) => (
                  <option key={a.key} value={a.key}>{a.label} (×{a.factor})</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { name: 'Harris-Benedict\nOriginal (1919)', shortName: 'H-B Original', tmbVal: tmb.harrisBenedictOriginal, desc: 'A fórmula clássica mais conhecida' },
              { name: 'Harris-Benedict\nRevisada (1984)', shortName: 'H-B Revisada', tmbVal: tmb.harrisBenedictRevised,  desc: 'Versão atualizada, mais precisa' },
              { name: 'Mifflin-St Jeor\n(Recomendada)',   shortName: 'Mifflin',      tmbVal: tmb.mifflinStJeor,         desc: 'Mais eficaz para sobrepeso e atletas' },
            ].map((formula) => {
              const tdee = Math.round(formula.tmbVal * actFactor)
              return (
                <div key={formula.shortName} className="bg-brand-action/5 border border-brand-action/20 rounded-xl p-3.5">
                  <p className="text-xs font-bold text-brand-action whitespace-pre-line leading-tight mb-1">{formula.name}</p>
                  <p className="text-xs text-text-muted mb-2">{formula.desc}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-text-secondary">TMB (repouso)</span>
                      <span className="text-sm font-bold text-text-primary">{Math.round(formula.tmbVal)} kcal</span>
                    </div>
                    <div className="flex justify-between items-baseline border-t border-brand-action/20 pt-1">
                      <span className="text-xs text-brand-action font-medium">TDEE (ativo)</span>
                      <span className="text-base font-extrabold text-brand-action">{tdee} kcal</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-text-muted mt-3 text-center">
            💡 TDEE = Total Daily Energy Expenditure. Coma próximo disso para manter o peso, acima para ganhar massa.
          </p>
        </>
      )}
    </section>
  )
}

// ── Componente principal ────────────────────────────────────
export default function BodyMetricsPage() {
  const measurements    = useMetricsStore((s) => s.measurements)
  const addMeasurement  = useMetricsStore((s) => s.addMeasurement)
  const updateMeasurement = useMetricsStore((s) => s.updateMeasurement)
  const removeMeasurement = useMetricsStore((s) => s.removeMeasurement)
  const profile         = useProfileStore((s) => s.profile)

  const [isFormOpen,    setIsFormOpen]    = useState(false)
  const [editingMeas,   setEditingMeas]   = useState(null)
  const [deletingMeas,  setDeletingMeas]  = useState(null)
  const [chartField,    setChartField]    = useState('weightKg')
  const [activityLevel, setActivityLevel] = useState('moderate')

  // ── Medições ordenadas ────────────────────────────────────
  const sorted  = useMemo(
    () => [...measurements].sort((a, b) => a.date.localeCompare(b.date)),
    [measurements]
  )
  const latest   = sorted[sorted.length - 1] ?? null
  const previous = sorted[sorted.length - 2] ?? null

  // ── Dados para gráfico ────────────────────────────────────
  const chartField_info = TRACKED_FIELDS.find((f) => f.key === chartField)
  const chartData = useMemo(
    () =>
      sorted
        .filter((m) => m[chartField] != null)
        .map((m) => ({ date: fmtDate(m.date), value: m[chartField] })),
    [sorted, chartField]
  )

  // ── Cálculo TMB ───────────────────────────────────────────
  const tmb = useMemo(
    () =>
      calcTMB(
        latest?.weightKg ?? profile?.weightKg,
        profile?.heightCm,
        profile?.birthDate,
        profile?.gender
      ),
    [latest, profile]
  )
  const actFactor = ACTIVITY_LEVELS.find((a) => a.key === activityLevel)?.factor ?? 1.55

  // ── Handlers ──────────────────────────────────────────────
  const handleSubmit = (data) => {
    if (editingMeas) updateMeasurement(editingMeas.id, data)
    else addMeasurement(data)
    setIsFormOpen(false)
    setEditingMeas(null)
  }

  const openEdit = (m) => {
    setEditingMeas(m)
    setIsFormOpen(true)
  }

  const handleClose = () => {
    setIsFormOpen(false)
    setEditingMeas(null)
  }

  const hasTMBData = !!tmb

  return (
    <div className="space-y-6">
      <PageHeader
        title="Métricas Corporais"
        subtitle="Acompanhe suas medidas e calcule seu gasto calórico"
        action={
          <button
            type="button"
            data-testid="btn-new-measurement"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <PlusCircle size={16} />
            Nova Avaliação
          </button>
        }
      />

      {/* Modal de formulário */}
      {isFormOpen && (
        <FormMeasurement
          measurement={editingMeas}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteModal
        isOpen={!!deletingMeas}
        onClose={() => setDeletingMeas(null)}
        onConfirm={() => removeMeasurement(deletingMeas.id)}
        itemName={deletingMeas ? fmtDateFull(deletingMeas.date) : ''}
        title="Excluir Avaliação"
        description="Isso removerá permanentemente todos os dados desta avaliação."
      />

      {measurements.length === 0 ? (
        /* ── Estado vazio ── */
        <div className="space-y-5">
          <div className="text-center py-14 bg-brand-surface rounded-2xl border border-brand-elevated shadow-sm">
            <Ruler size={48} className="text-text-muted mx-auto mb-4" />
            <h2 className="text-lg font-bold text-text-primary mb-2">Nenhuma avaliação ainda</h2>
            <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">
              Registre sua primeira avaliação para começar a acompanhar seu progresso corporal ao longo do tempo.
            </p>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Registrar Primeira Avaliação
            </button>
          </div>
          {/* Calculadora disponível mesmo sem avaliações */}
          <TmbSection tmb={tmb} activityLevel={activityLevel} setActivityLevel={setActivityLevel} actFactor={actFactor} profile={profile} latestWeight={latest?.weightKg} />
        </div>
      ) : (
        <div className="space-y-5">

          {/* ── 1. Painel de Tendência ────────────────────── */}
          <section className="bg-brand-surface rounded-2xl border border-brand-elevated p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-emerald-500" />
              <h2 className="text-sm font-bold text-text-primary">Estou no caminho certo?</h2>
              {latest && (
                <span className="ml-auto text-xs text-text-muted">
                  Última avaliação: {fmtDateFull(latest.date)}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {TRACKED_FIELDS.filter((f) => latest?.[f.key] != null).map((field) => (
                <TrendCard
                  key={field.key}
                  field={field}
                  latest={latest}
                  previous={previous}
                />
              ))}
            </div>
            {latest && Object.values(TRACKED_FIELDS).every((f) => latest[f.key] == null) && (
              <p className="text-sm text-text-muted text-center py-4">
                Nenhuma medida registrada na última avaliação.
              </p>
            )}
          </section>

          {/* ── 2. Gráfico de Evolução ────────────────────── */}
          {chartData.length >= 2 && (
            <section className="bg-brand-surface rounded-2xl border border-brand-elevated p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <h2 className="text-sm font-bold text-gray-700">Evolução ao Longo do Tempo</h2>
                <select
                  value={chartField}
                  onChange={(e) => setChartField(e.target.value)}
                  className="text-xs border border-brand-elevated rounded-lg px-2.5 py-1.5 bg-brand-base text-text-primary focus:outline-none focus:border-brand-action"
                  aria-label="Selecionar métrica para gráfico"
                >
                  {TRACKED_FIELDS.map((f) => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </select>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    unit={` ${chartField_info?.unit ?? ''}`}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    formatter={(v) => [`${v} ${chartField_info?.unit ?? ''}`, chartField_info?.label ?? '']}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={chartField_info?.label}
                    stroke={chartField_info?.color ?? '#3b82f6'}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: chartField_info?.color, strokeWidth: 0 }}
                    activeDot={{ r: 7 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </section>
          )}

          {chartData.length === 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center text-sm text-blue-600">
              📈 Adicione pelo menos 2 avaliações para ver o gráfico de evolução aparecer.
            </div>
          )}

          {/* ── 3. Calculadora de TMB ─────────────────────── */}
          <TmbSection tmb={tmb} activityLevel={activityLevel} setActivityLevel={setActivityLevel} actFactor={actFactor} profile={profile} latestWeight={latest?.weightKg} />

          {/* ── 4. Histórico de avaliações ────────────────── */}
          <section className="bg-brand-surface rounded-2xl border border-brand-elevated p-5 shadow-sm">
            <h2 className="text-sm font-bold text-text-primary mb-4">
              Histórico de Avaliações ({sorted.length})
            </h2>
            <div className="space-y-3">
              {[...sorted].reverse().map((m) => {
                const filled = TRACKED_FIELDS.filter((f) => m[f.key] != null)
                return (
                  <div
                    key={m.id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-brand-elevated hover:bg-brand-elevated transition-colors group"
                  >
                    {/* Data */}
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-emerald-500 leading-none">
                        {m.date.slice(8, 10)}
                      </span>
                      <span className="text-xs text-emerald-500/80 leading-none">
                        /{m.date.slice(5, 7)}
                      </span>
                      <span className="text-[10px] text-emerald-500/60 mt-0.5">
                        {m.date.slice(0, 4)}
                      </span>
                    </div>

                    {/* Medidas */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2">
                        {filled.map((f) => (
                          <span
                            key={f.key}
                            className="bg-brand-elevated text-text-secondary text-xs px-2 py-0.5 rounded-full font-bold"
                          >
                            {f.label}: <strong className="text-text-primary">{m[f.key]}{f.unit}</strong>
                          </span>
                        ))}
                      </div>
                      {m.notes && (
                        <p className="text-xs text-text-secondary mt-1.5 italic truncate">"{m.notes}"</p>
                      )}
                      {filled.length === 0 && (
                        <p className="text-xs text-text-muted">Nenhuma medida registrada</p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-1 items-end shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => openEdit(m)}
                        aria-label={`Editar avaliação de ${fmtDateFull(m.date)}`}
                        data-testid={`btn-edit-measurement-${m.id}`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingMeas(m)}
                        aria-label={`Excluir avaliação de ${fmtDateFull(m.date)}`}
                        data-testid={`btn-delete-measurement-${m.id}`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
