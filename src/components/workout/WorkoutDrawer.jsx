// ============================================================
// components/workout/WorkoutDrawer.jsx
// Slide-over de registro de treino ativo (Modo Treino)
// Otimizado para mobile-first com a nova paleta de cores e visão tabular
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, CheckCircle, Trophy, Dumbbell, Plus } from 'lucide-react'
import useWorkoutSessionStore from '../../stores/useWorkoutSessionStore.js'
import useWorkoutStore        from '../../stores/useWorkoutStore.js'
import useExerciseStore       from '../../stores/useExerciseStore.js'
import useLogStore            from '../../stores/useLogStore.js'
import { HistoryContext }     from './HistoryContext.jsx'

// ── Drawer principal ─────────────────────────────────────────
export function WorkoutDrawer() {
  const { isOpen, sheetId, logId, currentExerciseIndex, currentSetNumber,
          closeSession, nextSet, nextExercise, prevExercise } = useWorkoutSessionStore()

  const sheetExercises = useWorkoutStore((s) => s.sheetExercises)
  const exercises      = useExerciseStore((s) => s.exercises)
  const addLog         = useLogStore((s) => s.addLog)
  const addSet         = useLogStore((s) => s.addSet)
  const finishLog      = useLogStore((s) => s.finishLog)

  const [sessionStarted, setSessionStarted] = useState(false)
  const [showPRBadge, setShowPRBadge] = useState(false)
  const [workingSets, setWorkingSets] = useState([])

  const fichaExercises = [...sheetExercises]
    .filter((se) => se.sheetId === sheetId)
    .sort((a, b) => a.order - b.order)

  const currentSheetEx = fichaExercises[currentExerciseIndex] ?? null
  const currentEx = currentSheetEx
    ? exercises.find((e) => e.id === currentSheetEx.exerciseId)
    : null

  const totalExercises = fichaExercises.length
  const isLastExercise = currentExerciseIndex >= totalExercises - 1

  // Start log
  useEffect(() => {
    if (isOpen && !sessionStarted && logId) {
      addLog({ id: logId, profileId: 'profile-001', sheetId, startedAt: new Date().toISOString() })
      setSessionStarted(true)
    }
    if (!isOpen) {
      setSessionStarted(false)
    }
  }, [isOpen, logId])

  // Initialize Working Sets when exercise changes
  useEffect(() => {
    if (!currentSheetEx || !logId) return
    
    // Check how many sets were already saved in the global store for this log/exercise
    const allSets = useLogStore.getState().sets
    const saved = allSets.filter(s => s.logId === logId && s.exerciseId === currentSheetEx.exerciseId)
    
    const targetSets = currentSheetEx.targetSets || 3
    const rows = []
    
    // Pre-fill saved sets
    for (let i = 0; i < saved.length; i++) {
      rows.push({
        id: `saved-${saved[i].id}`,
        isSaved: true,
        weight: saved[i].weightKg,
        reps: saved[i].reps,
        isPR: saved[i].isPR
      })
    }
    
    // Fill the rest with empty pending sets up to targetSets
    const remaining = Math.max(0, targetSets - saved.length)
    for (let i = 0; i < remaining; i++) {
      rows.push({
        id: `pending-${Date.now()}-${i}`,
        isSaved: false,
        weight: '',
        reps: currentSheetEx.targetRepsMin ?? 10,
        isPR: false
      })
    }
    
    // Se não tinha targetSets e não tem salvo, bota pelo menos 1
    if (rows.length === 0) {
      rows.push({
        id: `pending-${Date.now()}-0`,
        isSaved: false,
        weight: '',
        reps: 10,
        isPR: false
      })
    }

    setWorkingSets(rows)
  }, [currentExerciseIndex, currentSheetEx, logId])

  const checkIsPR = useCallback((exerciseId, newWeight) => {
    const allSets = useLogStore.getState().sets
    const maxPrev = allSets
      .filter((s) => s.exerciseId === exerciseId)
      .reduce((max, s) => Math.max(max, s.weightKg), 0)
    return newWeight > maxPrev
  }, [])

  const handleUpdateRow = (index, field, value) => {
    const copy = [...workingSets]
    copy[index] = { ...copy[index], [field]: Number(value) }
    setWorkingSets(copy)
  }

  const handleSaveSet = (index) => {
    if (!currentSheetEx || !logId) return
    
    const row = workingSets[index]
    if (row.isSaved) return
    
    const w = Number(row.weight) || 0
    const r = Number(row.reps) || 0
    
    const isPR = checkIsPR(currentSheetEx.exerciseId, w)
    if (isPR) { setShowPRBadge(true); setTimeout(() => setShowPRBadge(false), 2000) }

    addSet({
      logId,
      exerciseId: currentSheetEx.exerciseId,
      setNumber: index + 1,
      reps: r,
      weightKg: w,
      restSeconds: currentSheetEx.targetRestSeconds ?? 90,
      isDropSet: false,
      isPR,
      notes: '',
    })

    const copy = [...workingSets]
    copy[index] = { ...row, weight: w, reps: r, isSaved: true, isPR }
    setWorkingSets(copy)
    nextSet()
  }
  
  const handleAddSetRow = () => {
    setWorkingSets([...workingSets, {
      id: `pending-${Date.now()}`,
      isSaved: false,
      weight: '',
      reps: currentSheetEx?.targetRepsMin ?? 10,
      isPR: false
    }])
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
        <div className="flex-1 flex flex-col px-5 py-6 overflow-y-auto custom-scrollbar">
          {!currentEx ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <CheckCircle size={64} className="text-brand-action" strokeWidth={1.5} />
              <h2 className="text-text-primary text-2xl font-bold text-center">
                Treino Concluído! 🎉
              </h2>
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
                    {currentSheetEx.targetSets && (
                      <span className="text-text-primary font-bold">{currentSheetEx.targetSets} Séries</span>
                    )}
                    {currentSheetEx.targetRestSeconds && (
                      <span className="text-text-muted"> · {currentSheetEx.targetRestSeconds}s descanso</span>
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

              {/* Tabela de Séries */}
              <div className="mt-8 mb-4">
                <div className="flex items-center px-2 mb-2">
                  <div className="w-12 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">Série</div>
                  <div className="flex-1 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">kg</div>
                  <div className="flex-1 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">Reps</div>
                  <div className="w-12 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest"><CheckCircle size={14} className="mx-auto" /></div>
                </div>

                <div className="space-y-2">
                  {workingSets.map((row, index) => (
                    <div key={row.id} className={`flex items-center gap-2 px-2 py-2 rounded-xl transition-colors ${row.isSaved ? 'bg-brand-action/10 border border-brand-action/20' : 'bg-brand-surface border border-brand-elevated'}`}>
                      <div className="w-12 text-center">
                        {row.isSaved && row.isPR ? (
                          <div className="w-6 h-6 mx-auto bg-yellow-400/20 rounded-full flex items-center justify-center">
                            <Trophy size={12} className="text-yellow-500" />
                          </div>
                        ) : (
                          <span className={`text-sm font-bold ${row.isSaved ? 'text-brand-action' : 'text-text-secondary'}`}>{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <input 
                          type="number"
                          placeholder="-"
                          disabled={row.isSaved}
                          className="w-full text-center bg-brand-base border border-brand-elevated rounded-lg py-2 text-base font-bold text-text-primary focus:border-brand-action focus:ring-1 focus:ring-brand-action disabled:opacity-80"
                          value={row.weight}
                          onChange={(e) => handleUpdateRow(index, 'weight', e.target.value)}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <input 
                          type="number"
                          placeholder="-"
                          disabled={row.isSaved}
                          className="w-full text-center bg-brand-base border border-brand-elevated rounded-lg py-2 text-base font-bold text-text-primary focus:border-brand-action focus:ring-1 focus:ring-brand-action disabled:opacity-80"
                          value={row.reps}
                          onChange={(e) => handleUpdateRow(index, 'reps', e.target.value)}
                        />
                      </div>
                      
                      <div className="w-12 text-center flex justify-center">
                        <button 
                          type="button"
                          disabled={row.isSaved || row.reps === ''}
                          onClick={() => handleSaveSet(index)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${row.isSaved ? 'bg-brand-action text-white' : 'bg-brand-elevated hover:bg-brand-highlight text-text-secondary disabled:opacity-50'}`}
                        >
                          <CheckCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={handleAddSetRow}
                  className="mt-4 flex items-center justify-center gap-2 w-full text-text-muted hover:text-text-primary font-bold text-sm py-2 transition-colors"
                >
                  <Plus size={16} />
                  Adicionar Série
                </button>
              </div>

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
              className="flex-1 flex items-center justify-center gap-1.5 py-4 rounded-xl bg-brand-action text-white hover:bg-brand-structural font-bold text-sm transition-colors shadow-lg shadow-brand-action/20"
            >
              {isLastExercise ? 'Concluir Treino' : 'Próximo Exercício'}
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
