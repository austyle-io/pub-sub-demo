/**
 * Cookie Store API Polyfill
 * Provides a Promise-based API for cookie management that matches the proposed Cookie Store API
 * @see https://wicg.github.io/cookie-store/
 */

import { getCookieString, setCookieString } from './cookie-dom-interface';

export type CookieStoreGetOptions = {
  name?: string;
  url?: string;
};

export type CookieInit = {
  name?: string;
  value?: string;
  expires?: Date | number | null;
  domain?: string | null;
  path?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
};

export type Cookie = {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: Date | null;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
};

export type CookieStore = {
  get(name: string): Promise<Cookie | undefined>;
  get(options?: CookieStoreGetOptions): Promise<Cookie | undefined>;
  getAll(name?: string): Promise<Cookie[]>;
  getAll(options?: CookieStoreGetOptions): Promise<Cookie[]>;
  set(name: string, value: string): Promise<void>;
  set(options: CookieInit): Promise<void>;
  delete(name: string): Promise<void>;
  delete(options: CookieInit): Promise<void>;
};

class CookieStorePolyfill implements CookieStore {
  /**
   * Parse cookie string into Cookie objects
   */
  private parseCookies(): Map<string, Cookie> {
    const cookies = new Map<string, Cookie>();
    const cookieStrings = getCookieString().split(';');

    for (const cookieString of cookieStrings) {
      const trimmed = cookieString.trim();
      if (!trimmed) continue;

      const [nameValue, ...attributes] = trimmed.split(';');
      const [name, ...valueParts] = nameValue?.split('=') ?? [];
      if (!name) continue;

      const value = valueParts.join('='); // Handle values with = in them
      const cookie: Cookie = {
        name: decodeURIComponent(name.trim()),
        value: decodeURIComponent(value?.trim() ?? ''),
      };

      // Parse attributes (note: most are not accessible via document.cookie)
      for (const attr of attributes) {
        const [key, val] = attr.split('=').map((s) => s?.trim());
        if (!key) continue;

        switch (key.toLowerCase()) {
          case 'path':
            cookie.path = val;
            break;
          case 'domain':
            cookie.domain = val;
            break;
          case 'expires':
            cookie.expires = val ? new Date(val) : null;
            break;
          case 'secure':
            cookie.secure = true;
            break;
          case 'samesite':
            cookie.sameSite = val?.toLowerCase() as 'strict' | 'lax' | 'none';
            break;
          case 'httponly':
            cookie.httpOnly = true;
            break;
        }
      }

      cookies.set(cookie.name, cookie);
    }

    return cookies;
  }

  /**
   * Serialize a cookie to a Set-Cookie string
   */
  private serializeCookie(cookie: CookieInit): string {
    if (!cookie.name) {
      throw new TypeError('Cookie name is required');
    }

    const parts: string[] = [
      `${encodeURIComponent(cookie.name)}=${encodeURIComponent(cookie.value ?? '')}`,
    ];

    if (cookie.expires !== undefined) {
      if (cookie.expires === null) {
        // Delete cookie by setting expires to past
        parts.push(`Expires=${new Date(0).toUTCString()}`);
      } else if (typeof cookie.expires === 'number') {
        // Max-Age in seconds
        parts.push(`Max-Age=${cookie.expires}`);
      } else {
        // Date object
        parts.push(`Expires=${cookie.expires.toUTCString()}`);
      }
    }

    if (cookie.domain) {
      parts.push(`Domain=${cookie.domain}`);
    }

    if (cookie.path) {
      parts.push(`Path=${cookie.path}`);
    }

    if (cookie.secure) {
      parts.push('Secure');
    }

    if (cookie.sameSite) {
      parts.push(
        `SameSite=${cookie.sameSite.charAt(0).toUpperCase() + cookie.sameSite.slice(1)}`,
      );
    }

    // Note: HttpOnly cannot be set via JavaScript
    return parts.join('; ');
  }

  async get(
    nameOrOptions?: string | CookieStoreGetOptions,
  ): Promise<Cookie | undefined> {
    const name =
      typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions?.name;

    if (!name) {
      throw new TypeError('Cookie name is required');
    }

    const cookies = this.parseCookies();
    return cookies.get(name);
  }

  async getAll(
    nameOrOptions?: string | CookieStoreGetOptions,
  ): Promise<Cookie[]> {
    const name =
      typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions?.name;
    const cookies = this.parseCookies();

    if (name) {
      const cookie = cookies.get(name);
      return cookie ? [cookie] : [];
    }

    return Array.from(cookies.values());
  }

  async set(nameOrOptions: string | CookieInit, value?: string): Promise<void> {
    let cookie: CookieInit;

    if (typeof nameOrOptions === 'string') {
      if (value === undefined) {
        throw new TypeError('Cookie value is required when name is a string');
      }
      cookie = { name: nameOrOptions, value };
    } else {
      cookie = nameOrOptions;
    }

    const cookieString = this.serializeCookie(cookie);
    setCookieString(cookieString);
  }

  async delete(nameOrOptions: string | CookieInit): Promise<void> {
    let cookie: CookieInit;

    if (typeof nameOrOptions === 'string') {
      cookie = { name: nameOrOptions };
    } else {
      cookie = nameOrOptions;
    }

    // Set expires to past to delete cookie
    await this.set({ ...cookie, expires: null });
  }
}

// Extend Window interface to include cookieStore
declare global {
  interface Window {
    cookieStore?: CookieStore;
  }
}

/**
 * Install the polyfill if Cookie Store API is not available
 */
export function installCookieStorePolyfill(): void {
  if (typeof window !== 'undefined' && !window.cookieStore) {
    window.cookieStore = new CookieStorePolyfill();
  }
}

/**
 * Get the Cookie Store instance (native or polyfill)
 */
export function getCookieStore(): CookieStore {
  if (typeof window === 'undefined') {
    throw new Error(
      'Cookie Store API is only available in browser environments',
    );
  }

  if (!window.cookieStore) {
    installCookieStorePolyfill();
  }

  if (!window.cookieStore) {
    throw new Error('Failed to initialize Cookie Store API');
  }

  return window.cookieStore;
}
