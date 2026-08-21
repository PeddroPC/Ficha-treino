// ============================================================
// components/dashboard/ProgressionChart.jsx
// Gráfico de linha — progressão de cargas dos últimos 30 dias
// Usa Recharts LineChart com dados calculados dos execution sets
// ============================================================
import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import useLogStore from '../../stores/useLogStore.js'
import useExerciseStore from '../../stores/useExerciseStore.js'

// Exercícios principais a exibir no gráfico (ids dos seeds)
const TRACKED = [
  { id: 'ex-013', color: '#3b82f6' }, // Agachamento
  { id: 'ex-001', color: '#f97316' }, // Supino
  { id: 'ex-004', color: '#22c55e' }, // Levantamento Terra
]

/** Formata Date para string curta "DD/MM" */
const fmt = (dateStr) => {
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function ProgressionChart() {
  const logs     = useLogStore((s) => s.logs)
  const sets     = useLogStore((s) => s.sets)
  const exercises = useExerciseStore((s) => s.exercises)

  /** Monta os dados do gráfico: uma entrada por sessão, com peso máximo de cada exercício */
  const chartData = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)

    // Agrupa logs por data (dia)
    const logsByDate = {}
    logs
      .filter((l) => new Date(l.startedAt) >= cutoff)
      .forEach((log) => {
        const day = log.startedAt.slice(0, 10)
        if (!logsByDate[day]) logsByDate[day] = []
        logsByDate[day].push(log.id)
      })

    return Object.entries(logsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, logIds]) => {
        const point = { date: fmt(day) }

        TRACKED.forEach(({ id }) => {
          const ex = exercises.find((e) => e.id === id)
          if (!ex) return
          const relevant = sets.filter(
            (s) => logIds.includes(s.logId) && s.exerciseId === id
          )
          if (relevant.length) {
            point[ex.name] = Math.max(...relevant.map((s) => s.weightKg))
          }
        })

        return point
      })
  }, [logs, sets, exercises])

  const trackedExercises = TRACKED.map(({ id, color }) => ({
    ex: exercises.find((e) => e.id === id),
    color,
  })).filter((t) => t.ex)

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-bold text-gray-700 mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-medium">
            {entry.name}: <span className="font-bold">{entry.value} kg</span>
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Progressão de Cargas
        </h2>
        <span className="text-xs text-gray-400">Últimos 30 Dias</span>
      </div>

      {chartData.length < 2 ? (
        <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
          Dados insuficientes para exibir o gráfico
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              unit=" kg"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
              iconSize={8}
            />
            {trackedExercises.map(({ ex, color }) => (
              <Line
                key={ex.id}
                type="monotone"
                dataKey={ex.name}
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 4, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
