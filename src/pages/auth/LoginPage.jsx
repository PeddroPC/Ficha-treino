import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthService } from '../../backend/auth/AuthService.js'
import { Dumbbell } from 'lucide-react'
import logo from '../../assets/Logo.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await AuthService.signIn(email, password)
      // Força o reload da página para garantir que o Zustand limpe a memória e inicialize
      // com a key do localStorage do novo usuário, evitando contaminação de estado (cross-talk).
      window.location.href = '/'
    } catch (err) {
      if (err.message?.includes('Email not confirmed')) {
        setError('Confirme seu e-mail (clique no link enviado) antes de entrar. Se você é o dev, desative a confirmação no painel do Supabase.')
      } else if (err.status === 422 || err.message?.toLowerCase().includes('email logins are disabled')) {
        setError('O provedor de e-mail foi desativado no painel do Supabase! Reative-o em Providers -> Email.')
      } else if (err.status === 429 || err.message?.toLowerCase().includes('rate limit')) {
        setError('Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.')
      } else {
        setError('Email ou senha incorretos.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8 bg-brand-base">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="FitProgress Logo" className="w-64 h-auto object-contain" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
          Bem-vindo de volta
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-brand-highlight text-text-primary p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text-secondary">Email</label>
            <div className="mt-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full appearance-none rounded-xl border border-brand-elevated bg-brand-surface px-4 py-3 text-text-primary placeholder-text-muted focus:border-brand-action focus:outline-none focus:ring-1 focus:ring-brand-action sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary">Senha</label>
            <div className="mt-1">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full appearance-none rounded-xl border border-brand-elevated bg-brand-surface px-4 py-3 text-text-primary placeholder-text-muted focus:border-brand-action focus:outline-none focus:ring-1 focus:ring-brand-action sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-xl border border-transparent bg-brand-action py-3 px-4 text-sm font-bold text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-action focus:ring-offset-2 focus:ring-offset-brand-base disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-elevated" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-brand-base px-2 text-text-muted">Novo por aqui?</span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/register"
              className="flex w-full justify-center rounded-xl border border-brand-elevated bg-brand-surface py-3 px-4 text-sm font-medium text-text-primary shadow-sm hover:bg-brand-highlight focus:outline-none focus:ring-2 focus:ring-brand-action focus:ring-offset-2 focus:ring-offset-brand-base"
            >
              Criar uma conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
