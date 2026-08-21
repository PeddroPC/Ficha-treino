// ============================================================
// pages/ProgressaoPage.jsx — Progressão de cargas (Fase 1 stub)
// ============================================================
import { PageHeader } from '../components/shared/PageHeader.jsx'
import { ProgressionChart } from '../components/dashboard/ProgressionChart.jsx'

export default function ProgressaoPage() {
  return (
    <div>
      <PageHeader
        title="Progressão de Cargas"
        subtitle="Acompanhe a evolução das suas cargas ao longo do tempo"
      />
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProgressionChart />
      </div>
    </div>
  )
}
