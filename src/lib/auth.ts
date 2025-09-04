import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize (credentials)
      {
        if (!credentials?.email || !credentials?.password)
        {
          return null
        }

        try
        {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              ownedAccounts: true, // Accounts they own
              account: true // Account they belong to
            }
          })

          if (!user)
          {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid)
          {
            return null
          }

          // Check if email is verified ONLY if credentials are correct
          if (!user.emailVerified)
          {
            // Store this info for the frontend to handle
            throw new Error('EMAIL_NOT_VERIFIED')
          }

          // Get the account ID (either owned or belongs to)
          const accountId = user.ownedAccounts[ 0 ]?.id || user.accountId

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            accountId: accountId
          }
        } catch (error)
        {
          console.error('Auth error:', error)
          // For email verification, we'll return null and let the frontend handle it
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt ({ token, user })
    {
      if (user)
      {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.accountId = (user as any).accountId
      }
      return token
    },
    async session ({ session, token })
    {
      if (token && session.user)
      {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
          ; (session.user as any).accountId = token.accountId as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
