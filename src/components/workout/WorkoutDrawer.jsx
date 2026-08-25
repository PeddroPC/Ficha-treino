// ============================================================
// components/workout/WorkoutDrawer.jsx
// Slide-over de registro rápido de treino (Modo Academia)
// Otimizado para uso com as mãos suadas e tela pequena.
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, CheckCircle, Trophy, Dumbbell } from 'lucide-react'
import useWorkoutSessionStore from '../../stores/useWorkoutSessionStore.js'
import useWorkoutStore        from '../../stores/useWorkoutStore.js'
import useExerciseStore       from '../../stores/useExerciseStore.js'
import useLogStore            from '../../stores/useLogStore.js'

// ── Botão +/- com grande área de toque ──────────────────────
function Stepper({ label, value, onChange, step = 1, min = 0, unit = '' }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-14 h-14 rounded-2xl bg-gray-800 hover:bg-gray-700 active:scale-95 text-white text-2xl font-bold flex items-center justify-center transition-all select-none"
          aria-label={`Diminuir ${label}`}
        >
          −
        </button>
        <div className="w-24 text-center">
          <span className="text-4xl font-extrabold text-white tabular-nums">
            {value}
          </span>
          {unit && (
            <span className="text-lg font-semibold text-gray-400 ml-1">{unit}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(value + step)}
          className="w-14 h-14 rounded-2xl bg-gray-800 hover:bg-gray-700 active:scale-95 text-white text-2xl font-bold flex items-center justify-center transition-all select-none"
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
  const logs           = useLogStore((s) => s.logs)

  // Inputs do stepper
  const [weight, setWeight] = useState(0)
  const [reps,   setReps]   = useState(10)
  const [savedSets, setSavedSets] = useState([]) // sets salvos nesta sessão
  const [sessionStarted, setSessionStarted] = useState(false)
  const [showPRBadge, setShowPRBadge] = useState(false)

  // Exercícios desta ficha, em ordem
  const fichaExercises = [...sheetExercises]
    .filter((se) => se.sheetId === sheetId)
    .sort((a, b) => a.order - b.order)

  const currentSheetEx = fichaExercises[currentExerciseIndex] ?? null
  const currentEx = currentSheetEx
    ? exercises.find((e) => e.id === currentSheetEx.exerciseId)
    : null

  const totalExercises = fichaExercises.length
  const isLastExercise = currentExerciseIndex >= totalExercises - 1

  // Quando abre o drawer → inicia o log no store e pré-carrega a carga alvo
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

  // Ao mudar de exercício → pré-carrega a última carga desse exercício
  useEffect(() => {
    if (!currentSheetEx) return
    setReps(currentSheetEx.targetRepsMin ?? 10)
    // Busca última carga registrada para esse exercício (qualquer sessão anterior)
    // (dados no LogStore já disponíveis)
    setWeight((w) => w === 0 ? (currentSheetEx.targetRepsMin ?? 10) : w)
  }, [currentExerciseIndex, currentSheetEx])

  // Detecta PR ao salvar
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={handleFinish}
        aria-hidden="true"
      />

      {/* Painel slide-over */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-gray-950 flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Modo Treino"
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-800">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
              Modo Treino
            </p>
            <p className="text-white font-bold text-sm mt-0.5 truncate max-w-[200px]">
              {useWorkoutStore.getState().sheets.find((s) => s.id === sheetId)?.name ?? '–'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 flex items-center justify-center transition-colors"
            aria-label="Encerrar treino"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Progresso dos exercícios ─────────────────────── */}
        <div className="px-5 py-3 border-b border-gray-800">
          <div className="flex gap-1.5">
            {fichaExercises.map((_, i) => (
              <div
                key={i}
                className={[
                  'h-1 rounded-full flex-1 transition-colors',
                  i < currentExerciseIndex  ? 'bg-green-500'
                  : i === currentExerciseIndex ? 'bg-blue-500'
                  : 'bg-gray-700',
                ].join(' ')}
              />
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-1.5">
            Exercício {currentExerciseIndex + 1} de {totalExercises}
          </p>
        </div>

        {/* ── Conteúdo principal ──────────────────────────── */}
        <div className="flex-1 flex flex-col px-5 py-6 overflow-y-auto">
          {!currentEx ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <CheckCircle size={56} className="text-green-500" />
              <h2 className="text-white text-xl font-bold text-center">
                Treino Concluído! 🎉
              </h2>
              <p className="text-gray-400 text-sm text-center">
                {savedSets.length} séries registradas
              </p>
              <button
                type="button"
                onClick={handleFinish}
                className="mt-4 w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl text-lg transition-colors active:scale-98"
              >
                Finalizar Treino
              </button>
            </div>
          ) : (
            <>
              {/* Nome do exercício */}
              <div className="mb-6 flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-900/50 rounded-xl flex items-center justify-center shrink-0">
                  <Dumbbell size={18} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-white text-xl font-extrabold leading-tight">
                    {currentEx.name}
                  </h2>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Série <span className="text-blue-400 font-bold">{currentSetNumber}</span>
                    {currentSheetEx.targetSets && (
                      <span className="text-gray-600"> / {currentSheetEx.targetSets}</span>
                    )}
                    {currentSheetEx.targetRestSeconds && (
                      <span className="text-gray-600"> · {currentSheetEx.targetRestSeconds}s descanso</span>
                    )}
                  </p>
                </div>
              </div>

              {/* PR badge */}
              {showPRBadge && (
                <div className="flex items-center gap-2 bg-yellow-900/40 border border-yellow-600/50 rounded-xl px-4 py-2 mb-4 animate-in fade-in duration-150">
                  <Trophy size={16} className="text-yellow-400" />
                  <span className="text-yellow-300 text-sm font-bold">Novo Recorde Pessoal! 🏆</span>
                </div>
              )}

              {/* Steppers */}
              <div className="flex flex-col gap-8 mb-8">
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
                <div className="mb-6">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Séries desta sessão
                  </p>
                  <div className="space-y-1.5">
                    {savedSets
                      .filter((s) => s.exerciseId === currentSheetEx.exerciseId)
                      .map((s, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-gray-900 rounded-xl px-3 py-2"
                        >
                          <span className="text-gray-400 text-sm">Série {i + 1}</span>
                          <div className="flex items-center gap-3">
                            {s.isPR && <Trophy size={12} className="text-yellow-400" />}
                            <span className="text-white text-sm font-bold">{s.weight}kg</span>
                            <span className="text-gray-400 text-sm">× {s.reps}</span>
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
                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold py-5 rounded-2xl text-xl transition-all select-none"
              >
                Salvar Série ✓
              </button>
            </>
          )}
        </div>

        {/* ── Footer: navegação entre exercícios ─────────── */}
        {currentEx && (
          <div className="px-5 pb-6 pt-2 border-t border-gray-800 flex gap-3">
            <button
              type="button"
              onClick={prevExercise}
              disabled={currentExerciseIndex === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 font-semibold text-sm transition-colors"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <button
              type="button"
              onClick={isLastExercise ? nextExercise : nextExercise}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition-colors"
            >
              {isLastExercise ? 'Concluir' : 'Próximo'}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
