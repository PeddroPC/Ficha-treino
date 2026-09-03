// ============================================================
// pages/LogHistoryPage.jsx — Histórico de Execuções (stub Fase 1)
// ============================================================
import { useState } from 'react'
import { PageHeader } from '../components/shared/PageHeader.jsx'
import { Card } from '../components/ui/Card.jsx'
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal.jsx'
import { EditLogModal } from '../components/history/EditLogModal.jsx'
import useLogStore from '../stores/useLogStore.js'
import useWorkoutStore from '../stores/useWorkoutStore.js'
import { History, Pencil, Trash2 } from 'lucide-react'

export default function LogHistoryPage() {
  const logs   = useLogStore((s) => s.logs)
  const removeLog = useLogStore((s) => s.removeLog)
  const sheets = useWorkoutStore((s) => s.sheets)

  const [editingLog, setEditingLog] = useState(null)
  const [deletingLog, setDeletingLog] = useState(null)

  const sorted = [...logs].sort(
    (a, b) => new Date(b.startedAt) - new Date(a.startedAt)
  )

  const fmtDateFull = (iso) => {
    return new Date(iso).toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    })
  }

  return (
    <div className="pb-20">
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
            const date  = fmtDateFull(log.startedAt)
            
            return (
              <div key={log.id} className="bg-brand-surface border border-brand-elevated rounded-xl p-4 shadow-sm group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-text-primary text-sm">{sheet?.name ?? 'Treino'}</p>
                    <p className="text-xs text-text-secondary capitalize mt-0.5">{date}</p>
                    {log.notes && <p className="text-xs text-text-muted mt-2 italic border-l-2 border-brand-elevated pl-2">"{log.notes}"</p>}
                  </div>
                  <div className="flex gap-5 text-right text-sm items-start shrink-0 pl-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Duração</p>
                      <p className="font-bold text-text-primary mt-0.5">{log.durationMinutes ?? '–'} <span className="text-xs font-normal">min</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">RPE</p>
                      <p className="font-bold text-brand-action mt-0.5">{log.perceivedEffort ?? '–'}<span className="text-xs font-normal text-text-muted">/10</span></p>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 ml-2 border-l border-brand-elevated pl-3">
                      <button
                        type="button"
                        onClick={() => setEditingLog(log)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                        aria-label="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingLog(log)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                        aria-label="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <EditLogModal 
        isOpen={!!editingLog} 
        onClose={() => setEditingLog(null)} 
        log={editingLog} 
      />
      
      <ConfirmDeleteModal
        isOpen={!!deletingLog}
        onClose={() => setDeletingLog(null)}
        onConfirm={() => {
          if (deletingLog) removeLog(deletingLog.id)
        }}
        itemName={deletingLog ? `${sheets.find((s) => s.id === deletingLog.sheetId)?.name ?? 'Treino'} (${fmtDateFull(deletingLog.startedAt)})` : ''}
        title="Excluir Treino"
        description="Isso removerá permanentemente este registro e todas as séries associadas a ele. Essa ação não pode ser desfeita."
      />
    </div>
  )
}
