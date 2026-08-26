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

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Métricas Corporais
          </h2>
          <Scale size={14} className="text-gray-400" />
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {metrics.map(({ label, value, color, bg, prev, curr, higherIsBetter }) => {
            const diff = prev != null && curr != null ? curr - prev : null
            const isGood = diff === null ? null : higherIsBetter ? diff >= 0 : diff <= 0
            return (
              <div key={label} className={`${bg} rounded-lg p-2.5 text-center relative`}>
                <p className={`text-lg font-extrabold ${color} leading-none`}>{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
                {diff !== null && diff !== 0 && (
                  <div className={`absolute top-1.5 right-1.5 ${isGood ? 'text-emerald-500' : 'text-red-400'}`}>
                    {diff > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
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
            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
          >
            <PlusCircle size={13} />
            Nova Avaliação
          </button>
          <button
            type="button"
            onClick={() => navigate('/metricas')}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium px-2 py-2 transition-colors"
          >
            Ver Detalhes
          </button>
        </div>
      </div>
    </>
  )
}
