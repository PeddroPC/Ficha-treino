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
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none ' +
    'focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-measurement-title"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Ruler size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 id="form-measurement-title" className="text-base font-bold text-gray-900 leading-none">
                {isEditing ? 'Editar Avaliação' : 'Nova Avaliação'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Preencha apenas os campos que mediu</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">

            {/* Data */}
            <div>
              <label htmlFor="meas-date" className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
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
              <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
                <Scale size={12} />
                Medidas (deixe em branco o que não mediu)
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {FIELDS.map(({ key, label, unit, step, placeholder }) => (
                  <div key={key}>
                    <label htmlFor={`meas-${key}`} className="block text-xs font-medium text-gray-500 mb-1">
                      {label} <span className="text-gray-300">({unit})</span>
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
              <label htmlFor="meas-notes" className="block text-xs font-semibold text-gray-600 mb-1.5">
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
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="btn-save-measurement"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {isEditing ? 'Salvar Alterações' : 'Salvar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
