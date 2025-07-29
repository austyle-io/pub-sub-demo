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

/**
 * @summary A class for managing cookies securely using the Cookie Store API.
 * @remarks
 * This class provides a secure interface for setting, getting, and deleting
 * cookies. It uses the modern Cookie Store API with a polyfill for broader
 * browser support.
 */
class SecureCookieManager {
  private cookieStore = typeof window !== 'undefined' ? getCookieStore() : null;

  /**
   * @summary Sets a secure cookie.
   * @param name - The name of the cookie.
   * @param value - The value of the cookie.
   * @param options - The cookie options.
   * @returns A promise that resolves when the cookie is set.
   * @throws {Error} If the Cookie Store API is not available.
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
   * @summary Gets the value of a cookie.
   * @param name - The name of the cookie.
   * @returns A promise that resolves to the cookie value, or `null` if the cookie
   * does not exist.
   * @throws {Error} If the Cookie Store API is not available.
   */
  async getCookie(name: string): Promise<string | null> {
    if (!this.cookieStore) {
      throw new Error('Cookie Store API is not available');
    }

    const cookie = await this.cookieStore.get(name);
    return cookie?.value ?? null;
  }

  /**
   * @summary Deletes a cookie.
   * @param name - The name of the cookie.
   * @param options - The cookie options.
   * @returns A promise that resolves when the cookie is deleted.
   * @throws {Error} If the Cookie Store API is not available.
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
   * @summary Checks if a cookie exists.
   * @param name - The name of the cookie.
   * @returns A promise that resolves to `true` if the cookie exists, `false` otherwise.
   */
  async hasCookie(name: string): Promise<boolean> {
    const value = await this.getCookie(name);
    return value !== null;
  }

  /**
   * @summary Gets all cookies.
   * @returns A promise that resolves to an array of all cookies.
   * @throws {Error} If the Cookie Store API is not available.
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
   * @summary Sets the WebSocket authentication token.
   * @param token - The authentication token.
   * @returns A promise that resolves when the token is set.
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
   * @summary Gets the WebSocket authentication token.
   * @returns A promise that resolves to the authentication token, or `null` if it
   * does not exist.
   */
  async getWebSocketToken(): Promise<string | null> {
    return await this.getCookie('sharedb-token');
  }

  /**
   * @summary Clears the WebSocket authentication token.
   * @returns A promise that resolves when the token is cleared.
   */
  async clearWebSocketToken(): Promise<void> {
    await this.deleteCookie('sharedb-token', {
      path: '/',
    });
  }
}

/**
 * @summary The singleton instance of the `SecureCookieManager`.
 * @since 1.0.0
 */
export const cookieManager = new SecureCookieManager();
