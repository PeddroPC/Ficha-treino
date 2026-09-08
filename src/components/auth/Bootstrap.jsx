import { useEffect } from 'react'
import { AuthService } from '../../backend/auth/AuthService.js'
import useAuthStore from '../../stores/useAuthStore.js'
import { syncManager } from '../../backend/sync/SyncQueueManager.js'
import { SyncDownstream } from '../../backend/sync/SyncDownstream.js'

export function Bootstrap({ children }) {
  const { isInitialized, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Inicializa o listener de autenticação
    const subscription = AuthService.initializeListener()
    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe()
    }
  }, [])

  // Sincronização em nuvem (Downstream e Upstream)
  // Ativada apenas quando existe um usuário autenticado.
  useEffect(() => {
    if (!isAuthenticated) return

    const syncAll = async () => {
      try {
        // 1. PRIMEIRO: Processa a fila de envio. Assim, qualquer alteração local
        // feita offline (como apagar ou criar treinos) é enviada para a nuvem.
        await syncManager.processQueue()
        
        // 2. SEGUNDO: Baixa os dados atualizados do Supabase para o Zustand local.
        await SyncDownstream.restoreFromCloud()
      } catch (err) {
        console.error('Erro ao sincronizar dados:', err)
      }
    }

    syncAll()

    const handleOnline = () => {
      syncManager.processQueue()
    }

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

