import { useRef, useState } from 'react'
import { PageHeader } from '../components/shared/PageHeader.jsx'
import { Card } from '../components/ui/Card.jsx'
import useProfileStore from '../stores/useProfileStore.js'
import useSettingsStore from '../stores/useSettingsStore.js'
import { GoalLabel } from '../constants/enums.js'
import { User, Download, Upload, Trash2, ShieldAlert, Activity, Ruler, Calendar, Info, Edit3, Dumbbell } from 'lucide-react'
import { exportDataAsJson, importDataFromJson, enableDemoMode, enableRealMode } from '../lib/dataManager.js'
import { EditProfileModal, ExperienceLevelLabel } from '../components/profile/EditProfileModal.jsx'

export default function ProfilePage() {
  const profile = useProfileStore((s) => s.profile)
  const isDemoMode = useSettingsStore((s) => s.isDemoMode)
  const fileInputRef = useRef(null)
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

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

  // Helpers
  const getAge = (birthDate) => {
    if (!birthDate) return 'Idade não informada'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return `${age} anos`
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Perfil & Configurações"
        subtitle="Sua Ficha Cadastral e Evolutiva"
      />

      {/* 1. Header Card (Identificação) */}
      <div className="bg-brand-surface border border-brand-elevated rounded-xl p-5 shadow-sm max-w-xl relative">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-4 right-4 text-text-muted hover:text-brand-action transition-colors bg-brand-base border border-brand-elevated p-2 rounded-lg"
          aria-label="Editar Perfil"
        >
          <Edit3 size={18} />
        </button>

        {!profile ? (
          <div className="py-10 text-center">
            <User size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium mb-4">Nenhum perfil configurado.</p>
            <button onClick={() => setIsEditModalOpen(true)} className="bg-brand-action text-white font-bold py-2 px-6 rounded-lg">Criar Perfil</button>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-brand-action text-white rounded-full flex flex-col items-center justify-center shrink-0 text-2xl font-bold shadow-md">
              {(profile.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-extrabold text-text-primary truncate">{profile.name}</h3>
              <p className="text-text-secondary font-medium text-sm mt-1">{getAge(profile.birthDate)}</p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-brand-elevated text-text-secondary text-xs font-bold px-2.5 py-1 rounded-md">
                  {ExperienceLevelLabel[profile.experienceLevel] ?? 'Nível não definido'}
                </span>
                <span className="bg-brand-action/10 text-brand-action text-xs font-bold px-2.5 py-1 rounded-md">
                  Alvo: {GoalLabel[profile.goal] ?? profile.goal}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* 2. Biometric Card */}
          <div className="bg-brand-surface border border-brand-elevated rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-brand-action uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={16} /> Biometria Básica
            </h3>
            
            <dl className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div>
                <dt className="text-xs font-bold text-text-muted uppercase">Peso Atual</dt>
                <dd className="text-xl font-bold text-text-primary mt-0.5">{profile.weightKg ? `${profile.weightKg} kg` : '–'}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-text-muted uppercase">Altura</dt>
                <dd className="text-xl font-bold text-text-primary mt-0.5">{profile.heightCm ? `${profile.heightCm} cm` : '–'}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-text-muted uppercase">IMC</dt>
                <dd className="text-xl font-bold text-text-primary mt-0.5">
                  {profile.weightKg && profile.heightCm 
                    ? (profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1) 
                    : '–'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-text-muted uppercase">Gênero</dt>
                <dd className="text-xl font-bold text-text-primary mt-0.5">
                  {profile.gender === 'M' ? 'Masculino' : profile.gender === 'F' ? 'Feminino' : 'Outro'}
                </dd>
              </div>
            </dl>
          </div>

          {/* 3. Training Preferences Card */}
          <div className="bg-brand-surface border border-brand-elevated rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-brand-action uppercase tracking-widest mb-4 flex items-center gap-2">
              <Dumbbell size={16} /> Preferências & Restrições
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-text-muted uppercase mb-1 flex items-center gap-1.5"><Calendar size={14}/> Frequência Alvo</p>
                <p className="text-base font-bold text-text-primary">{profile.weeklyFrequency || 4} dias na semana</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-text-muted uppercase mb-1 flex items-center gap-1.5"><Info size={14} className="text-amber-500"/> Lesões / Observações</p>
                <p className={`text-sm ${profile.injuries ? 'text-text-primary font-medium' : 'text-text-muted italic'}`}>
                  {profile.injuries || "Nenhuma restrição informada. Apto para treino padrão."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Configurações e Backup (Sistema) */}
      <div className="bg-brand-surface border border-brand-elevated rounded-xl p-5 shadow-sm max-w-4xl">
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
      
      {/* Modal de Edição */}
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  )
}
