// ============================================================
// components/ui/StatCard.jsx — Card de estatística do Dashboard
// ============================================================

/**
 * @param {{
 *   title: string,
 *   value: string | number,
 *   subtitle?: string,
 *   icon: React.ReactNode,
 *   trend?: 'up' | 'down' | 'neutral',
 *   trendLabel?: string,
 *   color?: 'blue' | 'green' | 'purple' | 'orange'
 * }} props
 */
export function StatCard({ title, value, subtitle, icon, trend, trendLabel, color = 'blue' }) {
  const colorMap = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: 'bg-blue-100' },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',  icon: 'bg-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'bg-orange-100' },
  }

  const trendColors = {
    up:      'text-green-600',
    down:    'text-red-500',
    neutral: 'text-gray-400',
  }

  const trendIcons = {
    up:      '↑',
    down:    '↓',
    neutral: '→',
  }

  const colors = colorMap[color]

  return (
    <div className={`${colors.bg} rounded-2xl p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`${colors.icon} ${colors.text} p-2 rounded-xl`}>
          {icon}
        </div>
      </div>

      <div>
        <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {trend && trendLabel && (
        <p className={`text-xs font-medium ${trendColors[trend]}`}>
          <span>{trendIcons[trend]} </span>
          {trendLabel}
        </p>
      )}
    </div>
  )
}
