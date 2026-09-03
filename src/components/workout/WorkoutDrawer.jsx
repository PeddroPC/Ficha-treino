// ============================================================
// components/workout/WorkoutDrawer.jsx
// Slide-over de registro de treino ativo (Modo Treino)
// Otimizado para mobile-first com a nova paleta de cores
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, CheckCircle, Trophy, Dumbbell } from 'lucide-react'
import useWorkoutSessionStore from '../../stores/useWorkoutSessionStore.js'
import useWorkoutStore        from '../../stores/useWorkoutStore.js'
import useExerciseStore       from '../../stores/useExerciseStore.js'
import useLogStore            from '../../stores/useLogStore.js'
import { HistoryContext }     from './HistoryContext.jsx'

// ── Botão +/- com grande área de toque ──────────────────────
function Stepper({ label, value, onChange, step = 1, min = 0, unit = '' }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-16 h-16 rounded-full bg-brand-elevated hover:bg-brand-highlight active:scale-95 text-text-primary text-3xl font-light flex items-center justify-center transition-all select-none shadow-md"
          aria-label={`Diminuir ${label}`}
        >
          −
        </button>
        <div className="w-28 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold text-text-primary tabular-nums tracking-tighter">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-bold text-text-muted mt-1">{unit}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(value + step)}
          className="w-16 h-16 rounded-full bg-brand-elevated hover:bg-brand-highlight active:scale-95 text-text-primary text-3xl font-light flex items-center justify-center transition-all select-none shadow-md"
          aria-label={`Aumentar ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

// ── Drawer principal ─────────────────────────────────────────
export function WorkoutDrawer() {
  const { isOpen, sheetId, logId, currentExerciseIndex, currentSetNumber,
          closeSession, nextSet, nextExercise, prevExercise } = useWorkoutSessionStore()

  const sheetExercises = useWorkoutStore((s) => s.sheetExercises)
  const exercises      = useExerciseStore((s) => s.exercises)
  const addLog         = useLogStore((s) => s.addLog)
  const addSet         = useLogStore((s) => s.addSet)
  const finishLog      = useLogStore((s) => s.finishLog)

  // Inputs do stepper
  const [weight, setWeight] = useState(0)
  const [reps,   setReps]   = useState(10)
  const [savedSets, setSavedSets] = useState([])
  const [sessionStarted, setSessionStarted] = useState(false)
  const [showPRBadge, setShowPRBadge] = useState(false)

  const fichaExercises = [...sheetExercises]
    .filter((se) => se.sheetId === sheetId)
    .sort((a, b) => a.order - b.order)

  const currentSheetEx = fichaExercises[currentExerciseIndex] ?? null
  const currentEx = currentSheetEx
    ? exercises.find((e) => e.id === currentSheetEx.exerciseId)
    : null

  const totalExercises = fichaExercises.length
  const isLastExercise = currentExerciseIndex >= totalExercises - 1

  useEffect(() => {
    if (isOpen && !sessionStarted && logId) {
      addLog({ id: logId, profileId: 'profile-001', sheetId, startedAt: new Date().toISOString() })
      setSessionStarted(true)
      setSavedSets([])
    }
    if (!isOpen) {
      setSessionStarted(false)
      setSavedSets([])
    }
  }, [isOpen, logId])

  useEffect(() => {
    if (!currentSheetEx) return
    setReps(currentSheetEx.targetRepsMin ?? 10)
    setWeight((w) => w === 0 ? (currentSheetEx.targetRepsMin ?? 10) : w)
  }, [currentExerciseIndex, currentSheetEx])

  const checkIsPR = useCallback((exerciseId, newWeight) => {
    const allSets = useLogStore.getState().sets
    const maxPrev = allSets
      .filter((s) => s.exerciseId === exerciseId)
      .reduce((max, s) => Math.max(max, s.weightKg), 0)
    return newWeight > maxPrev
  }, [])

  const handleSaveSet = () => {
    if (!currentSheetEx || !logId) return

    const isPR = checkIsPR(currentSheetEx.exerciseId, weight)
    if (isPR) { setShowPRBadge(true); setTimeout(() => setShowPRBadge(false), 2000) }

    addSet({
      logId,
      exerciseId: currentSheetEx.exerciseId,
      setNumber: currentSetNumber,
      reps,
      weightKg: weight,
      restSeconds: currentSheetEx.targetRestSeconds ?? 90,
      isDropSet: false,
      isPR,
      notes: '',
    })

    setSavedSets((prev) => [...prev, { exerciseId: currentSheetEx.exerciseId, weight, reps, isPR }])
    nextSet()
  }

  const handleFinish = () => {
    if (logId) {
      finishLog(logId, {
        finishedAt: new Date().toISOString(),
        durationMinutes: Math.round(
          (Date.now() - new Date(useLogStore.getState().logs.find((l) => l.id === logId)?.startedAt ?? Date.now()).getTime()) / 60000
        ),
        notes: '',
        perceivedEffort: 7,
      })
    }
    closeSession()
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
        onClick={handleFinish}
        aria-hidden="true"
      />

      <div
        className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-brand-base flex flex-col border-l border-brand-elevated"
        role="dialog"
        aria-modal="true"
        aria-label="Modo Treino"
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-brand-elevated bg-brand-surface">
          <div>
            <p className="text-brand-action text-xs font-bold uppercase tracking-widest mb-1">
              Treino Ativo
            </p>
            <p className="text-text-primary font-bold text-lg truncate max-w-[200px] leading-none">
              {useWorkoutStore.getState().sheets.find((s) => s.id === sheetId)?.name ?? '–'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="w-12 h-12 rounded-full hover:bg-brand-elevated text-text-secondary flex items-center justify-center transition-colors"
            aria-label="Encerrar treino"
          >
            <X size={24} />
          </button>
        </div>

        {/* ── Progresso dos exercícios ─────────────────────── */}
        <div className="px-5 py-3 border-b border-brand-elevated bg-brand-base">
          <div className="flex gap-1.5 h-1.5">
            {fichaExercises.map((_, i) => (
              <div
                key={i}
                className={[
                  'rounded-full flex-1 transition-colors',
                  i < currentExerciseIndex  ? 'bg-brand-action'
                  : i === currentExerciseIndex ? 'bg-white'
                  : 'bg-brand-elevated',
                ].join(' ')}
              />
            ))}
          </div>
          <p className="text-text-secondary text-xs mt-2 font-medium">
            Exercício {currentExerciseIndex + 1} de {totalExercises}
          </p>
        </div>

        {/* ── Conteúdo principal ──────────────────────────── */}
        <div className="flex-1 flex flex-col px-5 py-6 overflow-y-auto">
          {!currentEx ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <CheckCircle size={64} className="text-brand-action" strokeWidth={1.5} />
              <h2 className="text-text-primary text-2xl font-bold text-center">
                Treino Concluído! 🎉
              </h2>
              <p className="text-text-secondary text-sm text-center">
                {savedSets.length} séries registradas
              </p>
              <button
                type="button"
                onClick={handleFinish}
                className="mt-6 w-full bg-brand-action hover:bg-brand-structural text-white font-bold py-4 rounded-xl text-lg transition-colors active:scale-95"
              >
                Finalizar
              </button>
            </div>
          ) : (
            <>
              {/* Nome do exercício */}
              <div className="mb-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-action/20 rounded-xl flex items-center justify-center shrink-0">
                  <Dumbbell size={24} className="text-brand-action" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-text-primary text-2xl font-extrabold leading-tight">
                    {currentEx.name}
                  </h2>
                  <p className="text-text-secondary text-sm mt-1 font-medium">
                    Série <span className="text-brand-action font-bold">{currentSetNumber}</span>
                    {currentSheetEx.targetSets && (
                      <span className="text-text-muted"> / {currentSheetEx.targetSets}</span>
                    )}
                    {currentSheetEx.targetRestSeconds && (
                      <span className="text-text-muted"> · {currentSheetEx.targetRestSeconds}s rest</span>
                    )}
                  </p>
                </div>
              </div>

              {/* PR badge */}
              {showPRBadge && (
                <div className="flex items-center gap-2 bg-amber-100 border border-amber-300 rounded-xl px-4 py-3 mb-4 animate-in fade-in duration-150">
                  <Trophy size={18} className="text-amber-500" />
                  <span className="text-amber-700 text-sm font-bold">Novo Recorde Pessoal! 🏆</span>
                </div>
              )}

              {/* Histórico Contextual da última sessão */}
              <HistoryContext exerciseId={currentSheetEx.exerciseId} currentLogId={logId} dark={true} />

              {/* Steppers */}
              <div className="flex flex-col gap-10 mb-10 mt-6">
                <Stepper
                  label="Carga (kg)"
                  value={weight}
                  onChange={setWeight}
                  step={2.5}
                  min={0}
                  unit="kg"
                />
                <Stepper
                  label="Repetições"
                  value={reps}
                  onChange={setReps}
                  step={1}
                  min={1}
                />
              </div>

              {/* Histórico desta sessão */}
              {savedSets.filter((s) => s.exerciseId === currentSheetEx.exerciseId).length > 0 && (
                <div className="mb-8">
                  <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-3">
                    Séries Feitas
                  </p>
                  <div className="space-y-2">
                    {savedSets
                      .filter((s) => s.exerciseId === currentSheetEx.exerciseId)
                      .map((s, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-brand-surface border border-brand-elevated rounded-xl px-4 py-3"
                        >
                          <span className="text-text-secondary text-sm font-medium">Série {i + 1}</span>
                          <div className="flex items-center gap-3">
                            {s.isPR && <Trophy size={14} className="text-yellow-400" />}
                            <span className="text-text-primary text-base font-bold">{s.weight}kg</span>
                            <span className="text-text-muted text-sm font-bold">× {s.reps}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Botão salvar série */}
              <button
                type="button"
                onClick={handleSaveSet}
                className="w-full bg-brand-action hover:bg-brand-structural active:scale-95 text-white font-bold py-5 rounded-xl text-xl transition-all select-none shadow-lg shadow-brand-action/20"
              >
                Salvar Série
              </button>
            </>
          )}
        </div>

        {/* ── Footer: navegação entre exercícios ─────────── */}
        {currentEx && (
          <div className="px-5 pb-safe pt-3 border-t border-brand-elevated bg-brand-surface flex gap-3 mb-4">
            <button
              type="button"
              onClick={prevExercise}
              disabled={currentExerciseIndex === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-4 rounded-xl bg-brand-elevated hover:bg-brand-highlight disabled:opacity-30 disabled:cursor-not-allowed text-text-primary font-bold text-sm transition-colors"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>
            <button
              type="button"
              onClick={isLastExercise ? handleFinish : nextExercise}
              className="flex-1 flex items-center justify-center gap-1.5 py-4 rounded-xl bg-brand-elevated hover:bg-brand-highlight text-text-primary font-bold text-sm transition-colors"
            >
              {isLastExercise ? 'Concluir' : 'Próximo'}
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
