import type {
  AuthResponse,
  CreateUserRequest,
  LoginRequest,
  RefreshTokenRequest,
} from '@collab-edit/shared';
import { isApiError, isAuthResponse } from '@collab-edit/shared';

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

    if (!response.ok) {
      const errorData = await response.json();
      if (!isApiError(errorData)) {
        throw new Error('Invalid error response format');
      }
      throw new Error(errorData.error ?? 'Login failed');
    }

    const authResponseData = await response.json();
    if (!isAuthResponse(authResponseData)) {
      throw new Error('Invalid authentication response format');
    }

    this.storeTokens(authResponseData);
    return authResponseData;
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

    if (!response.ok) {
      const errorData = await response.json();
      if (!isApiError(errorData)) {
        throw new Error('Invalid error response format');
      }
      throw new Error(errorData.error ?? 'Signup failed');
    }

    const authResponseData = await response.json();
    if (!isAuthResponse(authResponseData)) {
      throw new Error('Invalid authentication response format');
    }

    this.storeTokens(authResponseData);
    return authResponseData;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const request: RefreshTokenRequest = { refreshToken };

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (!isApiError(errorData)) {
        throw new Error('Invalid error response format');
      }
      throw new Error(errorData.error ?? 'Token refresh failed');
    }

    const authResponseData = await response.json();
    if (!isAuthResponse(authResponseData)) {
      throw new Error('Invalid authentication response format');
    }

    this.storeTokens(authResponseData);
    return authResponseData;
  }

  logout(): void {
    this.clearTokens();
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  getStoredTokens(): {
    accessToken: string | null;
    refreshToken: string | null;
  } {
    // In production, consider more secure storage options
    const accessToken = sessionStorage.getItem('accessToken');
    const refreshToken = sessionStorage.getItem('refreshToken');
    return { accessToken, refreshToken };
  }

  private storeTokens(authResponse: AuthResponse): void {
    // Store tokens in sessionStorage (cleared when browser closes)
    sessionStorage.setItem('accessToken', authResponse.accessToken);
    sessionStorage.setItem('refreshToken', authResponse.refreshToken);
  }

  private clearTokens(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  }
}

export const authService = new AuthService();
