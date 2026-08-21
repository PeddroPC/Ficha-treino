// ============================================================
// components/dashboard/BodyMetrics.jsx
// Painel inferior direito: métricas corporais do perfil
// ============================================================
import useProfileStore from '../../stores/useProfileStore.js'
import { Scale } from 'lucide-react'

export function BodyMetrics() {
  const profile = useProfileStore((s) => s.profile)

  const metrics = [
    {
      label: 'Peso Atual',
      value: profile?.weightKg ? `${profile.weightKg}kg` : '–',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      label: 'BF%',
      value: '14.5%',   // placeholder — campo a adicionar no modelo futuramente
      color: 'text-orange-700',
      bg: 'bg-orange-50',
    },
    {
      label: 'Cintura',
      value: '84cm',    // placeholder
      color: 'text-purple-700',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Métricas Corporais
        </h2>
        <Scale size={14} className="text-gray-400" />
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {metrics.map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-lg p-2.5 text-center`}>
            <p className={`text-lg font-extrabold ${color} leading-none`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
        >
          Nova Avaliação
        </button>
        <button
          type="button"
          className="text-xs text-blue-500 hover:text-blue-700 font-medium px-2 py-2 transition-colors"
        >
          Estatísticas
        </button>
      </div>
    </div>
  )
}
