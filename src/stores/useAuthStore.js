import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isInitialized: false,
  
  setUserAndSession: (user, session) => set({
    user,
    session,
    isAuthenticated: !!user,
    isInitialized: true
  }),
  
  clearSession: () => set({
    user: null,
    session: null,
    isAuthenticated: false,
    isInitialized: true
  }),

  setInitialized: (val) => set({ isInitialized: val })
}))

export default useAuthStore
