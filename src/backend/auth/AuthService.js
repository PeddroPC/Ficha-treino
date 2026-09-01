import { supabase } from '../supabaseClient.js'
import useAuthStore from '../../stores/useAuthStore.js'
import { setActiveUserId } from '../../lib/localStorage.js'

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
    return data
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}
