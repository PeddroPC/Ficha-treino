// ============================================================
// layouts/AppLayout.jsx — Shell com Navbar + FAB + Drawers
// ============================================================
import { useState } from 'react'
import { Outlet }   from 'react-router-dom'
import { Zap }      from 'lucide-react'
import { Navbar }           from '../components/shared/Navbar.jsx'
import { WorkoutDrawer }    from '../components/workout/WorkoutDrawer.jsx'
import { QuickLogDrawer }   from '../components/workout/QuickLogDrawer.jsx'
import { ToastContainer }   from '../components/ui/ToastContainer.jsx'

export function AppLayout() {
  const [quickLogOpen, setQuickLogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Conteúdo principal — pb extra para não ficar atrás do FAB */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-6 pb-28">
        <Outlet />
      </main>

      {/* ── FAB — Registro Rápido ─────────────────────────── */}
      <button
        type="button"
        onClick={() => setQuickLogOpen(true)}
        className="
          fixed bottom-6 right-6 z-30
          flex items-center gap-2
          bg-blue-600 hover:bg-blue-700 active:scale-95
          text-white font-bold
          px-5 py-3.5 rounded-2xl
          shadow-xl hover:shadow-2xl
          transition-all duration-150
        "
        aria-label="Abrir Registro Rápido"
      >
        <Zap size={17} />
        <span className="hidden sm:inline">Registro Rápido</span>
        <span className="sm:hidden">+</span>
      </button>

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
