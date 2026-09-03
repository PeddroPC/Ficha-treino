// ============================================================
// layouts/AppLayout.jsx — Shell com TopBar + BottomNav + Drawers
// ============================================================
import { useState } from 'react'
import { Outlet }   from 'react-router-dom'
import { TopBar }           from '../components/shared/TopBar.jsx'
import { BottomNav }        from '../components/shared/BottomNav.jsx'
import { WorkoutDrawer }    from '../components/workout/WorkoutDrawer.jsx'
import { QuickLogDrawer }   from '../components/workout/QuickLogDrawer.jsx'
import { ToastContainer }   from '../components/ui/ToastContainer.jsx'

export function AppLayout() {
  const [quickLogOpen, setQuickLogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-brand-base flex flex-col w-full max-w-full overflow-x-hidden text-text-primary">
      <TopBar />

      {/* Conteúdo principal — pb extra para não ficar atrás da BottomNav */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-4 pb-24">
        <Outlet />
      </main>

      <BottomNav onOpenWorkout={() => setQuickLogOpen(true)} />

      {/* ── Drawers ─────────────────────────────────────────── */}
      <QuickLogDrawer
        isOpen={quickLogOpen}
        onClose={() => setQuickLogOpen(false)}
      />
      <WorkoutDrawer />

      {/* ── Toast notifications ──────────────────────────────── */}
      <ToastContainer />
    </div>
  )
}
