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
      <div className="bg-brand-surface border border-brand-elevated rounded-xl p-5 shadow-sm max-w-lg">
        {!profile ? (
          <div className="py-10 text-center">
            <User size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">Nenhum perfil configurado.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-brand-elevated">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-brand-elevated rounded-2xl flex items-center justify-center">
                  <User size={28} className="text-brand-action" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">{profile.name}</h3>
                  <p className="text-text-secondary font-medium text-sm mt-0.5">{GoalLabel[profile.goal] ?? profile.goal}</p>
                </div>
              </div>
              <button
                type="button"
                className="bg-brand-elevated hover:opacity-80 text-text-primary text-sm font-bold px-4 py-2.5 rounded-xl transition-opacity"
              >
                Editar
              </button>
            </div>
            <dl className="space-y-4">
              {fields.map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <dt className="text-sm font-medium text-text-muted">{label}</dt>
                  <dd className="text-sm font-bold text-text-primary">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>

      {/* Seção de Configurações / Backup */}
      <div className="bg-brand-surface border border-brand-elevated rounded-xl p-5 shadow-sm max-w-lg">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-text-primary">Backup & Restauração</h3>
          <p className="text-sm text-text-secondary mt-1">Seus dados são salvos apenas neste navegador. Exporte-os frequentemente para não perdê-los.</p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          <button 
            onClick={exportDataAsJson}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-action/10 text-brand-action hover:bg-brand-action/20 border border-brand-action/20 font-bold py-3.5 px-4 rounded-xl transition-colors"
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
            className="flex-1 flex items-center justify-center gap-2 bg-brand-base text-text-primary hover:bg-brand-elevated font-bold py-3.5 px-4 rounded-xl transition-colors border border-brand-elevated"
          >
            <Upload size={18} />
            Importar Dados
          </button>
        </div>

        {/* Zona de Perigo / Modo Demo */}
        <div className="mt-8 pt-6 border-t border-brand-elevated">
          <h3 className="text-md font-bold text-text-primary mb-1 flex items-center gap-2">
            Modo de Demonstração
          </h3>
          <p className="text-sm text-text-secondary mb-5">
            {isDemoMode 
              ? "O Modo Demo está ATIVO. Seus dados são de teste." 
              : "Substitui seus dados atuais pelo banco de dados padrão (incluindo os 100 exercícios)."}
          </p>
          
          <button 
            onClick={handleToggleDemo}
            className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl transition-colors border ${
              isDemoMode 
                ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20' 
                : 'bg-brand-action/10 text-brand-action hover:bg-brand-action/20 border-brand-action/20'
            }`}
          >
            {isDemoMode ? "Desativar Modo Demo" : "Ativar Modo Demo (Resetar Dados)"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-brand-elevated">
          <h3 className="text-md font-bold text-text-primary mb-1 flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-500" />
            Sair da Conta
          </h3>
          <p className="text-sm text-text-secondary mb-5">Você pode sair e entrar com outra conta com segurança.</p>
          
          <button 
            onClick={async () => {
              const { AuthService } = await import('../backend/auth/AuthService.js')
              await AuthService.signOut()
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold py-3.5 px-4 rounded-xl transition-colors border border-red-500/20"
          >
            <Trash2 size={18} />
            Desconectar (Sair)
          </button>
        </div>
      </div>
    </div>
  )
}
