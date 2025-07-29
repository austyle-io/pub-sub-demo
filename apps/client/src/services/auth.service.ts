import type {
  AuthResponse,
  CreateUserRequest,
  LoginRequest,
} from '@collab-edit/shared';
import {
  isApiError,
  isAuthResponse,
  sanitizeApiError,
} from '@collab-edit/shared';
import { tokenManager } from '../utils/token-manager';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

/**
 * @summary A service for handling authentication-related API requests.
 * @remarks
 * This service provides methods for logging in, signing up, refreshing tokens,
 * and logging out. It also manages the storage of the access token.
 */
class AuthService {
  /**
   * @summary Logs in a user.
   * @param data - The login data.
   * @returns A promise that resolves to the authentication response.
   * @throws {Error} If the login fails.
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (!isApiError(responseData)) {
        throw new Error('Invalid error response format');
      }
      throw new Error(sanitizeApiError(responseData.error ?? 'Login failed'));
    }

    if (!isAuthResponse(responseData)) {
      throw new Error('Invalid authentication response format');
    }

    tokenManager.setAccessToken(responseData.accessToken);
    return responseData;
  }

  /**
   * @summary Signs up a new user.
   * @param data - The signup data.
   * @returns A promise that resolves to the authentication response.
   * @throws {Error} If the signup fails.
   */
  async signup(data: CreateUserRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (!isApiError(responseData)) {
        throw new Error('Invalid error response format');
      }
      throw new Error(sanitizeApiError(responseData.error ?? 'Signup failed'));
    }

    if (!isAuthResponse(responseData)) {
      throw new Error('Invalid authentication response format');
    }

    tokenManager.setAccessToken(responseData.accessToken);
    return responseData;
  }

  /**
   * @summary Refreshes the access token.
   * @returns A promise that resolves to the authentication response.
   * @throws {Error} If the token refresh fails.
   */
  async refreshToken(): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (!isApiError(responseData)) {
        throw new Error('Invalid error response format');
      }
      throw new Error(
        sanitizeApiError(responseData.error ?? 'Token refresh failed'),
      );
    }

    if (!isAuthResponse(responseData)) {
      throw new Error('Invalid authentication response format');
    }

    tokenManager.setAccessToken(responseData.accessToken);
    return responseData;
  }

  /**
   * @summary Logs out the user.
   */
  logout(): void {
    tokenManager.clearTokens();
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  /**
   * @summary Gets the access token.
   * @returns The access token, or `null` if it does not exist.
   */
  getAccessToken(): string | null {
    return tokenManager.getAccessToken();
  }
}

/**
 * @summary The singleton instance of the `AuthService`.
 * @since 1.0.0
 */
export const authService = new AuthService();
