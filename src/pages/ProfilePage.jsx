import { useRef } from 'react'
import { PageHeader } from '../components/shared/PageHeader.jsx'
import { Card } from '../components/ui/Card.jsx'
import useProfileStore from '../stores/useProfileStore.js'
import useSettingsStore from '../stores/useSettingsStore.js'
import { GoalLabel } from '../constants/enums.js'
import { User, Download, Upload, Trash2, ShieldAlert } from 'lucide-react'
import { exportDataAsJson, importDataFromJson, enableDemoMode, enableRealMode } from '../lib/dataManager.js'

export default function ProfilePage() {
  const profile = useProfileStore((s) => s.profile)
  const isDemoMode = useSettingsStore((s) => s.isDemoMode)
  const fileInputRef = useRef(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        const success = importDataFromJson(content)
        if (!success) alert("Falha ao importar o arquivo. Verifique se é um backup válido do FitProgress.")
      }
    }
    reader.readAsText(file)
    e.target.value = '' // reseta o input
  }

  const handleToggleDemo = () => {
    const confirmMsg = isDemoMode 
      ? "Deseja desativar o Modo Demo? Isso apagará todos os dados atuais e iniciará um Modo Real zerado."
      : "Deseja ativar o Modo Demo? Isso apagará todos os seus dados não salvos e carregará dados de demonstração."
    
    if (confirm(confirmMsg)) {
      if (isDemoMode) {
        enableRealMode()
      } else {
        enableDemoMode()
      }
    }
  }

  const fields = profile ? [
    { label: 'Nome', value: profile.name },
    { label: 'Data de Nascimento', value: profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('pt-BR') : '–' },
    { label: 'Peso', value: profile.weightKg ? `${profile.weightKg} kg` : '–' },
    { label: 'Altura', value: profile.heightCm ? `${profile.heightCm} cm` : '–' },
    { label: 'Objetivo', value: GoalLabel[profile.goal] ?? profile.goal },
  ] : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil & Configurações"
        subtitle="Gerencie seus dados e preferências"
      />

      {/* Seção de Perfil */}
      <Card className="max-w-lg">
        {!profile ? (
          <div className="py-10 text-center">
            <User size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum perfil configurado.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <User size={28} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
                  <p className="text-gray-400 text-sm">{GoalLabel[profile.goal] ?? profile.goal}</p>
                </div>
              </div>
              <button
                type="button"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                Editar
              </button>
            </div>
            <dl className="space-y-4">
              {fields.map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="text-sm font-semibold text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </Card>

      {/* Seção de Configurações / Backup */}
      <Card className="max-w-lg">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Backup & Restauração</h3>
          <p className="text-sm text-gray-500">Seus dados são salvos apenas neste navegador. Exporte-os frequentemente para não perdê-los.</p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          <button 
            onClick={exportDataAsJson}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <Download size={18} />
            Exportar Dados
          </button>
          
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <button 
            onClick={handleImportClick}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 hover:bg-gray-100 font-semibold py-3 px-4 rounded-xl transition-colors border border-gray-200"
          >
            <Upload size={18} />
            Importar Dados
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-md font-bold text-gray-900 mb-1 flex items-center gap-2">
            <ShieldAlert size={18} className="text-orange-500" />
            Sair da Conta
          </h3>
          <p className="text-sm text-gray-500 mb-4">Você pode sair e entrar com outra conta com segurança.</p>
          
          <button 
            onClick={async () => {
              const { AuthService } = await import('../backend/auth/AuthService.js')
              await AuthService.signOut()
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <Trash2 size={18} />
            Desconectar (Sair)
          </button>
        </div>
      </Card>
    </div>
  )
}
