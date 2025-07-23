/**
 * Secure Cookie Manager for WebSocket Authentication
 *
 * Uses the modern Cookie Store API when available, with secure fallback
 * to document.cookie for broader browser compatibility.
 *
 * Addresses Biome lint rule: noDocumentCookie
 */

interface CookieOptions {
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
  expires?: Date;
}

class SecureCookieManager {
  /**
   * Check if Cookie Store API is available
   */
  private get hasCookieStore(): boolean {
    return (
      'cookieStore' in window && typeof window.cookieStore.set === 'function'
    );
  }

  /**
   * Set a secure cookie using Cookie Store API or fallback
   */
  async setSecureCookie(
    name: string,
    value: string,
    options: CookieOptions = {},
  ): Promise<void> {
    const defaultOptions: CookieOptions = {
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'Strict',
      ...options,
    };

    if (this.hasCookieStore) {
      try {
        // Use modern Cookie Store API (recommended by Biome)
        await window.cookieStore.set({
          name,
          value,
          ...defaultOptions,
        });
        return;
      } catch (error) {
        console.warn(
          'Cookie Store API failed, falling back to document.cookie:',
          error,
        );
      }
    }

    // Secure fallback to document.cookie
    this.setLegacyCookie(name, value, defaultOptions);
  }

  /**
   * Get cookie value using Cookie Store API or fallback
   */
  async getCookie(name: string): Promise<string | null> {
    if (this.hasCookieStore) {
      try {
        const cookie = await window.cookieStore.get(name);
        return cookie?.value ?? null;
      } catch (error) {
        console.warn(
          'Cookie Store API failed, falling back to document.cookie:',
          error,
        );
      }
    }

    // Fallback to document.cookie parsing
    return this.getLegacyCookie(name);
  }

  /**
   * Delete a cookie using Cookie Store API or fallback
   */
  async deleteCookie(
    name: string,
    options: Omit<CookieOptions, 'maxAge' | 'expires'> = {},
  ): Promise<void> {
    const deleteOptions = {
      path: '/',
      ...options,
    };

    if (this.hasCookieStore) {
      try {
        await window.cookieStore.delete({
          name,
          ...deleteOptions,
        });
        return;
      } catch (error) {
        console.warn(
          'Cookie Store API failed, falling back to document.cookie:',
          error,
        );
      }
    }

    // Fallback: expire the cookie
    this.setLegacyCookie(name, '', {
      ...deleteOptions,
      expires: new Date(0),
    });
  }

  /**
   * Secure fallback implementation using document.cookie
   *
   * Note: This method uses document.cookie as a secure fallback when Cookie Store API is unavailable.
   * The usage is carefully controlled and follows security best practices.
   */
  private setLegacyCookie(
    name: string,
    value: string,
    options: CookieOptions,
  ): void {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
      value,
    )}`;

    if (options.path) {
      cookieString += `; Path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; Domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += '; Secure';
    }

    if (options.sameSite) {
      cookieString += `; SameSite=${options.sameSite}`;
    }

    if (options.maxAge !== undefined) {
      cookieString += `; Max-Age=${options.maxAge}`;
    }

    if (options.expires) {
      cookieString += `; Expires=${options.expires.toUTCString()}`;
    }

    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not widely supported yet
    document.cookie = cookieString;
  }

  /**
   * Parse cookie from document.cookie
   */
  private getLegacyCookie(name: string): string | null {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
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

// Type declarations for Cookie Store API
declare global {
  interface Window {
    cookieStore: {
      set(options: {
        name: string;
        value: string;
        path?: string;
        domain?: string;
        secure?: boolean;
        sameSite?: 'Strict' | 'Lax' | 'None';
        maxAge?: number;
        expires?: Date;
      }): Promise<void>;
      get(name: string): Promise<{ name: string; value: string } | undefined>;
      delete(options: {
        name: string;
        path?: string;
        domain?: string;
      }): Promise<void>;
    };
  }
}
