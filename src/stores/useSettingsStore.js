import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { userBoundStorage } from '../lib/localStorage.js'

const useSettingsStore = create(
  persist(
    (set) => ({
      isDemoMode: false,
      setDemoMode: (value) => set({ isDemoMode: value }),
    }),
    {
      name: 'fitprogress:settings',
      storage: createJSONStorage(() => userBoundStorage),
    }
  )
)

export default useSettingsStore
