import { useSession } from 'next-auth/react'
import { getUserProfileEndpoint, getAPIHeaders } from './api-utils'

// Custom hook to refresh user session data from external backend
export function useRefreshSession ()
{
  const { data: session, update } = useSession()

  const refreshSession = async () =>
  {
    if (session?.user?.id)
    {
      try
      {
        // Trigger a session update which will refresh data from backend
        await update({
          trigger: 'update'
        })
      } catch (error)
      {
        console.error('Failed to refresh session:', error)
      }
    }
  }

  return { session, refreshSession }
}

// Utility function to get fresh user data from backend (internal or external)
export async function getFreshUserData (userId: string)
{
  try
  {
    const profileEndpoint = getUserProfileEndpoint(userId)
    const headers = getAPIHeaders()

    const response = await fetch(profileEndpoint, { headers })

    if (response.ok)
    {
      return await response.json()
    }

    throw new Error('Failed to fetch user data')
  } catch (error)
  {
    console.error('Error fetching fresh user data:', error)
    return null
  }
}
