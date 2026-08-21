// ============================================================
// components/ui/Card.jsx — Componente de card base reutilizável
// ============================================================

/**
 * @param {{ className?: string, children: React.ReactNode }} props
 */
export function Card({ className = '', children }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * @param {{ className?: string, children: React.ReactNode }} props
 */
export function CardHeader({ className = '', children }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  )
}

/**
 * @param {{ className?: string, children: React.ReactNode }} props
 */
export function CardTitle({ className = '', children }) {
  return (
    <h3 className={`text-sm font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </h3>
  )
}
