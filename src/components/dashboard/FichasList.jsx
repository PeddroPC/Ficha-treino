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
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[10px] font-bold text-text-primary uppercase tracking-widest">
          Minhas Fichas
        </h2>
        <span className="text-[10px] bg-brand-elevated text-text-secondary font-bold px-2 py-0.5 rounded-full">
          {active.length} Ativas
        </span>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
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
                'flex-shrink-0 text-left rounded-xl border px-4 py-2 transition-all min-w-[120px]',
                isSelected
                  ? 'border-brand-structural bg-brand-structural text-white shadow-sm'
                  : 'border-brand-elevated bg-brand-surface text-text-primary hover:border-brand-action hover:bg-brand-surface',
              ].join(' ')}
            >
              <div className="flex flex-col">
                <p className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-brand-structural'}`}>
                  {sheet.name}
                </p>
                <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-text-secondary'}`}>
                  <span className="font-medium">{exCount} ex</span>
                  {last && (
                    <span className="ml-1 opacity-75">({last})</span>
                  )}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
