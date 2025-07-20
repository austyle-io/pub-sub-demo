import { createMachine, assign, fromPromise } from 'xstate'
import type { 
  AuthResponse, 
  PublicUser, 
  LoginRequest, 
  CreateUserRequest 
} from '@collab-edit/shared'
import { authService } from '../services/auth.service'

export interface AuthContext {
  user: PublicUser | null
  accessToken: string | null
  refreshToken: string | null
  error: string | null
}

export type AuthEvent =
  | { type: 'LOGIN'; data: LoginRequest }
  | { type: 'SIGNUP'; data: CreateUserRequest }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN' }
  | { type: 'AUTH_SUCCESS'; data: AuthResponse }
  | { type: 'AUTH_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }

export const authMachine = createMachine({
  types: {} as {
    context: AuthContext
    events: AuthEvent
  },
  id: 'auth',
  initial: 'checkingAuth',
  context: {
    user: null,
    accessToken: null,
    refreshToken: null,
    error: null
  },
  states: {
    checkingAuth: {
      always: [
        {
          target: 'authenticated',
          guard: 'hasValidToken'
        },
        {
          target: 'unauthenticated'
        }
      ]
    },
    unauthenticated: {
      on: {
        LOGIN: 'loggingIn',
        SIGNUP: 'signingUp'
      }
    },
    loggingIn: {
      invoke: {
        src: 'login',
        input: ({ event }) => (event as any).data,
        onDone: {
          target: 'authenticated',
          actions: 'setAuthData'
        },
        onError: {
          target: 'unauthenticated',
          actions: 'setError'
        }
      }
    },
    signingUp: {
      invoke: {
        src: 'signup',
        input: ({ event }) => (event as any).data,
        onDone: {
          target: 'authenticated',
          actions: 'setAuthData'
        },
        onError: {
          target: 'unauthenticated',
          actions: 'setError'
        }
      }
    },
    authenticated: {
      on: {
        LOGOUT: {
          target: 'unauthenticated',
          actions: 'clearAuthData'
        },
        REFRESH_TOKEN: 'refreshingToken'
      }
    },
    refreshingToken: {
      invoke: {
        src: 'refreshToken',
        input: ({ context }) => ({ refreshToken: context.refreshToken! }),
        onDone: {
          target: 'authenticated',
          actions: 'setAuthData'
        },
        onError: {
          target: 'unauthenticated',
          actions: ['clearAuthData', 'setError']
        }
      }
    }
  },
  on: {
    CLEAR_ERROR: {
      actions: 'clearError'
    }
  }
}, {
  guards: {
    hasValidToken: ({ context }) => {
      if (!context.accessToken) return false
      
      // Check if token exists and is not expired
      try {
        const tokenParts = context.accessToken.split('.')
        if (tokenParts.length !== 3) return false
        
        const payload = JSON.parse(atob(tokenParts[1] || ''))
        const exp = payload.exp * 1000 // Convert to milliseconds
        
        return Date.now() < exp
      } catch {
        return false
      }
    }
  },
  actions: {
    setAuthData: assign({
      user: (_, event: any) => event.output.user,
      accessToken: (_, event: any) => event.output.accessToken,
      refreshToken: (_, event: any) => event.output.refreshToken,
      error: null
    }),
    clearAuthData: assign({
      user: null,
      accessToken: null,
      refreshToken: null
    }),
    setError: assign({
      error: (_, event: any) => event.error?.message || 'Authentication failed'
    }),
    clearError: assign({
      error: null
    })
  },
  actors: {
    login: fromPromise(async ({ input }: { input: LoginRequest }) => {
      return await authService.login(input)
    }),
    signup: fromPromise(async ({ input }: { input: CreateUserRequest }) => {
      return await authService.signup(input)
    }),
    refreshToken: fromPromise(async ({ input }: { input: { refreshToken: string } }) => {
      return await authService.refreshToken(input.refreshToken)
    })
  }
})