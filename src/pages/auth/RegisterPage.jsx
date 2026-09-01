import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthService } from '../../backend/auth/AuthService.js'
import { Dumbbell } from 'lucide-react'

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
      const { data, error } = await AuthService.signUp(email, password)
      
      // Se houver mensagem sobre confirmação de e-mail (caso configurado no painel)
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        setError('Este e-mail já está em uso.')
        return
      }

      navigate('/', { replace: true })
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
    <div className="min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-emerald-500">
          <Dumbbell size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Criar sua conta
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-100 rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-xl border border-transparent bg-emerald-500 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Criando...' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Já possui conta?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="flex w-full justify-center rounded-xl border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
