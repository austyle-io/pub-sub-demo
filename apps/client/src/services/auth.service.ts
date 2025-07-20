import type { 
  LoginRequest, 
  CreateUserRequest, 
  AuthResponse,
  RefreshTokenRequest 
} from '@collab-edit/shared'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class AuthService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }
    
    const authResponse = await response.json()
    this.storeTokens(authResponse)
    return authResponse
  }
  
  async signup(data: CreateUserRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Signup failed')
    }
    
    const authResponse = await response.json()
    this.storeTokens(authResponse)
    return authResponse
  }
  
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const request: RefreshTokenRequest = { refreshToken }
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request),
      credentials: 'include'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Token refresh failed')
    }
    
    const authResponse = await response.json()
    this.storeTokens(authResponse)
    return authResponse
  }
  
  logout(): void {
    this.clearTokens()
  }
  
  getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
    // In production, consider more secure storage options
    const accessToken = sessionStorage.getItem('accessToken')
    const refreshToken = sessionStorage.getItem('refreshToken')
    return { accessToken, refreshToken }
  }
  
  private storeTokens(authResponse: AuthResponse): void {
    // Store tokens in sessionStorage (cleared when browser closes)
    sessionStorage.setItem('accessToken', authResponse.accessToken)
    sessionStorage.setItem('refreshToken', authResponse.refreshToken)
  }
  
  private clearTokens(): void {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
  }
}

export const authService = new AuthService()