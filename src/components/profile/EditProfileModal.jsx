// ============================================================
// components/profile/EditProfileModal.jsx
// Modal para edição completa do perfil do usuário
// ============================================================
import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import useProfileStore from '../../stores/useProfileStore.js'
import { GoalLabel } from '../../constants/enums.js'

export const ExperienceLevelLabel = {
  beginner: 'Iniciante (0-6 meses)',
  intermediate: 'Intermediário (6m-2a)',
  advanced: 'Avançado (+2 anos)',
}

export function EditProfileModal({ isOpen, onClose }) {
  const profile = useProfileStore((s) => s.profile)
  const updateProfile = useProfileStore((s) => s.updateProfile)

  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: 'M',
    weightKg: '',
    heightCm: '',
    goal: 'hypertrophy',
    experienceLevel: 'beginner',
    weeklyFrequency: 4,
    injuries: '',
  })

  // Carrega os dados atuais quando o modal abre
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        name: profile.name || '',
        birthDate: profile.birthDate || '',
        gender: profile.gender || 'M',
        weightKg: profile.weightKg || '',
        heightCm: profile.heightCm || '',
        goal: profile.goal || 'hypertrophy',
        experienceLevel: profile.experienceLevel || 'beginner',
        weeklyFrequency: profile.weeklyFrequency || 4,
        injuries: profile.injuries || '',
      })
    }
  }, [isOpen, profile])

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
    updateProfile({
      ...formData,
      weightKg: formData.weightKg ? Number(formData.weightKg) : null,
      heightCm: formData.heightCm ? Number(formData.heightCm) : null,
      weeklyFrequency: Number(formData.weeklyFrequency),
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-brand-surface border border-brand-elevated rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-elevated shrink-0">
          <h2 className="text-xl font-bold text-text-primary">Editar Perfil</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-elevated text-text-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-brand-action uppercase tracking-widest border-b border-brand-elevated pb-2">Informações Básicas</h3>
              
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-brand-base border border-brand-elevated text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-1.5">Data de Nasc.</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full bg-brand-base border border-brand-elevated text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-1.5">Gênero</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-brand-base border border-brand-elevated text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-1.5">Peso Atual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="weightKg"
                    value={formData.weightKg}
                    onChange={handleChange}
                    className="w-full bg-brand-base border border-brand-elevated text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-1.5">Altura (cm)</label>
                  <input
                    type="number"
                    name="heightCm"
                    value={formData.heightCm}
                    onChange={handleChange}
                    className="w-full bg-brand-base border border-brand-elevated text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-brand-action uppercase tracking-widest border-b border-brand-elevated pb-2">Treino e Metas</h3>
              
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-1.5">Objetivo Principal</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full bg-brand-base border border-brand-elevated text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary"
                >
                  {Object.entries(GoalLabel).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-1.5">Nível de Experiência</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full bg-brand-base border border-brand-elevated text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary"
                  >
                    {Object.entries(ExperienceLevelLabel).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-1.5">Dias na Semana</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    name="weeklyFrequency"
                    value={formData.weeklyFrequency}
                    onChange={handleChange}
                    className="w-full bg-brand-base border border-brand-elevated text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-1.5">Lesões ou Restrições (Opcional)</label>
                <textarea
                  name="injuries"
                  value={formData.injuries}
                  onChange={handleChange}
                  placeholder="Ex: Dor no ombro direito..."
                  rows="2"
                  className="w-full bg-brand-base border border-brand-elevated text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary resize-none"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-brand-elevated shrink-0 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-bold text-text-secondary border border-brand-elevated hover:bg-brand-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-profile-form"
            className="flex-1 flex items-center justify-center gap-2 bg-brand-action hover:bg-brand-structural text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-brand-action/20"
          >
            <Save size={18} />
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
