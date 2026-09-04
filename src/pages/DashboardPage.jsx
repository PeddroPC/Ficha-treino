// ============================================================
// pages/DashboardPage.jsx — Dashboard mobile-first
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

import { FolderOpen, Dumbbell, LineChart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const profile = useProfileStore((s) => s.profile)
  const sheets  = useWorkoutStore((s) => s.sheets)
  const logs    = useLogStore((s) => s.logs)

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
    <div className="space-y-6">
      {/* ── Saudação ──────────────────────────────────────── */}
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold text-brand-structural leading-tight">
          {greeting}, {profile?.name ?? 'Atleta'}!
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Pronto para mais um treino?
        </p>
      </div>

      {/* ── Faixa de estatísticas rápidas ─────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <QuickStat
          label="Fichas"
          value={sheets.filter((s) => s.isActive).length}
          sub="Ativas"
          icon={FolderOpen}
        />
        <QuickStat
          label="Sessões"
          value={logs.filter((l) => {
            const d = new Date(l.startedAt)
            const cutoff = new Date()
            cutoff.setDate(cutoff.getDate() - 30)
            return d >= cutoff
          }).length}
          sub="30 dias"
          icon={Dumbbell}
        />
        <QuickStat
          label="Registros"
          value={logs.length}
          sub="Totais"
          icon={LineChart}
        />
      </div>

      {/* ── 1 coluna (Mobile-first) ─────────── */}
      {sheets.length === 0 ? (
         <div className="bg-brand-surface border border-brand-elevated rounded-xl py-16 px-4 text-center shadow-sm flex flex-col items-center mt-4">
            <FolderOpen size={40} className="text-text-muted mb-3" />
            <p className="text-text-primary font-bold text-lg">Nenhuma ficha criada ainda</p>
            <p className="text-text-secondary text-sm mt-1 mb-6">Crie sua primeira ficha de treino para começar a registrar sua evolução.</p>
            <Link to="/fichas" className="bg-brand-action hover:bg-brand-action/90 text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-colors">
              Criar Ficha
            </Link>
         </div>
      ) : (
        <div className="flex flex-col gap-6 pt-4">
          <FichasList
            selectedSheetId={selectedSheetId}
            onSelect={setSelectedSheetId}
          />
          
          <ProgressionChart sheetId={selectedSheetId} />
          
          <FichaDetail sheetId={selectedSheetId} />
          
          <RecentWorkouts />
          
          <BodyMetrics />
        </div>
      )}
    </div>
  )
}

// ── Componente auxiliar interno ──────────────────────────────
function QuickStat({ label, value, sub, icon: Icon }) {
  return (
    <div className="bg-brand-surface shadow-sm rounded-xl px-3 py-3 flex justify-between items-start border border-brand-elevated">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">{label}</span>
        <span className="text-2xl font-extrabold text-brand-action leading-tight">{value}</span>
        <span className="text-[9px] font-medium text-text-muted uppercase tracking-widest">{sub}</span>
      </div>
      {Icon && <Icon size={20} className="text-brand-action opacity-60" strokeWidth={1.5} />}
    </div>
  )
}

