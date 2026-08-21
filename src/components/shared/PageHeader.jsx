// ============================================================
// components/shared/PageHeader.jsx — Cabeçalho de página
// ============================================================

/**
 * @param {{ title: string, subtitle?: string, action?: React.ReactNode }} props
 */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
