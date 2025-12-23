// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/app/lib/prisma'  // ← caminho mais limpo com alias (configuro depois se precisar)
import bcrypt from 'bcrypt'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        name: { label: 'Nome de usuário', type: 'text' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.User.findUnique({
            where: { name: credentials.name }
          })

          if (!user) {
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
            return null
          }

          return {
            id: user.id.toString(),
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Erro no login:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role

        // Tempo de sessão diferente por role (em segundos)
        // Admin: 15 minutos | Funcionário: 8 horas
        const isAdmin = token.role === 'ADMIN'
        session.maxAge = isAdmin ? 15 * 60 : 8 * 60 * 60
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // jwt: { maxAge: ... } pode ser usado também, mas o session.maxAge funciona bem aqui
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }