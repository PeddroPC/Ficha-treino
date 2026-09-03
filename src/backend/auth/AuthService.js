import { supabase } from '../supabaseClient.js'
import useAuthStore from '../../stores/useAuthStore.js'
import { setActiveUserId } from '../../lib/localStorage.js'

import useProfileStore from '../../stores/useProfileStore.js'

export const AuthService = {
  /**
   * Inicia o listener de sessão do Supabase.
   * Chamado no Bootstrap da aplicação.
   */
  initializeListener: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      AuthService._handleSessionUpdate(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      AuthService._handleSessionUpdate(session)
    })

    return subscription
  },

  _handleSessionUpdate: (session) => {
    if (session?.user) {
      setActiveUserId(session.user.id)
      useAuthStore.getState().setUserAndSession(session.user, session)

      const profileStore = useProfileStore.getState()
      if (!profileStore.profile) {
        profileStore.setProfile({
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Atleta',
          birthDate: null,
          weightKg: null,
          heightCm: null,
          goal: 'hypertrophy'
        })
      }
    } else {
      setActiveUserId(null)
      useAuthStore.getState().clearSession()
    }
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    
    // Força a atualização do estado local ANTES de retornar para a UI
    // Isso evita que o ProtectedRoute expulse o usuário de volta para o login
    // enquanto o listener global (onAuthStateChange) ainda não disparou.
    if (data.session) {
      AuthService._handleSessionUpdate(data.session)
    }
    
    return data
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}
