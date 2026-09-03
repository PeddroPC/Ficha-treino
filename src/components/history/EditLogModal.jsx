// ============================================================
// components/history/EditLogModal.jsx
// Modal para edição de treino (notas, tempo, RPE)
// ============================================================
import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import useLogStore from '../../stores/useLogStore.js'

export function EditLogModal({ isOpen, onClose, log }) {
  const updateLog = useLogStore((s) => s.updateLog)

  const [formData, setFormData] = useState({
    durationMinutes: '',
    perceivedEffort: '',
    notes: '',
  })

  useEffect(() => {
    if (isOpen && log) {
      setFormData({
        durationMinutes: log.durationMinutes ?? '',
        perceivedEffort: log.perceivedEffort ?? '',
        notes: log.notes ?? '',
      })
    }
  }, [isOpen, log])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen || !log) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateLog(log.id, {
      durationMinutes: formData.durationMinutes ? Number(formData.durationMinutes) : null,
      perceivedEffort: formData.perceivedEffort ? Number(formData.perceivedEffort) : null,
      notes: formData.notes,
    })
    onClose()
  }

  const inputClassName = "w-full rounded-xl border border-brand-elevated bg-brand-base px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-brand-action focus:ring-2 focus:ring-brand-action/20"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-brand-surface border border-brand-elevated rounded-2xl shadow-2xl w-full max-w-md flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-elevated">
          <h2 className="text-xl font-bold text-text-primary">Editar Treino</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-elevated text-text-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form id="edit-log-form" onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-1.5">Duração (min)</label>
              <input
                type="number"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                min="1"
                className={inputClassName}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-1.5">Esforço (RPE 1-10)</label>
              <input
                type="number"
                name="perceivedEffort"
                value={formData.perceivedEffort}
                onChange={handleChange}
                min="1"
                max="10"
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-text-secondary mb-1.5">Observações</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Ex: Senti dor no ombro no supino..."
              className={`${inputClassName} resize-none`}
            />
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
            form="edit-log-form"
            className="flex-1 flex items-center justify-center gap-2 bg-brand-action hover:bg-brand-structural text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-brand-action/20"
          >
            <Save size={18} />
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
