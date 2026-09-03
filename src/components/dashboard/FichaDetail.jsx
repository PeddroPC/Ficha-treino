// ============================================================
// components/dashboard/FichaDetail.jsx
// Painel direito: tabela de exercícios da ficha selecionada
// ============================================================
import useWorkoutStore from '../../stores/useWorkoutStore.js'
import useExerciseStore from '../../stores/useExerciseStore.js'
import useLogStore from '../../stores/useLogStore.js'

/**
 * @param {{ sheetId: string | null }} props
 */
export function FichaDetail({ sheetId }) {
  const sheets         = useWorkoutStore((s) => s.sheets)
  const sheetExercises = useWorkoutStore((s) => s.sheetExercises)
  const exercises      = useExerciseStore((s) => s.exercises)
  const sets           = useLogStore((s) => s.sets)
  const logs           = useLogStore((s) => s.logs)

  const sheet = sheets.find((s) => s.id === sheetId) ?? null

  const rows = sheetId
    ? [...sheetExercises]
        .filter((se) => se.sheetId === sheetId)
        .sort((a, b) => a.order - b.order)
        .map((se) => {
          const ex = exercises.find((e) => e.id === se.exerciseId)

          // Última carga registrada para este exercício nesta ficha
          const relevantLogIds = logs
            .filter((l) => l.sheetId === sheetId)
            .map((l) => l.id)
          const lastSets = sets.filter(
            (s) => relevantLogIds.includes(s.logId) && s.exerciseId === se.exerciseId
          )
          const lastWeight =
            lastSets.length > 0
              ? Math.max(...lastSets.map((s) => s.weightKg))
              : null

          return {
            id: se.id,
            name: ex?.name ?? '–',
            weight: lastWeight ? `${lastWeight}kg` : `${se.targetRepsMin}–${se.targetRepsMax} rep`,
            reps: `${se.targetRepsMin}–${se.targetRepsMax}`,
            sets: `${se.targetSets} sets`,
            rest: `${se.targetRestSeconds}s`,
          }
        })
    : []

  return (
    <div className="flex flex-col">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest truncate">
          {sheet?.name ?? 'Selecione uma Ficha'}
        </h2>
        {sheet && (
          <span className="text-xs bg-brand-surface text-brand-action border border-brand-elevated px-2 py-0.5 rounded-md font-medium shrink-0">
            Detalhes
          </span>
        )}
      </div>

      {!sheet ? (
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm py-8">
          ← Selecione uma ficha
        </div>
      ) : rows.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm py-8">
          Nenhum exercício cadastrado
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((row) => (
            <div
              key={row.id}
              className="bg-brand-surface border border-brand-elevated rounded-xl p-4 flex flex-col gap-3 shadow-sm"
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-base font-bold text-text-primary leading-tight">{row.name}</h3>
                <span className="bg-brand-structural text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg shrink-0 shadow-sm">
                  {row.weight}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 text-sm">
                <div className="bg-brand-base rounded-lg px-3 py-2 flex-1 flex flex-col items-center justify-center">
                  <span className="text-text-muted text-[10px] font-semibold uppercase">Reps</span>
                  <span className="text-brand-structural font-bold">{row.reps}</span>
                </div>
                <div className="bg-brand-base rounded-lg px-3 py-2 flex-1 flex flex-col items-center justify-center">
                  <span className="text-text-muted text-[10px] font-semibold uppercase">Sets</span>
                  <span className="text-brand-structural font-bold">{row.sets}</span>
                </div>
                <div className="bg-brand-base rounded-lg px-3 py-2 flex-1 flex flex-col items-center justify-center">
                  <span className="text-text-muted text-[10px] font-semibold uppercase">Descanso</span>
                  <span className="text-brand-structural font-bold">{row.rest}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
