import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthService } from '../../backend/auth/AuthService.js'
import { Dumbbell } from 'lucide-react'
import logo from '../../assets/Logo.png'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setIsLoading(true)

    try {
      // O Supabase Auth permite salvar metadata opcional (como displayName)
      // Passamos o nome apenas para o Supabase armazenar no token se possível.
      const data = await AuthService.signUp(email, password)
      
      // Se houver mensagem sobre confirmação de e-mail (caso configurado no painel)
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        setError('Este e-mail já está em uso.')
        return
      }
      
      // Força o reload da página para garantir o isolamento de estado do Zustand
      window.location.href = '/'
    } catch (err) {
      if (err.status === 429 || err.message?.toLowerCase().includes('rate limit')) {
        setError('Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.')
      } else if (err.message?.includes('Password should be at least')) {
        setError('A senha deve ter pelo menos 6 caracteres.')
      } else if (err.message?.includes('already registered')) {
        setError('Este e-mail já está em uso.')
      } else {
        setError(err.message || 'Ocorreu um erro ao criar a conta. Tente novamente.')
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
          Criar sua conta
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
            <label className="block text-sm font-medium text-text-secondary">Nome</label>
            <div className="mt-1">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full appearance-none rounded-xl border border-brand-elevated bg-brand-surface px-4 py-3 text-text-primary placeholder-text-muted focus:border-brand-action focus:outline-none focus:ring-1 focus:ring-brand-action sm:text-sm"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-text-secondary">Confirmar Senha</label>
            <div className="mt-1">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full appearance-none rounded-xl border border-brand-elevated bg-brand-surface px-4 py-3 text-text-primary placeholder-text-muted focus:border-brand-action focus:outline-none focus:ring-1 focus:ring-brand-action sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-xl border border-transparent bg-brand-action py-3 px-4 text-sm font-bold text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-action focus:ring-offset-2 focus:ring-offset-brand-base disabled:opacity-50"
          >
            {isLoading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-elevated" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-brand-base px-2 text-text-muted">Já possui conta?</span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/login"
              className="flex w-full justify-center rounded-xl border border-brand-elevated bg-brand-surface py-3 px-4 text-sm font-medium text-text-primary shadow-sm hover:bg-brand-highlight focus:outline-none focus:ring-2 focus:ring-brand-action focus:ring-offset-2 focus:ring-offset-brand-base"
            >
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
