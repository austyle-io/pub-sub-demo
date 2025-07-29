import {
  type ErrorResponse,
  getValidationErrors,
  isCreateUserRequest,
  isLoginRequest,
  sanitizeApiError,
  validateCreateUserRequest,
  validateLoginRequest,
} from '@collab-edit/shared';
import { type Request, type Response, Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authLogger } from '../services/logger';
import { validateEnv } from '../types/env';

/**
 * @summary Defines the authentication routes for the application.
 * @remarks
 * This router handles user signup, login, token refreshing, and logout.
 * It uses the `AuthService` to perform the actual authentication logic.
 */
const router: Router = Router();
const authService = new AuthService();
const env = validateEnv();

// Type declaration for cookies
interface AuthenticatedRequest extends Request {
  cookies: {
    refreshToken?: string;
    [key: string]: string | undefined;
  };
}

/**
 * @summary Registers a new user.
 * @route POST /api/auth/signup
 * @param req.body - The user creation data.
 * @returns A 201 response with an access token and user data, or an error response.
 */
router.post(
  '/signup',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      // Validate request
      if (!isCreateUserRequest(req.body)) {
        const errors = getValidationErrors(validateCreateUserRequest);
        const errorResponse: ErrorResponse = {
          error: 'Validation failed',
          details: errors,
        };
        return res.status(400).json(errorResponse);
      }

      // Create user - type guard ensures type safety
      const authResponse = await authService.createUser(req.body);

      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', authResponse.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/auth/refresh',
      });

      // Return only access token to client (consistent with login)
      return res.status(201).json({
        accessToken: authResponse.accessToken,
        user: authResponse.user,
      });
    } catch (error) {
      // Structured logging for signup errors
      authLogger.error('Signup failed', {
        email: req.body?.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorMessage = sanitizeApiError(error);
      const errorResponse: ErrorResponse = {
        error: errorMessage,
      };

      // Check for duplicate user
      if (errorMessage === 'User already exists') {
        return res.status(409).json(errorResponse);
      }

      return res.status(500).json(errorResponse);
    }
  },
);

/**
 * @summary Authenticates an existing user.
 * @route POST /api/auth/login
 * @param req.body - The login data.
 * @returns A 200 response with an access token and user data, or an error response.
 */
router.post(
  '/login',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      // Validate request
      if (!isLoginRequest(req.body)) {
        const errors = getValidationErrors(validateLoginRequest);
        const errorResponse: ErrorResponse = {
          error: 'Validation failed',
          details: errors,
        };
        return res.status(400).json(errorResponse);
      }

      // Login user - type guard ensures type safety
      const authResponse = await authService.login(req.body);

      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', authResponse.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/auth/refresh',
      });

      // Return only access token to client
      return res.json({
        accessToken: authResponse.accessToken,
        user: authResponse.user,
      });
    } catch (error) {
      const errorMessage = sanitizeApiError(error);
      const errorResponse: ErrorResponse = {
        error: errorMessage,
      };

      // Invalid credentials should return 401
      if (errorMessage === 'Invalid credentials') {
        return res.status(401).json(errorResponse);
      }

      return res.status(500).json(errorResponse);
    }
  },
);

/**
 * @summary Refreshes the access and refresh tokens.
 * @route POST /api/auth/refresh
 * @param req.cookies.refreshToken - The refresh token.
 * @returns A 200 response with a new access token and user data, or an error response.
 */
router.post(
  '/refresh',
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
      }

      // Refresh tokens - type guard ensures type safety
      const authResponse = await authService.refreshTokens(refreshToken);

      // Update refresh token cookie
      res.cookie('refreshToken', authResponse.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth/refresh',
      });

      return res.json({
        accessToken: authResponse.accessToken,
        user: authResponse.user,
      });
    } catch (error) {
      const errorMessage = sanitizeApiError(error);
      const errorResponse: ErrorResponse = {
        error: errorMessage,
      };

      // Invalid token should return 401
      if (errorMessage === 'Invalid refresh token') {
        return res.status(401).json(errorResponse);
      }

      return res.status(500).json(errorResponse);
    }
  },
);

/**
 * @summary Logs the user out.
 * @route POST /api/auth/logout
 * @returns A 204 response.
 */
router.post('/logout', (_req, res) => {
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.status(204).send();
});

export default router;
