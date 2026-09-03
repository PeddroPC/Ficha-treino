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
      <div className="relative bg-brand-surface border border-brand-elevated rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Botão fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {/* Ícone de alerta */}
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <AlertTriangle size={24} className="text-red-500" />
        </div>

        {/* Textos */}
        <h2
          id="delete-modal-title"
          className="text-center text-lg font-bold text-text-primary mb-1"
        >
          {title}
        </h2>
        <p className="text-center text-sm text-text-secondary mb-2 font-medium">
          Você está prestes a excluir:
        </p>
        <p className="text-center text-sm font-bold text-text-primary bg-brand-base border border-brand-elevated rounded-lg px-3 py-2 mb-3">
          "{itemName}"
        </p>
        <p className="text-center text-xs text-text-muted mb-6">
          {description}
        </p>

        {/* Ações */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            data-testid="btn-cancel-delete"
            className="flex-1 border border-brand-elevated bg-brand-base text-text-secondary font-bold py-2.5 rounded-xl hover:bg-brand-elevated transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose() }}
            data-testid="btn-confirm-delete"
            className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold py-2.5 rounded-xl transition-colors text-sm"
          >
            Sim, excluir
          </button>
        </div>
      </div>
    </div>
  )
}
