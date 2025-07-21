class TokenManager {
  private accessToken: string | null = null;

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    // Refresh token will be cleared via server endpoint
  }

  hasValidAccessToken(): boolean {
    if (!this.accessToken) return false;

    try {
      const parts = this.accessToken.split('.');
      if (parts.length !== 3) return false;

      const payloadPart = parts[1];
      if (!payloadPart) return false;

      const payload = JSON.parse(atob(payloadPart));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

export const tokenManager = new TokenManager();
