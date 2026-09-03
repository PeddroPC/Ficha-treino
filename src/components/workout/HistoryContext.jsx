import { History } from 'lucide-react'
import { useMemo } from 'react'
import useLogStore from '../../stores/useLogStore.js'

export function HistoryContext({ exerciseId, currentLogId = null }) {
  const sets = useLogStore((s) => s.sets)
  const logs = useLogStore((s) => s.logs)

  const lastSessionSets = useMemo(() => {
    return useLogStore.getState().getLastSessionSets(exerciseId, currentLogId)
  }, [sets, logs, exerciseId, currentLogId])

  const baseText = 'text-text-muted'
  const highlightText = 'text-text-primary'
  const bg = 'bg-brand-surface border-brand-elevated'

  if (!lastSessionSets) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${bg} mb-3`}>
        <History size={14} className={baseText} />
        <span className={`text-xs font-medium ${baseText}`}>Primeira vez neste exercício</span>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-1.5 px-3 py-2.5 rounded-xl border ${bg} mb-3`}>
      <div className="flex items-center gap-2">
        <History size={14} className={baseText} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${baseText}`}>
          Última sessão
        </span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 pl-5">
        {lastSessionSets.map((set, i) => (
          <div key={i} className={`text-sm font-bold ${highlightText}`}>
            {set.weightKg} kg <span className={`text-xs font-normal ${baseText}`}>× {set.reps}</span>
          </div>
        ))}
      </div>
      <p className={`text-[10px] font-medium pl-5 mt-0.5 uppercase tracking-wide ${baseText}`}>
        Meta: superar
      </p>
    </div>
  )
}
