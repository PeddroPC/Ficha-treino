// ============================================================
// layouts/AppLayout.jsx — Shell com Navbar horizontal + conteúdo
// ============================================================
import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/shared/Navbar.jsx'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
