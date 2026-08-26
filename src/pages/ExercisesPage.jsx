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
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            + Novo Exercício
          </button>
        }
      />

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="exercise-form-title">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="exercise-form-title" className="text-lg font-semibold text-gray-900">
                  {editingExercise ? 'Editar exercício' : 'Novo exercício'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">Preencha os dados do exercício.</p>
              </div>
              <button type="button" onClick={closeForm} className="text-2xl leading-none text-gray-400 hover:text-gray-700" aria-label="Fechar formulário">&times;</button>
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
          <Card key={ex.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Dumbbell size={18} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{ex.name}</h3>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                    {MuscleGroupLabel[ex.muscleGroup] ?? ex.muscleGroup}
                  </span>
                  <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    {EquipmentLabel[ex.equipment] ?? ex.equipment}
                  </span>
                  {ex.isCustom && (
                    <span className="bg-orange-50 text-orange-600 text-xs px-2 py-0.5 rounded-full">
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
                  className="rounded-lg px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingExercise(ex)}
                  data-testid={`btn-delete-exercise-${ex.id}`}
                  aria-label={`Excluir exercício ${ex.name}`}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
