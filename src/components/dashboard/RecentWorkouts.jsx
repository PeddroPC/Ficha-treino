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
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[10px] font-bold text-text-primary uppercase tracking-widest">
          Treinos Recentes
        </h2>
        <a href="/historico" className="text-[10px] font-bold text-brand-action hover:underline uppercase">
          Ver todos
        </a>
      </div>

      <div className="bg-brand-surface border border-brand-elevated rounded-xl px-4 py-2 shadow-sm">
        {recent.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">
            Nenhum treino registrado ainda.
          </p>
        ) : (
          <div className="space-y-0">
            {recent.map((log) => {
              const sheet = sheets.find((s) => s.id === log.sheetId)
              const isDone = !!log.finishedAt

              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-3 border-b border-brand-elevated last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Clock size={16} className="text-amber-500 shrink-0" />
                    )}
                    <div>
                      <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
                        {formatDate(log.startedAt)}
                      </span>
                      <span className="mx-2 text-brand-elevated">·</span>
                      <span className="text-sm font-bold text-text-primary">
                        {sheet?.name ?? 'Treino'}
                      </span>
                    </div>
                  </div>
                  <span
                    className={[
                      'text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider',
                      isDone
                        ? 'border border-emerald-500/20 text-emerald-700 bg-emerald-500/10'
                        : 'border border-amber-500/20 text-amber-700 bg-amber-500/10',
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
    </div>
  )
}
