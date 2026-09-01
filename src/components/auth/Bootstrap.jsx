import { useEffect } from 'react'
import { AuthService } from '../../backend/auth/AuthService.js'
import useAuthStore from '../../stores/useAuthStore.js'
import { syncManager } from '../../backend/sync/SyncQueueManager.js'

export function Bootstrap({ children }) {
  const { isInitialized, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Inicializa o listener de autenticação
    const subscription = AuthService.initializeListener()
    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe()
    }
  }, [])

  // Hook de rede e processamento da fila
  useEffect(() => {
    if (!isAuthenticated) return

    const handleOnline = () => {
      syncManager.processQueue()
    }

    // Processa a fila no login e toda vez que voltar a ficar online
    syncManager.processQueue()
    window.addEventListener('online', handleOnline)
    
    return () => window.removeEventListener('online', handleOnline)
  }, [isAuthenticated])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Iniciando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

