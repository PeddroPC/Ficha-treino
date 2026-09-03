import { createClient } from '@supabase/supabase-js'

// Fallback para Node.js (testes) vs Vite (navegador)
const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env 
  ? import.meta.env.VITE_SUPABASE_URL 
  : process?.env?.VITE_SUPABASE_URL

const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env 
  ? import.meta.env.VITE_SUPABASE_ANON_KEY 
  : process?.env?.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'FALHA CRÍTICA: Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas. ' +
    'Por favor, configure o arquivo .env.local com as credenciais do Supabase.'
  )
}

// Singleton Pattern: evita recriação do cliente no HMR do Vite (causador do warning "Multiple GoTrueClient")
const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = globalThis.__supabaseClient ?? createSupabaseClient()

if (import.meta.env?.DEV) {
  globalThis.__supabaseClient = supabase
}
