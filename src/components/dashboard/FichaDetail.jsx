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
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full flex flex-col">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest truncate">
          {sheet?.name ?? 'Selecione uma Ficha'}
        </h2>
        {sheet && (
          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-md font-medium shrink-0">
            Ficha ↓
          </span>
        )}
      </div>

      {!sheet ? (
        <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">
          ← Selecione uma ficha
        </div>
      ) : rows.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">
          Nenhum exercício cadastrado
        </div>
      ) : (
        <div className="overflow-auto flex-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-400 font-semibold">Exercício</th>
                <th className="text-center py-2 text-gray-400 font-semibold">Carga</th>
                <th className="text-center py-2 text-gray-400 font-semibold">Reps</th>
                <th className="text-center py-2 text-gray-400 font-semibold">Sets</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}
                >
                  <td className="py-2 pr-2 text-gray-800 font-medium leading-tight">{row.name}</td>
                  <td className="py-2 text-center text-blue-600 font-bold">{row.weight}</td>
                  <td className="py-2 text-center text-gray-600">{row.reps}</td>
                  <td className="py-2 text-center text-gray-500">{row.sets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
