// ============================================================
// App.jsx — Configuração de Rotas (React Router v7)
// ============================================================
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout }       from './layouts/AppLayout.jsx'
import DashboardPage       from './pages/DashboardPage.jsx'
import WorkoutSheetsPage   from './pages/WorkoutSheetsPage.jsx'
import ExercisesPage       from './pages/ExercisesPage.jsx'
import LogHistoryPage      from './pages/LogHistoryPage.jsx'
import ProfilePage         from './pages/ProfilePage.jsx'
import ProgressaoPage      from './pages/ProgressaoPage.jsx'
import BodyMetricsPage     from './pages/BodyMetricsPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index                  element={<DashboardPage />} />
          <Route path="fichas"          element={<WorkoutSheetsPage />} />
          <Route path="progressao"      element={<ProgressaoPage />} />
          <Route path="exercicios"      element={<ExercisesPage />} />
          <Route path="metricas"        element={<BodyMetricsPage />} />
          <Route path="historico"       element={<LogHistoryPage />} />
          <Route path="perfil"          element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
