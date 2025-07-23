/**
 * Secure Cookie Manager for WebSocket Authentication
 *
 * Uses the modern Cookie Store API with a polyfill for broader browser support.
 * This eliminates the need for direct document.cookie access.
 */

import {
  getCookieStore,
  installCookieStorePolyfill,
} from './cookie-store-polyfill';

type CookieOptions = {
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
  expires?: Date;
};

// Install polyfill on module load
if (typeof window !== 'undefined') {
  installCookieStorePolyfill();
}

class SecureCookieManager {
  private cookieStore = typeof window !== 'undefined' ? getCookieStore() : null;

  /**
   * Set a secure cookie using Cookie Store API
   */
  async setSecureCookie(
    name: string,
    value: string,
    options: CookieOptions = {},
  ): Promise<void> {
    if (!this.cookieStore) {
      throw new Error('Cookie Store API is not available');
    }

    // Security: Always use secure cookies in production
    const isProduction = window.location.protocol === 'https:';
    const secureOptions: CookieOptions = {
      ...options,
      secure: options.secure ?? isProduction,
      sameSite: options.sameSite ?? 'Strict',
      path: options.path ?? '/',
    };

    await this.cookieStore.set({
      name,
      value,
      path: secureOptions.path,
      domain: secureOptions.domain,
      secure: secureOptions.secure,
      sameSite: secureOptions.sameSite?.toLowerCase() as
        | 'strict'
        | 'lax'
        | 'none',
      expires:
        secureOptions.expires ??
        (secureOptions.maxAge ? secureOptions.maxAge : undefined),
    });
  }

  /**
   * Get a cookie value
   */
  async getCookie(name: string): Promise<string | null> {
    if (!this.cookieStore) {
      throw new Error('Cookie Store API is not available');
    }

    const cookie = await this.cookieStore.get(name);
    return cookie?.value ?? null;
  }

  /**
   * Delete a cookie
   */
  async deleteCookie(
    name: string,
    options: Pick<CookieOptions, 'path' | 'domain'> = {},
  ): Promise<void> {
    if (!this.cookieStore) {
      throw new Error('Cookie Store API is not available');
    }

    await this.cookieStore.delete({
      name,
      path: options.path ?? '/',
      domain: options.domain,
    });
  }

  /**
   * Check if a cookie exists
   */
  async hasCookie(name: string): Promise<boolean> {
    const value = await this.getCookie(name);
    return value !== null;
  }

  /**
   * Get all cookies
   */
  async getAllCookies(): Promise<Array<{ name: string; value: string }>> {
    if (!this.cookieStore) {
      throw new Error('Cookie Store API is not available');
    }

    const cookies = await this.cookieStore.getAll();
    return cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
    }));
  }

  /**
   * WebSocket-specific helper for secure token management
   */
  async setWebSocketToken(token: string): Promise<void> {
    await this.setSecureCookie('sharedb-token', token, {
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'Strict',
      // Token expires when session ends (no maxAge set)
    });
  }

  /**
   * Get WebSocket authentication token
   */
  async getWebSocketToken(): Promise<string | null> {
    return await this.getCookie('sharedb-token');
  }

  /**
   * Clear WebSocket authentication token
   */
  async clearWebSocketToken(): Promise<void> {
    await this.deleteCookie('sharedb-token', {
      path: '/',
    });
  }
}

// Export singleton instance
export const cookieManager = new SecureCookieManager();
