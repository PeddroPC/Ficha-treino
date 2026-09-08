import { useEffect, useState } from 'react'
import { AuthService } from '../../backend/auth/AuthService.js'
import useAuthStore from '../../stores/useAuthStore.js'
import { syncManager } from '../../backend/sync/SyncQueueManager.js'
import { SyncDownstream } from '../../backend/sync/SyncDownstream.js'

export function Bootstrap({ children }) {
  const { isInitialized, isAuthenticated, user } = useAuthStore()
  const [isInitialSyncComplete, setIsInitialSyncComplete] = useState(false)

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
    if (!isAuthenticated || !user) {
      setIsInitialSyncComplete(true)
      return
    }

    let isMounted = true

    const syncAll = async () => {
      try {
        // 1. PRIMEIRO: Processa a fila de envio de alterações pendentes.
        await syncManager.processQueue()
        
        // 2. SEGUNDO: Baixa os dados atualizados do Supabase para o Zustand local
        // (e gera a ficha de demonstração se for um novo usuário sem dados).
        await SyncDownstream.restoreFromCloud()

        // 3. TERCEIRO: Processa a fila novamente para garantir que os dados gerados pela demo sejam enviados de imediato.
        await syncManager.processQueue()
      } catch (err) {
        console.error('[Bootstrap] Erro ao sincronizar dados:', err)
      } finally {
        if (isMounted) {
          setIsInitialSyncComplete(true)
        }
      }
    }

    setIsInitialSyncComplete(false)
    syncAll()

    const handleOnline = () => {
      syncManager.processQueue()
    }

    window.addEventListener('online', handleOnline)
    
    return () => {
      isMounted = false
      window.removeEventListener('online', handleOnline)
    }
  }, [isAuthenticated, user?.id])

  if (!isInitialized || (isAuthenticated && !isInitialSyncComplete)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-base text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-action border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary text-sm font-medium animate-pulse">Carregando seus treinos...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
