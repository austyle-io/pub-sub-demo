import type React from 'react';
import { createContext, useContext, useEffect } from 'react';
import type { CreateUserRequest, LoginRequest } from '@collab-edit/shared';
import { useMachine } from '@xstate/react';
import {
  type AuthContext as AuthState,
  authMachine,
} from '../machines/auth.machine';
import { isJwtPayload } from '@collab-edit/shared';
import { tokenManager } from '../utils/token-manager';

type AuthContextValue = AuthState & {
  login: (data: LoginRequest) => void;
  signup: (data: CreateUserRequest) => void;
  logout: () => void;
  refresh: () => void;
  clearError: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, send] = useMachine(authMachine);

  const contextValue: AuthContextValue = {
    ...state.context,
    login: (data) => send({ type: 'LOGIN', data }),
    signup: (data) => send({ type: 'SIGNUP', data }),
    logout: () => send({ type: 'LOGOUT' }),
    refresh: () => send({ type: 'REFRESH_TOKEN' }),
    clearError: () => send({ type: 'CLEAR_ERROR' }),
    isAuthenticated: state.matches('authenticated'),
    isLoading:
      state.matches('loggingIn') ||
      state.matches('signingUp') ||
      state.matches('refreshingToken') ||
      state.matches('checkingAuth'),
  };

  // Set up token refresh before expiry
  useEffect(() => {
    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) return undefined;

    try {
      const tokenParts = accessToken.split('.');
      if (tokenParts.length !== 3) return undefined;

      const rawPayload = JSON.parse(atob(tokenParts[1] ?? ''));
      if (!isJwtPayload(rawPayload)) {
        console.error('Invalid token payload, logging out');
        send({ type: 'LOGOUT' });
        return undefined;
      }

      // Double-check exp property exists (should be guaranteed by isJwtPayload)
      if (typeof rawPayload.exp !== 'number') {
        console.error('Token missing valid expiry, logging out');
        send({ type: 'LOGOUT' });
        return undefined;
      }

      const exp = rawPayload.exp * 1000; // Convert to milliseconds

      // Refresh 1 minute before expiry
      const refreshTime = exp - Date.now() - 60000;

      if (refreshTime > 0) {
        const timeout = setTimeout(() => {
          send({ type: 'REFRESH_TOKEN' });
        }, refreshTime);

        return () => clearTimeout(timeout);
      }
    } catch (error) {
      console.error('Error setting up token refresh:', error);
      send({ type: 'LOGOUT' });
    }

    return undefined;
  }, [state.context.accessToken, send]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
