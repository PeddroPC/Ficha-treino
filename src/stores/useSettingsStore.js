import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSettingsStore = create(
  persist(
    (set) => ({
      isDemoMode: false,
      setDemoMode: (value) => set({ isDemoMode: value }),
    }),
    {
      name: 'fitprogress:settings',
    }
  )
)

export default useSettingsStore
