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
    blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-500',   icon: 'bg-blue-500/20' },
    green:  { bg: 'bg-green-500/10',  text: 'text-green-500',  icon: 'bg-green-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', icon: 'bg-purple-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', icon: 'bg-orange-500/20' },
  }

  const trendColors = {
    up:      'text-green-500',
    down:    'text-red-500',
    neutral: 'text-text-muted',
  }

  const trendIcons = {
    up:      '↑',
    down:    '↓',
    neutral: '→',
  }

  const colors = colorMap[color]

  return (
    <div className={`${colors.bg} border border-${color}-500/20 rounded-2xl p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {title}
        </span>
        <div className={`${colors.icon} ${colors.text} p-2 rounded-xl`}>
          {icon}
        </div>
      </div>

      <div>
        <p className={`text-3xl font-extrabold ${colors.text}`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5 font-medium">{subtitle}</p>
        )}
      </div>

      {trend && trendLabel && (
        <p className={`text-xs font-bold ${trendColors[trend]}`}>
          <span>{trendIcons[trend]} </span>
          {trendLabel}
        </p>
      )}
    </div>
  )
}
