import { useState } from 'react'
import { PageHeader } from '../components/shared/PageHeader.jsx'
import { Card } from '../components/ui/Card.jsx'
import useProfileStore from '../stores/useProfileStore.js'
import { GoalLabel } from '../constants/enums.js'
import { User, Trash2, ShieldAlert, Activity, Calendar, Info, Edit3, Dumbbell, X, Check } from 'lucide-react'
import { EditProfileModal, ExperienceLevelLabel } from '../components/profile/EditProfileModal.jsx'
import { AuthService } from '../backend/auth/AuthService.js'

export default function ProfilePage() {
  const profile = useProfileStore((s) => s.profile)
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

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

      {/* 4. Conta & Segurança */}
      <div className="bg-brand-surface border border-brand-elevated rounded-xl p-5 shadow-sm max-w-4xl">
        <div>
          <h3 className="text-md font-bold text-text-primary mb-1 flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-500" />
            Sair da Conta
          </h3>
          <p className="text-sm text-text-secondary mb-5">Você pode sair e entrar com outra conta com segurança.</p>
          
          {!confirmLogout ? (
            <button 
              onClick={() => setConfirmLogout(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold py-3.5 px-4 rounded-xl transition-colors border border-red-500/20"
            >
              <Trash2 size={18} />
              Desconectar (Sair)
            </button>
          ) : (
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-4">
              <p className="text-sm font-bold text-text-primary text-center">Tem certeza que deseja sair?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmLogout(false)}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-elevated text-text-primary hover:bg-brand-base font-bold py-2.5 px-4 rounded-lg transition-colors border border-brand-elevated"
                >
                  <X size={16} />
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                    await AuthService.signOut()
                    window.location.href = '/login'
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600 font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                >
                  <Check size={16} />
                  Sim, Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Edição */}
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  )
}
