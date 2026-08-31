// ============================================================
// components/workout/QuickLogDrawer.jsx
// Painel de Registro Rápido (slide-over da direita).
// Form minimalista com date picker, seleção de ficha e
// steppers numéricos +/- para carga, reps e séries.
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
    <div className="flex items-center gap-2">
      {/* Label */}
      <span id={labelId} className="text-xs text-gray-400 w-12 text-right shrink-0 font-medium">
        {label}
      </span>

      {/* Botão − */}
      <button
        type="button"
        onClick={() => onChange(parseFloat((Math.max(min, value - step)).toFixed(2)))}
        className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-gray-700 transition-all shrink-0"
        aria-label={`Diminuir ${label}`}
        data-testid={`btn-decrease-${testIdBase}`}
      >
        <Minus size={16} />
      </button>

      {/* Valor */}
      <div 
        className="flex-1 text-center" 
        role="spinbutton" 
        aria-labelledby={labelId} 
        aria-valuenow={value}
        aria-valuemin={min}
      >
        <span className="text-lg font-bold text-gray-900 tabular-nums">{value}</span>
        {unit && <span className="text-xs text-gray-400 ml-0.5">{unit}</span>}
      </div>

      {/* Botão + */}
      <button
        type="button"
        onClick={() => onChange(parseFloat((value + step).toFixed(2)))}
        className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-gray-700 transition-all shrink-0"
        aria-label={`Aumentar ${label}`}
        data-testid={`btn-increase-${testIdBase}`}
      >
        <Plus size={16} />
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
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Painel slide-over */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-log-title"
      >
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Zap size={17} className="text-blue-600" />
            </div>
            <div>
              <h2 id="quick-log-title" className="text-base font-bold text-gray-900 leading-none">
                Anotar Progresso
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Registro rápido de treino</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Fechar painel"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body (scroll interno) ────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-5 space-y-5">

            {/* Data + Ficha */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ql-date" className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Data
                </label>
                <input
                  id="ql-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-base min-h-[44px] border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label htmlFor="ql-sheet" className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Ficha
                </label>
                <select
                  id="ql-sheet"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                  className="w-full text-base min-h-[44px] border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Exercícios · {fichaExercises.length}
                </p>

                {fichaExercises.map((se) => {
                  const ex   = exercises.find((e) => e.id === se.exerciseId)
                  if (!ex) return null
                  const data = inputs[se.exerciseId] ?? { weight: 0, reps: 10, sets: 3 }

                  return (
                    <div key={se.id} className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      {/* Nome */}
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center justify-center shrink-0">
                          {se.order}
                        </span>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{ex.name}</p>
                      </div>

                      {/* Histórico Contextual */}
                      <HistoryContext exerciseId={se.exerciseId} currentLogId={null} dark={false} />

                      {/* Steppers */}
                      <div className="space-y-2">
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

                      {/* Meta da ficha */}
                      <p className="text-xs text-gray-400">
                        Meta: {se.targetSets} × {se.targetRepsMin}–{se.targetRepsMax} reps
                        {se.targetRestSeconds && ` · ${se.targetRestSeconds}s descanso`}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : sheetId ? (
              <div className="py-10 text-center text-gray-300">
                <p className="text-sm">Nenhum exercício nesta ficha</p>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center gap-3 text-gray-200">
                <ClipboardList size={44} />
                <p className="text-sm text-gray-400">Selecione uma ficha para continuar</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────── */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={handleSave}
            disabled={!sheetId || saving}
            data-testid="btn-save-log"
            className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-colors text-lg"
          >
            <Save size={17} />
            {saving ? 'Salvando...' : 'Salvar Registro'}
          </button>
        </div>
      </div>
    </>
  )
}
