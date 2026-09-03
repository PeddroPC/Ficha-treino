// ============================================================
// components/dashboard/ProgressionChart.jsx
// Gráfico de linha — progressão de cargas dos últimos 30 dias
// Usa Recharts LineChart com dados calculados dos execution sets
// ============================================================
import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import useLogStore from '../../stores/useLogStore.js'
import useExerciseStore from '../../stores/useExerciseStore.js'

const COLORS = ['#169C96', '#D9AD5B', '#3b82f6', '#f43f5e', '#8b5cf6']

/** Formata Date para string curta "DD/MM" */
const fmt = (dateStr) => {
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function ProgressionChart({ sheetId }) {
  const logs     = useLogStore((s) => s.logs)
  const sets     = useLogStore((s) => s.sets)
  const exercises = useExerciseStore((s) => s.exercises)

  const [timeframe, setTimeframe] = useState(30)

  // Filtra logs que pertencem à ficha selecionada (se houver)
  const validLogIds = useMemo(() => {
    if (!sheetId) return new Set(logs.map(l => l.id))
    return new Set(logs.filter((l) => l.sheetId === sheetId).map((l) => l.id))
  }, [logs, sheetId])

  /** 1. Determina dinamicamente os top 3 exercícios mais frequentes da ficha selecionada */
  const trackedExercises = useMemo(() => {
    const relevantSets = sets.filter((s) => validLogIds.has(s.logId))
    if (!relevantSets.length) return []
    
    const count = {}
    relevantSets.forEach((s) => {
      count[s.exerciseId] = (count[s.exerciseId] || 0) + 1
    })
    
    return Object.entries(count)
      .sort((a, b) => b[1] - a[1]) // Descending
      .slice(0, 3)
      .map(([id], idx) => {
        const ex = exercises.find((e) => e.id === id)
        return {
          id,
          ex,
          color: COLORS[idx % COLORS.length]
        }
      })
      .filter((t) => t.ex) // garante que existe
  }, [sets, exercises, validLogIds])

  /** 2. Monta os dados do gráfico: uma entrada por sessão, com peso máximo de cada exercício rastreadado */
  const chartData = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - timeframe)

    // Agrupa logs por data (dia)
    const logsByDate = {}
    logs
      .filter((l) => new Date(l.startedAt) >= cutoff && validLogIds.has(l.id))
      .forEach((log) => {
        const day = log.startedAt.slice(0, 10)
        if (!logsByDate[day]) logsByDate[day] = []
        logsByDate[day].push(log.id)
      })

    return Object.entries(logsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, logIdsForDay]) => {
        const point = { date: fmt(day) }

        trackedExercises.forEach(({ id, ex }) => {
          if (!ex) return
          const relevant = sets.filter(
            (s) => logIdsForDay.includes(s.logId) && s.exerciseId === id
          )
          if (relevant.length) {
            point[ex.name] = Math.max(...relevant.map((s) => s.weightKg))
          }
        })

        return point
      })
  }, [logs, sets, trackedExercises, validLogIds, timeframe])

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-brand-surface border border-brand-elevated rounded-lg shadow-lg p-3 text-xs z-50 relative">
        <p className="font-bold text-text-primary mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-medium">
            {entry.name}: <span className="font-bold">{entry.value} kg</span>
          </p>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[10px] font-bold text-text-primary uppercase tracking-widest">
          Progressão de Cargas
        </h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(Number(e.target.value))}
          className="bg-brand-surface border border-brand-elevated text-text-secondary text-xs rounded-lg px-2 py-1 outline-none focus:border-brand-action"
        >
          <option value={7}>Semanal</option>
          <option value={30}>Mensal</option>
          <option value={90}>3 Meses</option>
        </select>
      </div>

      <div className="bg-brand-surface border border-brand-elevated rounded-xl p-4 shadow-sm relative">
        {chartData.length < 2 ? (
          <div className="flex items-center justify-center h-48 text-text-muted text-sm text-center px-4">
            Sua progressão começa aqui. Registre treinos desta ficha em dias diferentes para ver seu crescimento!
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
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
    </div>
  )
}
