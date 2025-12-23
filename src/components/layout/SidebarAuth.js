'use client'
import { useSession, signOut } from 'next-auth/react'
import { User, LogOut, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SidebarAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500 mx-auto"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="p-4">
        <button
          onClick={() => router.push('/login')}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Entrar
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
          {session.user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">
            {session.user.name}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {session.user.role}
          </p>
        </div>
      </div>
      
      <button
        onClick={() => {
          signOut({ callbackUrl: '/login' })
        }}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sair
      </button>
    </div>
  )
}
