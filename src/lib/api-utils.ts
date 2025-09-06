// Utility functions for dynamic API endpoint resolution

/**
 * Determines if we're using an internal (Next.js) or external API based on the base URL
 */
export function isInternalAPI (): boolean
{
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!baseUrl) return true // Default to internal if not set

  // Internal if it's the same origin as Next.js app or localhost:3000
  return baseUrl.includes('localhost:3000') || baseUrl === 'http://localhost:3000' || baseUrl.startsWith('/api')
}

/**
 * Gets the appropriate user profile endpoint
 */
export function getUserProfileEndpoint (userId: string): string
{
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  return `${ baseUrl }/api/user/profile/${ userId }`
}

/**
 * Gets headers for API requests - only add x-api-key for external APIs
 */
export function getAPIHeaders (includeContentType = false): Record<string, string>
{
  const headers: Record<string, string> = {}

  if (includeContentType)
  {
    headers[ 'Content-Type' ] = 'application/json'
  }

  // Only add x-api-key for external APIs
  if (!isInternalAPI())
  {
    headers[ 'x-api-key' ] = process.env.NEXT_PUBLIC_AUTH_KEY || ''
  }

  return headers
}

/**
 * Generic API fetch wrapper that handles internal vs external API differences
 */
export async function apiRequest (endpoint: string, options: RequestInit = {})
{
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const url = endpoint.startsWith('http') ? endpoint : `${ baseUrl }${ endpoint }`

  const headers = {
    ...getAPIHeaders(true),
    ...options.headers
  }

  return fetch(url, {
    ...options,
    headers
  })
}
