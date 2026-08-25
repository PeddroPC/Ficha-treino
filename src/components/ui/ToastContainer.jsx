// ============================================================
// components/ui/ToastContainer.jsx
// Renderiza as notificações toast no canto inferior direito,
// acima do FAB de Registro Rápido.
// ============================================================
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import useToastStore from '../../stores/useToastStore.js'

const CONFIG = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-green-600',
    text: 'text-white',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-600',
    text: 'text-white',
  },
  info: {
    icon: Info,
    bg: 'bg-gray-900',
    text: 'text-white',
  },
}

export function ToastContainer() {
  const toasts      = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  return (
    // bottom-24 para não sobrepor o FAB (que está em bottom-6)
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const { icon: Icon, bg, text } = CONFIG[toast.type] ?? CONFIG.info
        return (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 pl-4 pr-3 py-3 rounded-2xl shadow-2xl
              text-sm font-semibold pointer-events-auto
              ${bg} ${text}
            `}
            style={{ animation: 'slideInRight 0.2s ease-out' }}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="ml-1 opacity-70 hover:opacity-100 transition-opacity shrink-0"
              aria-label="Fechar notificação"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}

      {/* Keyframe via style tag — evita dependência de tailwind animate */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
