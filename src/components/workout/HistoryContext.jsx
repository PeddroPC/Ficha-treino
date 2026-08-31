import { History } from 'lucide-react'
import useLogStore from '../../stores/useLogStore.js'

export function HistoryContext({ exerciseId, currentLogId = null, dark = false }) {
  const lastSessionSets = useLogStore((s) => s.getLastSessionSets(exerciseId, currentLogId))

  const baseText = dark ? 'text-gray-400' : 'text-gray-500'
  const highlightText = dark ? 'text-gray-200' : 'text-gray-800'
  const bg = dark ? 'bg-gray-900/50' : 'bg-blue-50/50'
  const border = dark ? 'border-gray-800' : 'border-blue-100'

  if (!lastSessionSets) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${bg} ${border} mb-3`}>
        <History size={14} className={baseText} />
        <span className={`text-xs font-medium ${baseText}`}>Primeira vez neste exercício</span>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-1.5 px-3 py-2.5 rounded-xl border ${bg} ${border} mb-3`}>
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
