import { createClient } from '@supabase/supabase-js'

// Fallback para Node.js (testes) vs Vite (navegador)
const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env 
  ? import.meta.env.VITE_SUPABASE_URL 
  : process?.env?.VITE_SUPABASE_URL

const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env 
  ? import.meta.env.VITE_SUPABASE_ANON_KEY 
  : process?.env?.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Credenciais do Supabase não encontradas no .env.local. O cliente não funcionará corretamente.')
}

// Singleton Pattern: evita recriação do cliente no HMR do Vite (causador do warning "Multiple GoTrueClient")
const createSupabaseClient = () => {
  return createClient(
    supabaseUrl || 'https://mock.supabase.co', 
    supabaseAnonKey || 'mock-key'
  )
}

export const supabase = globalThis.__supabaseClient ?? createSupabaseClient()

if (import.meta.env?.DEV) {
  globalThis.__supabaseClient = supabase
}
