/**
 * @summary A class for managing authentication tokens.
 * @remarks
 * This class provides a simple in-memory store for the access token.
 * It also provides a method for checking if the access token is valid.
 */
class TokenManager {
  private accessToken: string | null = null;

  /**
   * @summary Sets the access token.
   * @param token - The access token.
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * @summary Gets the access token.
   * @returns The access token, or `null` if it does not exist.
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * @summary Clears the access token.
   */
  clearTokens(): void {
    this.accessToken = null;
    // Refresh token will be cleared via server endpoint
  }

  /**
   * @summary Checks if the access token is valid.
   * @returns `true` if the access token is valid, `false` otherwise.
   */
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

/**
 * @summary The singleton instance of the `TokenManager`.
 * @since 1.0.0
 */
export const tokenManager = new TokenManager();
