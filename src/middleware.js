// src/middleware.js
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  console.log('🔒 MIDDLEWARE:', pathname, token ? 'LOGADO' : 'NÃO LOGADO')

  // 1. REDIRECIONAMENTO /login
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. PROTEÇÃO DE PÁGINAS
  const pagePaths = [
    '/', '/dashboard', '/clientes', '/estoque', '/vendas', '/produtos'
  ]

  const isPageProtected = pagePaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )

  if (!token && isPageProtected) {
    console.log('🚫 REDIRECIONA PÁGINA PARA LOGIN')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. PROTEÇÃO DE APIs (EXCETO /api/vitrine)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth') && !pathname.startsWith('/api/vitrine')) {
    if (!token) {
      console.log('🚫 BLOQUEIA API - SEM TOKEN')
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      )
    }
    console.log('✅ API LIBERADA')
  }

  // 4. LIBERA TUDO DEMAIS
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/',
    '/dashboard/:path*',
    '/clientes/:path*', 
    '/estoque/:path*',
    '/vendas/:path*',
    '/produtos/:path*',
    '/api/:path*',
    '/vitrine/:path*'  // ← ADICIONADO! LIBERADO
  ]
}