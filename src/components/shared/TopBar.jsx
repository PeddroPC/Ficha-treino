import { NavLink, useLocation } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'

// Mapa simples para títulos de página
const PAGE_TITLES = {
  '/': 'Início',
  '/progressao': 'Progressão',
  '/fichas': 'Fichas',
  '/historico': 'Histórico',
  '/metricas': 'Métricas',
  '/exercicios': 'Exercícios',
  '/perfil': 'Perfil',
}

import logo from '../../assets/Logo.jpg'

export function TopBar() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'FITPROGRESS'

  return (
    <header className="sticky top-0 z-40 bg-brand-base/90 backdrop-blur-md border-b border-brand-elevated">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="FitProgress Logo" className="h-6 w-auto object-contain rounded" />
          <span className="font-extrabold text-brand-structural tracking-tight text-base">
            FITPROGRESS
          </span>
        </NavLink>
        
        {location.pathname !== '/' && (
          <div className="text-text-secondary text-sm font-medium">
            {title}
          </div>
        )}
      </div>
    </header>
  )
}
