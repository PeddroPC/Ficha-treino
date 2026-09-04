import { Link } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-6 lg:px-8 bg-brand-base">
      <Dumbbell size={64} className="text-brand-action mb-6" />
      <h1 className="text-6xl font-extrabold text-text-primary mb-2">404</h1>
      <p className="text-xl text-text-secondary font-medium mb-8 text-center max-w-md">
        Opa! Parece que você se perdeu ou o treino que você procurava não existe mais.
      </p>
      
      <Link
        to="/"
        className="flex items-center justify-center gap-2 bg-brand-action hover:bg-brand-action/90 text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-sm"
      >
        Voltar para o Início
      </Link>
    </div>
  )
}
