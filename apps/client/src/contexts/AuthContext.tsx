import React, { createContext, useContext, useEffect } from 'react'
import { useMachine } from '@xstate/react'
import { authMachine, type AuthContext as AuthState } from '../machines/auth.machine'
import type { LoginRequest, CreateUserRequest } from '@collab-edit/shared'
import { authService } from '../services/auth.service'

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => void
  signup: (data: CreateUserRequest) => void
  logout: () => void
  refresh: () => void
  clearError: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Authentication context provider that manages login, signup, token refresh, and auth state.
 * @param children React children
 */
export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, send] = useMachine(authMachine, {
    input: () => {
      // Initialize with stored tokens
      const { accessToken, refreshToken } = authService.getStoredTokens()
      if (accessToken && refreshToken) {
        // Decode user from token
        try {
          const tokenParts = accessToken.split('.')
          const payload = JSON.parse(atob(tokenParts[1] || ''))
          return {
            user: {
              id: payload.sub,
              email: payload.email,
              role: payload.role,
              createdAt: '',
              updatedAt: ''
            },
            accessToken,
            refreshToken,
            error: null
          }
        } catch {
          // Invalid token
        }
      }
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        error: null
      }
    }
  })
  
  const value: AuthContextValue = {
    ...state.context,
    login: (data) => send({ type: 'LOGIN', data }),
    signup: (data) => send({ type: 'SIGNUP', data }),
    logout: () => {
      authService.logout()
      send({ type: 'LOGOUT' })
    },
    refresh: () => send({ type: 'REFRESH_TOKEN' }),
    clearError: () => send({ type: 'CLEAR_ERROR' }),
    isAuthenticated: state.matches('authenticated'),
    isLoading: state.matches('loggingIn') || 
               state.matches('signingUp') || 
               state.matches('refreshingToken') ||
               state.matches('checkingAuth')
  }
  
  // Set up token refresh before expiry
  useEffect(() => {
    if (!state.context.accessToken) return undefined
    
    try {
      const tokenParts = state.context.accessToken.split('.')
      const payload = JSON.parse(atob(tokenParts[1] || ''))
      const exp = payload.exp * 1000 // Convert to milliseconds
      
      // Refresh 1 minute before expiry
      const refreshTime = exp - Date.now() - 60000
      
      if (refreshTime > 0) {
        const timer = setTimeout(() => {
          send({ type: 'REFRESH_TOKEN' })
        }, refreshTime)
        
        return () => clearTimeout(timer)
      }
    } catch {
      // Invalid token
    }
    return undefined
  }, [state.context.accessToken, send])
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access authentication context values and actions.
 * @returns authentication state and actions
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
