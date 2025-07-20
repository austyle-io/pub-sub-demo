import type {
  AuthResponse,
  CreateUserRequest,
  LoginRequest,
  PublicUser,
} from '@collab-edit/shared';
import { isJwtPayload } from '@collab-edit/shared';
import { assign, createMachine, fromPromise } from 'xstate';
import { authService } from '../services/auth.service';

export type AuthContext = {
  user: PublicUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
};

export type AuthEvent =
  | { type: 'LOGIN'; data: LoginRequest }
  | { type: 'SIGNUP'; data: CreateUserRequest }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN' }
  | { type: 'CLEAR_ERROR' };

export const authMachine = createMachine({
  id: 'auth',
  initial: 'checkingAuth',
  types: {} as {
    context: AuthContext;
    events: AuthEvent;
  },
  context: {
    user: null,
    accessToken: null,
    refreshToken: null,
    error: null,
  },
  states: {
    checkingAuth: {
      entry: assign(() => {
        const stored = authService.getStoredTokens();
        if (stored.accessToken && stored.refreshToken) {
          try {
            const tokenParts = stored.accessToken.split('.');
            if (tokenParts.length !== 3) {
              throw new Error('Invalid token format');
            }

            const rawPayload = JSON.parse(atob(tokenParts[1] ?? ''));
            if (!isJwtPayload(rawPayload)) {
              throw new Error('Invalid JWT payload structure');
            }

            // Now rawPayload is safely typed as JwtPayload
            return {
              user: {
                id: rawPayload.sub,
                email: rawPayload.email,
                role: rawPayload.role,
                createdAt: '',
                updatedAt: '',
              },
              accessToken: stored.accessToken,
              refreshToken: stored.refreshToken,
              error: null,
            };
          } catch (error) {
            console.error('Failed to validate stored token:', error);
            authService.logout();
            return {
              user: null,
              accessToken: null,
              refreshToken: null,
              error: null,
            };
          }
        }
        return {
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
        };
      }),
      always: [
        {
          target: 'authenticated',
          guard: ({ context }) => !!context.user && !!context.accessToken,
        },
        {
          target: 'idle',
        },
      ],
    },
    idle: {
      on: {
        LOGIN: {
          target: 'loggingIn',
        },
        SIGNUP: {
          target: 'signingUp',
        },
      },
    },
    loggingIn: {
      invoke: {
        src: fromPromise(async ({ input }: { input: LoginRequest }) => {
          return authService.login(input);
        }),
        input: ({ event }) => (event as { data: LoginRequest }).data,
        onDone: {
          target: 'authenticated',
          actions: assign(({ event }) => {
            const authResponse = event.output as AuthResponse;
            return {
              user: authResponse.user,
              accessToken: authResponse.accessToken,
              refreshToken: authResponse.refreshToken,
              error: null,
            };
          }),
        },
        onError: {
          target: 'idle',
          actions: assign(({ event }) => ({
            error: (event.error as Error).message,
          })),
        },
      },
    },
    signingUp: {
      invoke: {
        src: fromPromise(async ({ input }: { input: CreateUserRequest }) => {
          return authService.signup(input);
        }),
        input: ({ event }) => (event as { data: CreateUserRequest }).data,
        onDone: {
          target: 'authenticated',
          actions: assign(({ event }) => {
            const authResponse = event.output as AuthResponse;
            return {
              user: authResponse.user,
              accessToken: authResponse.accessToken,
              refreshToken: authResponse.refreshToken,
              error: null,
            };
          }),
        },
        onError: {
          target: 'idle',
          actions: assign(({ event }) => ({
            error: (event.error as Error).message,
          })),
        },
      },
    },
    authenticated: {
      on: {
        LOGOUT: {
          target: 'idle',
          actions: assign(() => {
            authService.logout();
            return {
              user: null,
              accessToken: null,
              refreshToken: null,
              error: null,
            };
          }),
        },
        REFRESH_TOKEN: {
          target: 'refreshingToken',
        },
        CLEAR_ERROR: {
          actions: assign(() => ({ error: null })),
        },
      },
    },
    refreshingToken: {
      invoke: {
        src: fromPromise(async ({ input }: { input: string }) => {
          return authService.refreshToken(input);
        }),
        input: ({ context }) => context.refreshToken!,
        onDone: {
          target: 'authenticated',
          actions: assign(({ event }) => {
            const authResponse = event.output as AuthResponse;
            return {
              user: authResponse.user,
              accessToken: authResponse.accessToken,
              refreshToken: authResponse.refreshToken,
              error: null,
            };
          }),
        },
        onError: {
          target: 'idle',
          actions: assign(({ event }) => {
            authService.logout();
            return {
              user: null,
              accessToken: null,
              refreshToken: null,
              error: (event.error as Error).message,
            };
          }),
        },
      },
    },
  },
}).provide({
  guards: {
    isTokenValid: ({ context }) => {
      if (!context.accessToken) return false;

      try {
        const tokenParts = context.accessToken.split('.');
        if (tokenParts.length !== 3) return false;

        const rawPayload = JSON.parse(atob(tokenParts[1] ?? ''));
        if (!isJwtPayload(rawPayload)) return false;

        // Double-check exp property exists (should be guaranteed by isJwtPayload)
        if (typeof rawPayload.exp !== 'number') return false;

        const exp = rawPayload.exp * 1000; // Convert to milliseconds
        return Date.now() < exp;
      } catch {
        return false;
      }
    },
  },
});
