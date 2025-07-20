import {
  type ErrorResponse,
  getValidationErrors,
  isCreateUserRequest,
  isLoginRequest,
  isRefreshTokenRequest,
  validateCreateUserRequest,
  validateLoginRequest,
  validateRefreshTokenRequest,
  sanitizeApiError,
} from '@collab-edit/shared';
import { type Request, type Response, Router } from 'express';
import { AuthService } from '../services/auth.service';

/**
 * Authentication routes: signup, login, and token refresh endpoints.
 */
const router: Router = Router();
const authService = new AuthService();

/**
 * Register a new user.
 * @route POST /api/auth/signup
 * @param req.body CreateUserRequest payload
 * @returns 201 with auth tokens or error response
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
      return res.status(201).json(authResponse);
    } catch (error) {
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
 * Authenticate an existing user.
 * @route POST /api/auth/login
 * @param req.body LoginRequest payload
 * @returns auth tokens or error response
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
      return res.json(authResponse);
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
 * Refresh access and refresh tokens.
 * @route POST /api/auth/refresh
 * @param req.body RefreshTokenRequest payload
 * @returns new auth tokens or error response
 */
router.post(
  '/refresh',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      // Validate request
      if (!isRefreshTokenRequest(req.body)) {
        const errors = getValidationErrors(validateRefreshTokenRequest);
        const errorResponse: ErrorResponse = {
          error: 'Validation failed',
          details: errors,
        };
        return res.status(400).json(errorResponse);
      }

      // Refresh tokens - type guard ensures type safety
      const authResponse = await authService.refreshTokens(
        req.body.refreshToken,
      );
      return res.json(authResponse);
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

export default router;
