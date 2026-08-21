// ============================================================
// components/shared/Navbar.jsx — Barra de navegação horizontal
// Inspirado no layout FitProgress com logo, links e usuário
// ============================================================
import { NavLink } from 'react-router-dom'
import useProfileStore from '../../stores/useProfileStore.js'

const NAV_LINKS = [
  { to: '/',           label: 'Dashboard' },
  { to: '/fichas',     label: 'Meus Treinos' },
  { to: '/progressao', label: 'Progressão' },
  { to: '/exercicios', label: 'Exercícios' },
]

export function Navbar() {
  const profile = useProfileStore((s) => s.profile)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-8">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg">🏋️</span>
          <span className="font-extrabold text-blue-600 tracking-tight text-base">
            FITPROGRESS
          </span>
        </NavLink>

        {/* Links centrais */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Usuário */}
        <div className="flex items-center gap-3 shrink-0">
          <NavLink
            to="/perfil"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            {profile?.name ?? 'Atleta'}
          </NavLink>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {(profile?.name ?? 'A').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}
