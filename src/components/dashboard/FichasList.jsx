// ============================================================
// components/dashboard/FichasList.jsx — Painel esquerdo do Dashboard
// Lista as fichas ativas com frequência, exercícios e última sessão
// ============================================================
import useWorkoutStore from '../../stores/useWorkoutStore.js'
import useLogStore from '../../stores/useLogStore.js'

/**
 * @param {{ selectedSheetId: string|null, onSelect: (id: string) => void }} props
 */
export function FichasList({ selectedSheetId, onSelect }) {
  const sheets    = useWorkoutStore((s) => s.sheets)
  const sheetExercises = useWorkoutStore((s) => s.sheetExercises)
  const logs      = useLogStore((s) => s.logs)

  const active = sheets.filter((s) => s.isActive)

  /** Quantos exercícios tem a ficha */
  const countExercises = (sheetId) =>
    sheetExercises.filter((se) => se.sheetId === sheetId).length

  /** Última vez que a ficha foi executada */
  const lastSession = (sheetId) => {
    const relevant = logs
      .filter((l) => l.sheetId === sheetId)
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
    if (!relevant.length) return null
    const diff = Math.floor(
      (Date.now() - new Date(relevant[0].startedAt)) / 86400000
    )
    if (diff === 0) return 'Hoje'
    if (diff === 1) return 'Ontem'
    return `${diff} dias`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Minhas Fichas
        </h2>
        <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
          {active.length} Active
        </span>
      </div>

      <div className="space-y-2">
        {active.map((sheet, idx) => {
          const exCount = countExercises(sheet.id)
          const last    = lastSession(sheet.id)
          const isSelected = sheet.id === selectedSheetId

          return (
            <button
              key={sheet.id}
              type="button"
              onClick={() => onSelect(sheet.id)}
              className={[
                'w-full text-left rounded-lg border px-3 py-2.5 transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50',
              ].join(' ')}
            >
              <div className="flex items-start gap-2.5">
                {/* Número */}
                <span
                  className={[
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-500',
                  ].join(' ')}
                >
                  {idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                    {sheet.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    <span className="font-medium text-gray-500">{exCount} ex</span>
                    {last && (
                      <span className="ml-2">Last: {last}</span>
                    )}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
