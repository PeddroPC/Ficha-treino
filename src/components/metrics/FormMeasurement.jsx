// ============================================================
// components/metrics/FormMeasurement.jsx
// Modal/form para adicionar ou editar uma avaliação corporal.
// Campos: data, peso, cintura, quadril, peitoral, bícep, coxa,
// panturrilha, % gordura e notas livres.
// ============================================================
import { useState } from 'react'
import { X, Ruler, Scale, CalendarDays } from 'lucide-react'

const today = () => new Date().toISOString().slice(0, 10)

const FIELDS = [
  { key: 'weightKg',   label: 'Peso',        unit: 'kg',  step: 0.1, placeholder: '80.0' },
  { key: 'waistCm',    label: 'Cintura',      unit: 'cm',  step: 0.5, placeholder: '99.5' },
  { key: 'hipCm',      label: 'Quadril',      unit: 'cm',  step: 0.5, placeholder: '95.0' },
  { key: 'chestCm',    label: 'Peitoral',     unit: 'cm',  step: 0.5, placeholder: '100.0' },
  { key: 'armCm',      label: 'Bícep',        unit: 'cm',  step: 0.5, placeholder: '35.0' },
  { key: 'thighCm',    label: 'Coxa',         unit: 'cm',  step: 0.5, placeholder: '55.0' },
  { key: 'calfCm',     label: 'Panturrilha',  unit: 'cm',  step: 0.5, placeholder: '37.0' },
  { key: 'bodyFatPct', label: '% Gordura',    unit: '%',   step: 0.1, placeholder: '14.5' },
]

export function FormMeasurement({ measurement = null, onSubmit, onClose }) {
  const isEditing = !!measurement

  const [form, setForm] = useState({
    date:       measurement?.date       ?? today(),
    weightKg:   measurement?.weightKg   ?? '',
    waistCm:    measurement?.waistCm    ?? '',
    hipCm:      measurement?.hipCm      ?? '',
    chestCm:    measurement?.chestCm    ?? '',
    armCm:      measurement?.armCm      ?? '',
    thighCm:    measurement?.thighCm    ?? '',
    calfCm:     measurement?.calfCm     ?? '',
    bodyFatPct: measurement?.bodyFatPct ?? '',
    notes:      measurement?.notes      ?? '',
  })

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Converte campos numéricos, ignorando strings vazias
    const parsed = { date: form.date, notes: form.notes }
    FIELDS.forEach(({ key }) => {
      parsed[key] = form[key] !== '' ? parseFloat(form[key]) : null
    })
    onSubmit(parsed)
  }

  const inputCls =
    'w-full min-h-[44px] rounded-xl border border-brand-elevated bg-brand-base px-3 py-3 text-base text-text-primary outline-none ' +
    'focus:border-brand-action focus:bg-brand-surface focus:ring-2 focus:ring-brand-action/20 transition-all placeholder:text-text-muted'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-measurement-title"
    >
      <div className="relative bg-brand-surface border border-brand-elevated rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-elevated">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Ruler size={18} className="text-emerald-500" />
            </div>
            <div>
              <h2 id="form-measurement-title" className="text-base font-bold text-text-primary leading-none">
                {isEditing ? 'Editar Avaliação' : 'Nova Avaliação'}
              </h2>
              <p className="text-xs text-text-muted mt-0.5 font-medium">Preencha apenas os campos que mediu</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-11 h-11 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-brand-elevated transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">

            {/* Data */}
            <div>
              <label htmlFor="meas-date" className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary mb-1.5">
                <CalendarDays size={12} />
                Data da avaliação
              </label>
              <input
                id="meas-date"
                type="date"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
                className={inputCls}
              />
            </div>

            {/* Grid de medidas */}
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary mb-2">
                <Scale size={12} />
                Medidas (deixe em branco o que não mediu)
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {FIELDS.map(({ key, label, unit, step, placeholder }) => (
                  <div key={key}>
                    <label htmlFor={`meas-${key}`} className="block text-xs font-medium text-text-muted mb-1">
                      {label} <span className="text-text-secondary">({unit})</span>
                    </label>
                    <input
                      id={`meas-${key}`}
                      type="number"
                      min="0"
                      step={step}
                      value={form[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label htmlFor="meas-notes" className="block text-xs font-semibold text-text-secondary mb-1.5">
                Notas (opcional)
              </label>
              <textarea
                id="meas-notes"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Ex.: Medi em jejum, logo cedo..."
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-5 pt-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] border border-brand-elevated bg-brand-base text-text-secondary font-bold py-3 rounded-xl hover:bg-brand-elevated transition-colors text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="btn-save-measurement"
              className="flex-1 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors text-base shadow-sm shadow-emerald-900/20"
            >
              {isEditing ? 'Salvar Alterações' : 'Salvar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
