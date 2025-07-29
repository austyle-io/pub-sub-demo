import type {
  CreateUserRequest,
  LoginRequest,
  PublicUser,
} from '@collab-edit/shared';
import { isAuthResponse, isJwtPayload } from '@collab-edit/shared';
import { assign, createMachine, fromPromise } from 'xstate';
import { authService } from '../services/auth.service';

/**
 * @summary Defines the context for the authentication state machine.
 * @since 1.0.0
 */
export type AuthContext = {
  user: PublicUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
};

/**
 * @summary Defines the events for the authentication state machine.
 * @since 1.0.0
 */
export type AuthEvent =
  | { type: 'LOGIN'; data: LoginRequest }
  | { type: 'SIGNUP'; data: CreateUserRequest }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN' }
  | { type: 'CLEAR_ERROR' };

// Type guard for XState event data
const isLoginEvent = (
  event: AuthEvent,
): event is { type: 'LOGIN'; data: LoginRequest } =>
  event.type === 'LOGIN' && 'data' in event;

const isSignupEvent = (
  event: AuthEvent,
): event is { type: 'SIGNUP'; data: CreateUserRequest } =>
  event.type === 'SIGNUP' && 'data' in event;

/**
 * @summary The XState machine for handling authentication.
 * @remarks
 * This machine manages the user's authentication state, including login, signup,
 * logout, and token refreshing.
 * @since 1.0.0
 */
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
        const accessToken = authService.getAccessToken();
        if (accessToken) {
          try {
            const tokenParts = accessToken.split('.');
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
              accessToken: accessToken,
              refreshToken: null, // Refresh tokens are http-only cookies
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
        input: ({ event }) => {
          if (!isLoginEvent(event)) {
            throw new Error('Invalid login event');
          }
          return event.data;
        },
        onDone: {
          target: 'authenticated',
          actions: assign(({ event }) => {
            if (!isAuthResponse(event.output)) {
              console.error('Invalid auth response received');
              return { error: 'Invalid authentication response' };
            }
            return {
              user: event.output.user,
              accessToken: event.output.accessToken,
              refreshToken: event.output.refreshToken,
              error: null,
            };
          }),
        },
        onError: {
          target: 'idle',
          actions: assign(({ event }) => ({
            error:
              event.error instanceof Error
                ? event.error.message
                : 'Login failed',
          })),
        },
      },
    },
    signingUp: {
      invoke: {
        src: fromPromise(async ({ input }: { input: CreateUserRequest }) => {
          return authService.signup(input);
        }),
        input: ({ event }) => {
          if (!isSignupEvent(event)) {
            throw new Error('Invalid signup event');
          }
          return event.data;
        },
        onDone: {
          target: 'authenticated',
          actions: assign(({ event }) => {
            if (!isAuthResponse(event.output)) {
              console.error('Invalid auth response received');
              return { error: 'Invalid authentication response' };
            }
            return {
              user: event.output.user,
              accessToken: event.output.accessToken,
              refreshToken: event.output.refreshToken,
              error: null,
            };
          }),
        },
        onError: {
          target: 'idle',
          actions: assign(({ event }) => ({
            error:
              event.error instanceof Error
                ? event.error.message
                : 'Signup failed',
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
        src: fromPromise(async () => {
          return authService.refreshToken();
        }),
        onDone: {
          target: 'authenticated',
          actions: assign(({ event }) => {
            if (!isAuthResponse(event.output)) {
              console.error('Invalid auth response received');
              return { error: 'Invalid authentication response' };
            }
            return {
              user: event.output.user,
              accessToken: event.output.accessToken,
              refreshToken: event.output.refreshToken,
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
              error:
                event.error instanceof Error
                  ? event.error.message
                  : 'Token refresh failed',
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
