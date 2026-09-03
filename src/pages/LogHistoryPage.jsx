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
        <div className="bg-brand-surface border border-brand-elevated rounded-xl py-16 text-center shadow-sm">
          <History size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary font-medium">Nenhum treino registrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((log) => {
            const sheet = sheets.find((s) => s.id === log.sheetId)
            const date  = new Date(log.startedAt).toLocaleDateString('pt-BR', {
              weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
            })
            return (
              <div key={log.id} className="bg-brand-surface border border-brand-elevated rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-text-primary text-sm">{sheet?.name ?? 'Treino'}</p>
                    <p className="text-xs text-text-secondary capitalize mt-0.5">{date}</p>
                    {log.notes && <p className="text-xs text-text-muted mt-1 italic">"{log.notes}"</p>}
                  </div>
                  <div className="flex gap-4 text-right text-sm">
                    <div>
                      <p className="text-xs text-text-muted font-medium">Duração</p>
                      <p className="font-bold text-text-primary">{log.durationMinutes ?? '–'} <span className="text-xs font-normal">min</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-medium">RPE</p>
                      <p className="font-bold text-brand-action">{log.perceivedEffort ?? '–'}<span className="text-xs font-normal text-text-muted">/10</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
