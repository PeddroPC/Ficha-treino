// ============================================================
// components/exercises/FormExerciseModal.jsx
// Modal para criação de novos exercícios
// ============================================================
import { useState, useEffect } from 'react'
import { X, Save, Plus } from 'lucide-react'
import useExerciseStore from '../../stores/useExerciseStore.js'
import { MuscleGroupLabel, EquipmentLabel } from '../../constants/enums.js'

export function FormExerciseModal({ isOpen, onClose, onCreated }) {
  const addExercise = useExerciseStore((s) => s.addExercise)

  const [formData, setFormData] = useState({
    name: '',
    muscleGroup: 'CHEST',
    equipment: 'DUMBBELL',
  })

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', muscleGroup: 'CHEST', equipment: 'DUMBBELL' })
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // addExercise must handle ID generation
    const newId = addExercise(formData)
    
    if (onCreated) {
      // Retorna o ID para auto-selecionar
      onCreated(newId || formData.name) 
    }
    
    onClose()
  }

  const inputClassName = "w-full rounded-xl border border-brand-elevated bg-brand-base px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-brand-action focus:ring-2 focus:ring-brand-action/20"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-brand-surface border border-brand-elevated rounded-2xl shadow-2xl w-full max-w-sm flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-elevated">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Plus size={20} className="text-brand-action" />
            Novo Exercício
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-elevated text-text-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form id="create-ex-form" onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-text-secondary mb-1.5">Nome do Exercício</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Supino Inclinado Articulado"
              required
              autoFocus
              className={inputClassName}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-secondary mb-1.5">Grupo Muscular</label>
            <select
              name="muscleGroup"
              value={formData.muscleGroup}
              onChange={handleChange}
              className={inputClassName}
            >
              {Object.entries(MuscleGroupLabel).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-text-secondary mb-1.5">Equipamento</label>
            <select
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              className={inputClassName}
            >
              {Object.entries(EquipmentLabel).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-brand-elevated flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-text-secondary border border-brand-elevated hover:bg-brand-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-ex-form"
            className="flex-1 flex items-center justify-center gap-2 bg-brand-action hover:bg-brand-structural text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-brand-action/20"
          >
            <Save size={18} />
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  )
}
