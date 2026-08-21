// ============================================================
// pages/ProfilePage.jsx — Perfil do Usuário (stub Fase 1)
// ============================================================
import { PageHeader } from '../components/shared/PageHeader.jsx'
import { Card } from '../components/ui/Card.jsx'
import useProfileStore from '../stores/useProfileStore.js'
import { GoalLabel } from '../constants/enums.js'
import { User } from 'lucide-react'

export default function ProfilePage() {
  const profile = useProfileStore((s) => s.profile)

  if (!profile) {
    return (
      <div>
        <PageHeader title="Perfil" />
        <Card className="py-16 text-center">
          <User size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Nenhum perfil encontrado.</p>
        </Card>
      </div>
    )
  }

  const fields = [
    { label: 'Nome', value: profile.name },
    { label: 'Data de Nascimento', value: profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('pt-BR') : '–' },
    { label: 'Peso', value: profile.weightKg ? `${profile.weightKg} kg` : '–' },
    { label: 'Altura', value: profile.heightCm ? `${profile.heightCm} cm` : '–' },
    { label: 'Objetivo', value: GoalLabel[profile.goal] ?? profile.goal },
  ]

  return (
    <div>
      <PageHeader
        title="Perfil"
        subtitle="Suas informações pessoais"
        action={
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            Editar
          </button>
        }
      />
      <Card className="max-w-lg">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
            <User size={28} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
            <p className="text-gray-400 text-sm">{GoalLabel[profile.goal] ?? profile.goal}</p>
          </div>
        </div>
        <dl className="space-y-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <dt className="text-sm text-gray-500">{label}</dt>
              <dd className="text-sm font-semibold text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  )
}
