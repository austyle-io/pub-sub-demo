import type { CreateUserRequest, LoginRequest } from '@collab-edit/shared';
import { isJwtPayload } from '@collab-edit/shared';
import { useMachine } from '@xstate/react';
import type React from 'react';
import { createContext, useContext, useEffect } from 'react';
import {
  type AuthContext as AuthState,
  authMachine,
} from '../machines/auth.machine';
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

/**
 * @summary Provides authentication state and actions to its children.
 * @remarks
 * This component uses an XState machine to manage the authentication state.
 * It also handles automatic token refreshing.
 * @param props - The component props.
 * @param props.children - The child components.
 * @returns A JSX element.
 * @since 1.0.0
 */
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
  }, [send]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * @summary A hook to access the authentication context.
 * @remarks
 * This hook provides access to the authentication state and actions.
 * It must be used within an `AuthProvider`.
 * @returns The authentication context value.
 * @throws {Error} If used outside of an `AuthProvider`.
 * @since 1.0.0
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
