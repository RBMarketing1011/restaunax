import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserProfileEndpoint, getAPIHeaders } from './api-utils'

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
          // Use appropriate auth endpoint (internal or external)
          const authEndpoint = process.env.NEXT_PUBLIC_API_BASE_URL + '/api/auth/check-credentials'
          const headers = getAPIHeaders(true)

          console.log('🔐 Auth Debug:', {
            authEndpoint,
            headers,
            baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL
          })

          const response = await fetch(authEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          })

          console.log('🔐 Auth Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url
          })

          if (!response.ok)
          {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            console.log('🔐 Auth Error Data:', errorData)
            if (errorData.code === 'EMAIL_NOT_VERIFIED')
            {
              throw new Error('EMAIL_NOT_VERIFIED')
            }
            return null
          }

          const responseData = await response.json()
          console.log('🔐 Response Data:', responseData)

          // Handle different response formats
          let user
          const isInternal = authEndpoint.includes('/api/auth/check-credentials')
          if (isInternal)
          {
            // Internal API: user data is directly in the response
            // Format: { id, email, name, accountId }
            user = responseData
          } else
          {
            // External API: user data is wrapped in a 'user' object
            // Format: { token, user: { id, email, name, accountId } }
            user = responseData.user
            // Store the token if provided
            if (responseData.token)
            {
              user.accessToken = responseData.token
            }
          }

          console.log('🔐 Final User Data:', user)
          return user
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
    updateAge: 24 * 60 * 60, // 24 hours - how often to update the session
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt ({ token, user, trigger })
    {
      // If this is a sign-in, store the user data
      if (user)
      {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.accountId = (user as { accountId?: string }).accountId || ''
        token.accessToken = (user as { accessToken?: string }).accessToken || '' // If your backend provides access tokens
      }

      // Refresh user data from backend on session update or periodically
      const lastRefresh = (token.lastRefresh as number) || 0
      if (trigger === 'update' || (Date.now() - lastRefresh > 60 * 60 * 1000)) // Refresh every hour
      {
        try
        {
          const profileEndpoint = getUserProfileEndpoint(token.id as string)
          const headers = {
            ...getAPIHeaders(),
            'Authorization': `Bearer ${ token.accessToken || '' }`
          }

          const response = await fetch(profileEndpoint, { headers })

          if (response.ok)
          {
            const userData = await response.json()
            token.name = userData.name
            token.email = userData.email
            token.accountId = userData.accountId
            token.lastRefresh = Date.now()
          }
        } catch (error)
        {
          console.error('Failed to refresh user data:', error)
          // Keep existing token data if refresh fails
        }
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
        session.user.accountId = token.accountId as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
