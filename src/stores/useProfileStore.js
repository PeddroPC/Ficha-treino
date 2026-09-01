// ============================================================
// stores/useProfileStore.js
// Gerencia o perfil do usuário com persistência no LocalStorage.
// ============================================================
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { STORAGE_KEYS, userBoundStorage } from '../lib/localStorage.js'

const useProfileStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      profile: null,

      // ── Actions ─────────────────────────────────────────────
      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...updates, updatedAt: new Date().toISOString() }
            : null,
        })),

      getProfile: () => get().profile,
    }),
    {
      name: `fitprogress:${STORAGE_KEYS.PROFILE}`,
      storage: createJSONStorage(() => userBoundStorage),
    }
  )
)

export default useProfileStore
