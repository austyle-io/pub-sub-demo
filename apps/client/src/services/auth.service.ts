import type {
  AuthResponse,
  CreateUserRequest,
  LoginRequest,
} from '@collab-edit/shared';
import { isApiError, isAuthResponse, sanitizeApiError } from '@collab-edit/shared';
import { tokenManager } from '../utils/token-manager';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

class AuthService {
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
      throw new Error(sanitizeApiError(responseData.error ?? 'Token refresh failed'));
    }

    if (!isAuthResponse(responseData)) {
      throw new Error('Invalid authentication response format');
    }

    tokenManager.setAccessToken(responseData.accessToken);
    return responseData;
  }

  logout(): void {
    tokenManager.clearTokens();
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  getAccessToken(): string | null {
    return tokenManager.getAccessToken();
  }
}

export const authService = new AuthService();
