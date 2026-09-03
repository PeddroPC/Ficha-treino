// ============================================================
// components/shared/Sidebar.jsx — Navegação lateral principal
// ============================================================
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Dumbbell,
  History,
  User,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/fichas',    label: 'Fichas',      icon: ClipboardList },
  { to: '/exercicios', label: 'Exercícios', icon: Dumbbell },
  { to: '/historico', label: 'Histórico',   icon: History },
  { to: '/perfil',    label: 'Perfil',      icon: User },
]

export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-brand-base flex flex-col border-r border-brand-elevated">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-brand-elevated">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏋️</span>
          <div>
            <h1 className="text-text-primary font-bold text-lg leading-none">FitProgress</h1>
            <p className="text-text-muted text-xs mt-0.5">Gestão de Treinos</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors',
                isActive
                  ? 'bg-brand-action text-white shadow-sm shadow-brand-action/20'
                  : 'text-text-secondary hover:bg-brand-elevated hover:text-text-primary',
              ].join(' ')
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-brand-elevated">
        <p className="text-text-muted text-xs font-medium">MVP v0.1.0</p>
      </div>
    </aside>
  )
}
