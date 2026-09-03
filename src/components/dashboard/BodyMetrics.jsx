// ============================================================
// components/dashboard/BodyMetrics.jsx
// Painel inferior direito: última avaliação + atalhos
// ============================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale, TrendingDown, TrendingUp, PlusCircle } from 'lucide-react'
import useMetricsStore   from '../../stores/useMetricsStore.js'
import { FormMeasurement } from '../metrics/FormMeasurement.jsx'

export function BodyMetrics() {
  const measurements   = useMetricsStore((s) => s.measurements)
  const addMeasurement = useMetricsStore((s) => s.addMeasurement)
  const navigate       = useNavigate()

  const [isFormOpen, setIsFormOpen] = useState(false)

  // Última + penúltima avaliações
  const sorted   = [...measurements].sort((a, b) => a.date.localeCompare(b.date))
  const latest   = sorted[sorted.length - 1] ?? null
  const previous = sorted[sorted.length - 2] ?? null

  const handleSave = (data) => {
    addMeasurement(data)
    setIsFormOpen(false)
  }

  const metrics = [
    {
      label: 'Peso',
      value: latest?.weightKg ? `${latest.weightKg}kg` : '–',
      color: 'text-blue-700',
      bg:    'bg-blue-50',
      prev:  previous?.weightKg,
      curr:  latest?.weightKg,
      higherIsBetter: true,
    },
    {
      label: 'Cintura',
      value: latest?.waistCm ? `${latest.waistCm}cm` : '–',
      color: 'text-rose-700',
      bg:    'bg-rose-50',
      prev:  previous?.waistCm,
      curr:  latest?.waistCm,
      higherIsBetter: false,
    },
    {
      label: 'Bícep',
      value: latest?.armCm ? `${latest.armCm}cm` : '–',
      color: 'text-emerald-700',
      bg:    'bg-emerald-50',
      prev:  previous?.armCm,
      curr:  latest?.armCm,
      higherIsBetter: true,
    },
  ]

  return (
    <>
      {isFormOpen && (
        <FormMeasurement
          onSubmit={handleSave}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-bold text-text-primary uppercase tracking-widest">
            Métricas Corporais
          </h2>
          <Scale size={14} className="text-brand-structural" />
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {metrics.map(({ label, value, prev, curr, higherIsBetter }) => {
            const diff = prev != null && curr != null ? curr - prev : null
            const isGood = diff === null ? null : higherIsBetter ? diff >= 0 : diff <= 0
            return (
              <div key={label} className="bg-brand-surface border border-brand-elevated rounded-xl p-3 text-center relative shadow-sm">
                <p className="text-lg font-extrabold text-brand-action leading-none">{value}</p>
                <p className="text-[10px] font-bold text-text-secondary mt-1 uppercase tracking-widest">{label}</p>
                {diff !== null && diff !== 0 && (
                  <div className={`absolute top-1.5 right-1.5 ${isGood ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {diff > 0 ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="btn-dashboard-new-measurement"
            onClick={() => setIsFormOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-brand-action hover:opacity-90 text-white text-xs font-bold py-3 px-3 rounded-xl transition-opacity shadow-sm shadow-brand-action/20"
          >
            <PlusCircle size={14} strokeWidth={2.5} />
            Nova Avaliação
          </button>
          <button
            type="button"
            onClick={() => navigate('/metricas')}
            className="text-xs text-brand-structural hover:text-brand-action font-bold px-4 py-3 transition-colors bg-brand-surface border border-brand-elevated rounded-xl shadow-sm"
          >
            Detalhes
          </button>
        </div>
      </div>
    </>
  )
}
