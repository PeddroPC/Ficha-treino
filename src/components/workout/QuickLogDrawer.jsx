// ============================================================
// components/workout/QuickLogDrawer.jsx
// Painel de Registro Rápido (fullscreen/slide-over).
// Form minimalista e focado no mobile.
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { X, Zap, Plus, Minus, Save, ClipboardList } from 'lucide-react'
import useWorkoutStore  from '../../stores/useWorkoutStore.js'
import useExerciseStore from '../../stores/useExerciseStore.js'
import useLogStore      from '../../stores/useLogStore.js'
import useToastStore    from '../../stores/useToastStore.js'
import { HistoryContext } from './HistoryContext.jsx'
import { generateId } from '../../utils/idGenerator.js'

// ── Stepper numérico ─────────────────────────────────────────
function NumericStepper({ label, value, onChange, step = 1, min = 0, unit = '', fieldId = '' }) {
  const testIdBase = fieldId || label.toLowerCase()
  const labelId = `label-${testIdBase}-${Math.random().toString(36).substr(2, 9)}`
  return (
    <div className="flex items-center gap-3 w-full py-2">
      {/* Label */}
      <span id={labelId} className="text-sm font-semibold text-text-secondary w-16 shrink-0">
        {label}
      </span>

      {/* Botão − */}
      <button
        type="button"
        onClick={() => onChange(parseFloat((Math.max(min, value - step)).toFixed(2)))}
        className="w-14 h-14 rounded-full bg-brand-elevated hover:bg-brand-highlight active:scale-95 flex items-center justify-center text-text-primary transition-all shrink-0"
        aria-label={`Diminuir ${label}`}
        data-testid={`btn-decrease-${testIdBase}`}
      >
        <Minus size={24} strokeWidth={2.5} />
      </button>

      {/* Valor */}
      <div 
        className="flex-1 text-center bg-brand-surface rounded-xl h-14 flex items-center justify-center" 
        role="spinbutton" 
        aria-labelledby={labelId} 
        aria-valuenow={value}
        aria-valuemin={min}
      >
        <span className="text-xl font-bold text-text-primary tabular-nums">{value}</span>
        {unit && <span className="text-sm font-medium text-text-muted ml-1">{unit}</span>}
      </div>

      {/* Botão + */}
      <button
        type="button"
        onClick={() => onChange(parseFloat((value + step).toFixed(2)))}
        className="w-14 h-14 rounded-full bg-brand-elevated hover:bg-brand-highlight active:scale-95 flex items-center justify-center text-text-primary transition-all shrink-0"
        aria-label={`Aumentar ${label}`}
        data-testid={`btn-increase-${testIdBase}`}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </div>
  )
}

// ── Drawer principal ─────────────────────────────────────────
/**
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export function QuickLogDrawer({ isOpen, onClose }) {
  const sheets         = useWorkoutStore((s) => s.sheets)
  const sheetExercises = useWorkoutStore((s) => s.sheetExercises)
  const exercises      = useExerciseStore((s) => s.exercises)
  const addLog         = useLogStore((s) => s.addLog)
  const addSet         = useLogStore((s) => s.addSet)
  const finishLog      = useLogStore((s) => s.finishLog)
  const addToast       = useToastStore((s) => s.addToast)

  const todayIso = new Date().toISOString().slice(0, 10)

  // ── Form state ─────────────────────────────────────────────
  const [date,    setDate]    = useState(todayIso)
  const [sheetId, setSheetId] = useState('')
  // { [exerciseId]: { weight: number, reps: number, sets: number } }
  const [inputs,  setInputs]  = useState({})
  const [saving,  setSaving]  = useState(false)

  // Exercícios da ficha selecionada, em ordem
  const fichaExercises = sheetExercises
    .filter((se) => se.sheetId === sheetId)
    .sort((a, b) => a.order - b.order)

  // Ao trocar de ficha → pré-popula inputs com as metas da ficha
  useEffect(() => {
    if (!sheetId) { setInputs({}); return }
    const init = {}
    sheetExercises
      .filter((se) => se.sheetId === sheetId)
      .forEach((se) => {
        init[se.exerciseId] = {
          weight: 0,
          reps:   se.targetRepsMin  ?? 10,
          sets:   se.targetSets     ?? 3,
        }
      })
    setInputs(init)
  }, [sheetId, sheetExercises])

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
      setInputs({})
    }
  }, [isOpen]) // eslint-disable-line

  // Fecha com ESC
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Atualiza um campo de um exercício
  const updateInput = useCallback((exId, field, val) => {
    setInputs((prev) => ({
      ...prev,
      [exId]: { ...prev[exId], [field]: val },
    }))
  }, [])

  // ── Salvar ─────────────────────────────────────────────────
  const handleSave = () => {
    if (!sheetId) return
    setSaving(true)

    const logId     = generateId('log-ql')
    const startedAt = `${date}T07:00:00Z`
    const finishedAt= `${date}T08:30:00Z`

    // 1. Cria o log
    addLog({ id: logId, profileId: 'profile-001', sheetId, startedAt })

    // 2. Cria as séries (apenas exercícios com carga > 0)
    let setsCount = 0
    Object.entries(inputs).forEach(([exerciseId, data]) => {
      if (data.weight <= 0) return
      for (let n = 1; n <= data.sets; n++) {
        addSet({
          logId,
          exerciseId,
          setNumber:   n,
          reps:        data.reps,
          weightKg:    data.weight,
          restSeconds: 90,
          isDropSet:   false,
          isPR:        false,
          notes:       '',
        })
        setsCount++
      }
    })

    // 3. Finaliza o log
    finishLog(logId, {
      finishedAt,
      durationMinutes: 90,
      notes:           'Registro rápido',
      perceivedEffort: 7,
    })

    setSaving(false)
    onClose()

    const msg = setsCount > 0
      ? `Treino registrado! ${setsCount} série${setsCount !== 1 ? 's' : ''} salva${setsCount !== 1 ? 's' : ''}.`
      : 'Log criado. Nenhuma carga informada.'
    addToast({ message: msg, type: setsCount > 0 ? 'success' : 'info' })
  }

  if (!isOpen) return null

  const activeSheets = sheets.filter((s) => s.isActive)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Painel (Full height on mobile) */}
      <div
        className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-brand-base flex flex-col border-l border-brand-elevated"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-log-title"
      >
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-elevated bg-brand-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-action/20 flex items-center justify-center">
              <Zap size={20} className="text-brand-action" strokeWidth={2.5} />
            </div>
            <div>
              <h2 id="quick-log-title" className="text-lg font-bold text-text-primary leading-tight">
                Novo Treino
              </h2>
              <p className="text-xs text-text-muted mt-0.5 font-medium tracking-wide">Registro Simplificado</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-full hover:bg-brand-elevated flex items-center justify-center text-text-secondary transition-colors"
            aria-label="Fechar painel"
          >
            <X size={24} />
          </button>
        </div>

        {/* ── Body (scroll interno) ────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-6">

            {/* Data + Ficha */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ql-date" className="block text-xs font-bold tracking-wide text-text-secondary mb-2 uppercase">
                  Data
                </label>
                <input
                  id="ql-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-base min-h-[50px] border border-brand-elevated rounded-xl px-4 py-3 focus:outline-none focus:border-brand-action focus:ring-1 focus:ring-brand-action bg-brand-surface text-text-primary"
                />
              </div>
              <div>
                <label htmlFor="ql-sheet" className="block text-xs font-bold tracking-wide text-text-secondary mb-2 uppercase">
                  Ficha
                </label>
                <select
                  id="ql-sheet"
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
            </div>

            {/* Exercícios */}
            {sheetId && fichaExercises.length > 0 ? (
              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-4">
                  <div className="h-px bg-brand-elevated flex-1" />
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">
                    {fichaExercises.length} Exercícios
                  </span>
                  <div className="h-px bg-brand-elevated flex-1" />
                </div>

                {fichaExercises.map((se, idx) => {
                  const ex = exercises.find((e) => e.id === se.exerciseId)
                  
                  if (!ex) {
                    return (
                      <div key={se.id || idx} className="p-4 border border-red-500 bg-red-50 text-red-700 rounded-xl mb-4">
                        <p className="font-bold text-sm">Exercício não encontrado no catálogo!</p>
                        <p className="text-xs font-mono mt-1">ID da Ficha: {se.sheetId}</p>
                        <p className="text-xs font-mono">Exercise ID procurado: "{se.exerciseId}"</p>
                        <p className="text-xs mt-2">Isso ocorre se o exercício foi deletado do catálogo, ou houve um erro de sincronização.</p>
                      </div>
                    )
                  }

                  const data = inputs[se.exerciseId] ?? { weight: 0, reps: 10, sets: 3 }

                  return (
                    <div key={se.id} className="pt-2 pb-6 border-b border-brand-elevated/50 last:border-0">
                      {/* Nome */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-text-primary">
                          {idx + 1}. {ex.name}
                        </span>
                      </div>

                      {/* Meta da ficha */}
                      <p className="text-sm font-medium text-text-secondary mb-4">
                        Meta: <span className="text-text-primary">{se.targetSets} × {se.targetRepsMin}–{se.targetRepsMax}</span>
                        {se.targetRestSeconds && ` · ${se.targetRestSeconds}s rest`}
                      </p>

                      {/* Histórico Contextual */}
                      <div className="mb-4">
                        <HistoryContext exerciseId={se.exerciseId} currentLogId={null} dark={true} />
                      </div>

                      {/* Steppers */}
                      <div className="space-y-1">
                        <NumericStepper
                          label="Carga"
                          fieldId="weight"
                          value={data.weight}
                          onChange={(v) => updateInput(se.exerciseId, 'weight', v)}
                          step={2.5}
                          min={0}
                          unit="kg"
                        />
                        <NumericStepper
                          label="Reps"
                          fieldId="reps"
                          value={data.reps}
                          onChange={(v) => updateInput(se.exerciseId, 'reps', v)}
                          step={1}
                          min={1}
                        />
                        <NumericStepper
                          label="Séries"
                          fieldId="sets"
                          value={data.sets}
                          onChange={(v) => updateInput(se.exerciseId, 'sets', v)}
                          step={1}
                          min={1}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : sheetId ? (
              <div className="py-10 text-center text-text-muted">
                <p className="text-sm">Nenhum exercício nesta ficha</p>
              </div>
            ) : (
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
            onClick={handleSave}
            disabled={!sheetId || saving}
            data-testid="btn-save-log"
            className="w-full min-h-[56px] flex items-center justify-center gap-2 bg-brand-action hover:bg-brand-structural disabled:bg-brand-elevated disabled:text-text-muted disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-brand-action/20"
          >
            <Save size={20} />
            {saving ? 'Salvando...' : 'Finalizar Treino'}
          </button>
        </div>
      </div>
    </>
  )
}

