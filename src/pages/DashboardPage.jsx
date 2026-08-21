// ============================================================
// pages/DashboardPage.jsx — Dashboard redesenhado
// Layout inspirado no FitProgress: 3 colunas + 2 colunas abaixo
// ============================================================
import { useState, useMemo } from 'react'
import useProfileStore from '../stores/useProfileStore.js'
import useLogStore     from '../stores/useLogStore.js'
import useWorkoutStore from '../stores/useWorkoutStore.js'

import { FichasList }       from '../components/dashboard/FichasList.jsx'
import { ProgressionChart } from '../components/dashboard/ProgressionChart.jsx'
import { FichaDetail }      from '../components/dashboard/FichaDetail.jsx'
import { RecentWorkouts }   from '../components/dashboard/RecentWorkouts.jsx'
import { BodyMetrics }      from '../components/dashboard/BodyMetrics.jsx'

export default function DashboardPage() {
  const profile = useProfileStore((s) => s.profile)
  const sheets  = useWorkoutStore((s) => s.sheets)
  const logs    = useLogStore((s) => s.logs)

  // Ficha selecionada no painel de detalhes
  const [selectedSheetId, setSelectedSheetId] = useState(
    () => sheets.filter((s) => s.isActive)[1]?.id ?? sheets[0]?.id ?? null
  )

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }, [])

  return (
    <div className="space-y-5">

      {/* ── Saudação ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
          {greeting}, {profile?.name ?? 'Atleta'}! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Sua Jornada Começa Aqui.
        </p>
      </div>

      {/* ── Faixa de estatísticas rápidas ─────────────────── */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        <QuickStat
          label="Fichas Ativas"
          value={sheets.filter((s) => s.isActive).length}
          sub="fichas"
          color="blue"
        />
        <QuickStat
          label="Treinos (30d)"
          value={logs.filter((l) => {
            const d = new Date(l.startedAt)
            const cutoff = new Date()
            cutoff.setDate(cutoff.getDate() - 30)
            return d >= cutoff
          }).length}
          sub="sessões"
          color="green"
        />
        <QuickStat
          label="Total de Logs"
          value={logs.length}
          sub="registros"
          color="purple"
        />
      </div>

      {/* ── 3 colunas: Fichas | Gráfico | Detalhes ─────────── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '220px 1fr 240px' }}>
        {/* Col 1 – Minhas Fichas */}
        <FichasList
          selectedSheetId={selectedSheetId}
          onSelect={setSelectedSheetId}
        />

        {/* Col 2 – Gráfico de Progressão */}
        <ProgressionChart />

        {/* Col 3 – Detalhes da Ficha */}
        <FichaDetail sheetId={selectedSheetId} />
      </div>

      {/* ── 2 colunas inferiores: Recentes | Métricas ──────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentWorkouts />
        <BodyMetrics />
      </div>
    </div>
  )
}

// ── Componente auxiliar interno ──────────────────────────────
function QuickStat({ label, value, sub, color }) {
  const cls = {
    blue:   'bg-blue-50   text-blue-700',
    green:  'bg-green-50  text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <div className={`${cls[color]} rounded-xl px-4 py-3 flex items-center gap-3`}>
      <div>
        <p className="text-2xl font-extrabold leading-none">{value}</p>
        <p className="text-xs font-medium mt-0.5 opacity-70">{sub}</p>
      </div>
      <p className="text-xs font-semibold opacity-60 ml-auto text-right leading-tight max-w-[80px]">
        {label}
      </p>
    </div>
  )
}
