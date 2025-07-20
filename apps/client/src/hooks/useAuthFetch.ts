import { useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function useAuthFetch() {
  const { accessToken, refresh } = useAuth()
  
  const authFetch = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    if (!accessToken) {
      throw new Error('Not authenticated')
    }
    
    // Add auth header
    const authOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }
    
    let response = await fetch(url, authOptions)
    
    // If unauthorized, try to refresh token
    if (response.status === 401 && refresh) {
      await refresh()
      
      // Retry with new token
      response = await fetch(url, authOptions)
    }
    
    return response
  }, [accessToken, refresh])
  
  return authFetch
}