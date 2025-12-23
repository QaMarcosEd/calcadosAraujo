'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Lock, User, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  // Checa se já tá logado
  useEffect(function () {
    fetch('/api/auth/session')
      .then(function (res) { return res.json() })
      .then(function (data) {
        if (data && data.user) {
          router.replace('/dashboard')
        }
      })
  }, [router])

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    signIn('credentials', {
      name: name,
      password: password,
      redirect: false
    }).then(function (result) {
      if (result.error) {
        setError('Nome ou senha inválidos')
        setLoading(false)
      } else {
        // Pequeno atraso pra garantir que a sessão tá pronta
        setTimeout(function () {
          router.replace('/dashboard')
          router.refresh()
        }, 100) // 100ms de atraso
      }
    }).catch(function () {
      setError('Erro no login. Tente novamente.')
      setLoading(false)
    })
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#394189]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#c33638]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8 z-10">
        {/* LOGO + TITLE */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-[#394189] to-[#c33638] rounded-2xl flex items-center justify-center shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              👟 Calçados Araújo
            </h2>
            <p className="text-lg font-semibold text-[#394189] mb-1">Área Administrativa</p>
            <p className="text-sm text-gray-600">Faça login para gerenciar sua loja</p>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* USERNAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-[#394189]" />
                Nome de usuário
              </label>
              <div className="relative text-gray-500">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#394189] focus:border-[#394189] transition-all bg-gray-50"
                  placeholder="Digite seu usuário"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#c33638]" />
                Senha
              </label>
              <div className="relative text-gray-500">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-11 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c33638] focus:border-[#c33638] transition-all bg-gray-50"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                {error}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading || !name || !password}
              className="group relative w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-[#394189] to-[#c33638] hover:from-[#c33638] hover:to-[#394189] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#394189] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              © 2025 Calçados Araújo. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
