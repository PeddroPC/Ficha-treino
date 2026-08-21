// ============================================================
// components/dashboard/RecentWorkouts.jsx
// Painel inferior esquerdo: últimas sessões com status
// ============================================================
import useLogStore from '../../stores/useLogStore.js'
import useWorkoutStore from '../../stores/useWorkoutStore.js'
import { CheckCircle, Clock } from 'lucide-react'

export function RecentWorkouts() {
  const logs   = useLogStore((s) => s.logs)
  const sheets = useWorkoutStore((s) => s.sheets)

  const recent = [...logs]
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
    .slice(0, 6)

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = d.toLocaleDateString('pt-BR', { month: 'short' })
      .replace('.', '')
      .replace(/^\w/, (c) => c.toUpperCase())
    return `${day}/${month}`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Treinos Recentes
        </h2>
        <a href="/historico" className="text-xs text-blue-500 hover:underline">
          Ver todos
        </a>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          Nenhum treino registrado ainda.
        </p>
      ) : (
        <div className="space-y-1">
          {recent.map((log) => {
            const sheet = sheets.find((s) => s.id === log.sheetId)
            const isDone = !!log.finishedAt

            return (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  {isDone ? (
                    <CheckCircle size={15} className="text-green-500 shrink-0" />
                  ) : (
                    <Clock size={15} className="text-orange-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs text-gray-500 font-medium">
                      {formatDate(log.startedAt)}
                    </span>
                    <span className="mx-2 text-gray-300">·</span>
                    <span className="text-xs font-semibold text-gray-800">
                      {sheet?.name ?? 'Treino'}
                    </span>
                  </div>
                </div>
                <span
                  className={[
                    'text-xs font-semibold px-2 py-0.5 rounded-full',
                    isDone
                      ? 'bg-green-50 text-green-600'
                      : 'bg-orange-50 text-orange-600',
                  ].join(' ')}
                >
                  {isDone ? 'Completo' : 'Em andamento'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
