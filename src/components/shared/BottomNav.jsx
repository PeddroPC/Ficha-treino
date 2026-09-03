import { NavLink } from 'react-router-dom'
import { Home, LineChart, Plus, History, ClipboardList } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/progressao', label: 'Progressão', icon: LineChart },
  { isAction: true, label: 'Treino', icon: Plus },
  { to: '/historico', label: 'Histórico', icon: History },
  { to: '/fichas', label: 'Fichas', icon: ClipboardList },
]

export function BottomNav({ onOpenWorkout }) {
  return (
    <nav className="fixed bottom-0 w-full z-40 bg-brand-structural border-t border-brand-structural pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {NAV_ITEMS.map((item, idx) => {
          if (item.isAction) {
            return (
              <button
                key="action-workout"
                type="button"
                onClick={onOpenWorkout}
                className="flex flex-col items-center justify-center w-12 h-12 bg-brand-action rounded-full text-white active:scale-95 transition-transform shadow-lg shadow-brand-action/20"
              >
                <item.icon className="w-6 h-6" strokeWidth={2.5} />
              </button>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-16 gap-1 transition-colors ${
                  isActive ? 'text-brand-action' : 'text-slate-400 hover:text-white'
                }`
              }
            >
              <item.icon className="w-6 h-6" strokeWidth={2} />
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
