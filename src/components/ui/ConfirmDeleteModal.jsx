// ============================================================
// components/ui/ConfirmDeleteModal.jsx
// Modal de confirmação de exclusão com backdrop-blur.
// Reutilizável em qualquer parte do app.
// ============================================================
import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onConfirm: () => void,
 *   itemName: string,
 *   title?: string,
 *   description?: string,
 * }} props
 */
export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  title = 'Excluir item',
  description = 'Esta ação não pode ser desfeita.',
}) {
  // Fecha com ESC
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Backdrop com blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Painel do modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Botão fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {/* Ícone de alerta */}
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-600" />
        </div>

        {/* Textos */}
        <h2
          id="delete-modal-title"
          className="text-center text-lg font-bold text-gray-900 mb-1"
        >
          {title}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-2">
          Você está prestes a excluir:
        </p>
        <p className="text-center text-sm font-semibold text-gray-800 bg-gray-50 rounded-lg px-3 py-2 mb-3">
          "{itemName}"
        </p>
        <p className="text-center text-xs text-gray-400 mb-6">
          {description}
        </p>

        {/* Ações */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            data-testid="btn-cancel-delete"
            className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose() }}
            data-testid="btn-confirm-delete"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
          >
            Sim, excluir
          </button>
        </div>
      </div>
    </div>
  )
}
