// ============================================================
// pages/ExercisesPage.jsx — Catálogo de Exercícios (stub Fase 1)
// ============================================================
import { PageHeader } from '../components/shared/PageHeader.jsx'
import { Card } from '../components/ui/Card.jsx'
import useExerciseStore from '../stores/useExerciseStore.js'
import { MuscleGroupLabel, EquipmentLabel } from '../constants/enums.js'
import { Dumbbell, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import FormExercise from '../components/forms/FormExercise.jsx'
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal.jsx'

export default function ExercisesPage() {
  const exercises = useExerciseStore((s) => s.exercises)
  const addExercise = useExerciseStore((s) => s.addExercise)
  const updateExercise = useExerciseStore((s) => s.updateExercise)
  const removeExercise = useExerciseStore((s) => s.removeExercise)
  const [editingExercise, setEditingExercise] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingExercise, setDeletingExercise] = useState(null)

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingExercise(null)
  }

  const handleSubmit = (formData) => {
    if (editingExercise) updateExercise(editingExercise.id, formData)
    else addExercise(formData)
    closeForm()
  }

  const confirmDelete = () => {
    if (deletingExercise) {
      removeExercise(deletingExercise.id)
    }
  }

  useEffect(() => {
    if (!isFormOpen) return;
    const handler = (e) => { if (e.key === 'Escape') closeForm() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isFormOpen])

  return (
    <div>
      <PageHeader
        title="Catálogo de Exercícios"
        subtitle={`${exercises.length} exercícios disponíveis`}
        action={
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            data-testid="btn-new-exercise"
            className="bg-brand-action hover:opacity-90 text-white text-base font-bold px-4 min-h-[44px] rounded-xl transition-opacity flex items-center justify-center shadow-sm"
          >
            + Novo Exercício
          </button>
        }
      />

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="exercise-form-title">
          <div className="w-full max-w-xl rounded-2xl bg-brand-surface border border-brand-elevated p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="exercise-form-title" className="text-lg font-bold text-text-primary">
                  {editingExercise ? 'Editar exercício' : 'Novo exercício'}
                </h2>
                <p className="mt-1 text-sm text-text-muted">Preencha os dados do exercício.</p>
              </div>
              <button type="button" onClick={closeForm} className="w-11 h-11 flex items-center justify-center text-3xl leading-none text-text-muted hover:text-text-primary" aria-label="Fechar formulário">&times;</button>
            </div>
            <FormExercise exercise={editingExercise} onSubmit={handleSubmit} onCancel={closeForm} />
          </div>
        </div>
      )}

      <ConfirmDeleteModal 
        isOpen={!!deletingExercise}
        onClose={() => setDeletingExercise(null)}
        onConfirm={confirmDelete}
        itemName={deletingExercise?.name || ""}
        title="Excluir Exercício"
        description="Tem certeza que deseja excluir este exercício? Caso ele esteja sendo usado em alguma ficha, essa ficha também será impactada."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {exercises.map((ex) => (
          <div key={ex.id} className="bg-brand-surface border border-brand-elevated rounded-xl p-4 shadow-sm hover:border-brand-action/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-brand-elevated rounded-xl flex items-center justify-center flex-shrink-0">
                <Dumbbell size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-text-primary text-sm truncate">{ex.name}</h3>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <span className="border border-brand-elevated text-text-secondary text-xs font-medium px-2 py-0.5 rounded-md">
                    {MuscleGroupLabel[ex.muscleGroup] ?? ex.muscleGroup}
                  </span>
                  <span className="border border-brand-elevated text-text-secondary text-xs font-medium px-2 py-0.5 rounded-md">
                    {EquipmentLabel[ex.equipment] ?? ex.equipment}
                  </span>
                  {ex.isCustom && (
                    <span className="border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-medium px-2 py-0.5 rounded-md">
                      Personalizado
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-1 items-end shrink-0">
                <button
                  type="button"
                  onClick={() => { setEditingExercise(ex); setIsFormOpen(true) }}
                  data-testid={`btn-edit-exercise-${ex.id}`}
                  aria-label={`Editar exercício ${ex.name}`}
                  className="rounded-lg px-3 min-h-[40px] min-w-[40px] flex items-center justify-center text-sm font-bold text-brand-action transition hover:bg-brand-elevated"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingExercise(ex)}
                  data-testid={`btn-delete-exercise-${ex.id}`}
                  aria-label={`Excluir exercício ${ex.name}`}
                  className="rounded-lg px-3 min-h-[40px] min-w-[40px] flex items-center justify-center text-sm font-bold text-red-500 transition hover:bg-brand-elevated"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
