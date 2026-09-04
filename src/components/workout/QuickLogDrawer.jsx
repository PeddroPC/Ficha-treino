// ============================================================
// components/workout/QuickLogDrawer.jsx
// Drawer inicial para selecionar Ficha e Data antes de treinar
// ============================================================
import { useState, useEffect } from 'react'
import { X, Zap, ClipboardList, Play } from 'lucide-react'
import useWorkoutStore  from '../../stores/useWorkoutStore.js'
import useWorkoutSessionStore from '../../stores/useWorkoutSessionStore.js'

export function QuickLogDrawer({ isOpen, onClose }) {
  const sheets = useWorkoutStore((s) => s.sheets)
  const todayIso = new Date().toISOString().slice(0, 10)

  // ── Form state ─────────────────────────────────────────────
  const [date, setDate] = useState(todayIso)
  const [sheetId, setSheetId] = useState('')

  // Ao abrir → define ficha padrão e reseta data
  useEffect(() => {
    if (isOpen) {
      setDate(todayIso)
      if (!sheetId && sheets.length > 0) {
        const first = sheets.find((s) => s.isActive) ?? sheets[0]
        setSheetId(first?.id ?? '')
      }
    } else {
      setSheetId('')
    }
  }, [isOpen]) // eslint-disable-line

  // Fecha com ESC
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // ── Iniciar Sessão Real ─────────────────────────────────────
  const handleStart = () => {
    if (!sheetId) return
    onClose()
    setTimeout(() => {
      useWorkoutSessionStore.getState().startSession(sheetId, date)
    }, 150) // wait for drawer animation to close before opening the next
  }

  if (!isOpen) return null

  const activeSheets = sheets.filter((s) => s.isActive)

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-brand-base flex flex-col border-l border-brand-elevated"
        role="dialog"
        aria-modal="true"
      >
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-elevated bg-brand-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-action/20 flex items-center justify-center">
              <Zap size={20} className="text-brand-action" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary leading-tight">
                Novo Treino
              </h2>
              <p className="text-xs text-text-muted mt-0.5 font-medium tracking-wide">Configuração Inicial</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-full hover:bg-brand-elevated flex items-center justify-center text-text-secondary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* ── Body ────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold tracking-wide text-text-secondary mb-2 uppercase">
                Data do Treino
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-base min-h-[50px] border border-brand-elevated rounded-xl px-4 py-3 focus:outline-none focus:border-brand-action focus:ring-1 focus:ring-brand-action bg-brand-surface text-text-primary"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold tracking-wide text-text-secondary mb-2 uppercase">
                Ficha de Treino
              </label>
              <select
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                className="w-full text-base min-h-[50px] border border-brand-elevated rounded-xl px-4 py-3 focus:outline-none focus:border-brand-action focus:ring-1 focus:ring-brand-action bg-brand-surface text-text-primary appearance-none"
              >
                <option value="">Selecione...</option>
                {activeSheets.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {!sheetId && (
              <div className="py-16 flex flex-col items-center gap-4 text-text-muted">
                <ClipboardList size={48} strokeWidth={1.5} className="text-brand-elevated" />
                <p className="text-sm font-medium">Selecione uma ficha para iniciar</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────── */}
        <div className="p-4 border-t border-brand-elevated bg-brand-surface pb-safe">
          <button
            type="button"
            onClick={handleStart}
            disabled={!sheetId}
            className="w-full min-h-[56px] flex items-center justify-center gap-2 bg-brand-action hover:bg-brand-structural disabled:bg-brand-elevated disabled:text-text-muted disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-brand-action/20"
          >
            <Play fill="currentColor" size={20} />
            Começar Treino
          </button>
        </div>
      </div>
    </>
  )
}

