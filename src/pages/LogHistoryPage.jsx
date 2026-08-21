// ============================================================
// pages/LogHistoryPage.jsx — Histórico de Execuções (stub Fase 1)
// ============================================================
import { PageHeader } from '../components/shared/PageHeader.jsx'
import { Card } from '../components/ui/Card.jsx'
import useLogStore from '../stores/useLogStore.js'
import useWorkoutStore from '../stores/useWorkoutStore.js'
import { History } from 'lucide-react'

export default function LogHistoryPage() {
  const logs   = useLogStore((s) => s.logs)
  const sheets = useWorkoutStore((s) => s.sheets)

  const sorted = [...logs].sort(
    (a, b) => new Date(b.startedAt) - new Date(a.startedAt)
  )

  return (
    <div>
      <PageHeader
        title="Histórico de Treinos"
        subtitle={`${logs.length} sessões registradas`}
      />

      {sorted.length === 0 ? (
        <Card className="py-16 text-center">
          <History size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Nenhum treino registrado</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((log) => {
            const sheet = sheets.find((s) => s.id === log.sheetId)
            const date  = new Date(log.startedAt).toLocaleDateString('pt-BR', {
              weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
            })
            return (
              <Card key={log.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{sheet?.name ?? 'Treino'}</p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{date}</p>
                    {log.notes && <p className="text-xs text-gray-500 mt-1 italic">"{log.notes}"</p>}
                  </div>
                  <div className="flex gap-4 text-right text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Duração</p>
                      <p className="font-medium text-gray-700">{log.durationMinutes ?? '–'} min</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">RPE</p>
                      <p className="font-bold text-gray-900">{log.perceivedEffort ?? '–'}/10</p>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
