import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * @summary A React hook for making authenticated fetch requests.
 * @remarks
 * This hook wraps the standard `fetch` API to automatically include the
 * authentication token in the request headers. It also handles token
 * refreshing and retrying the request if the initial attempt fails with
 * an unauthorized error.
 * @returns An authenticated fetch function.
 * @since 1.0.0
 * @example
 * ```typescript
 * const authFetch = useAuthFetch();
 * const response = await authFetch('/api/data');
 * const data = await response.json();
 * ```
 */
export function useAuthFetch() {
  const { accessToken, refresh } = useAuth();

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      // Add auth header
      const authOptions: RequestInit = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      };

      let response = await fetch(url, authOptions);

      // If unauthorized, try to refresh token
      if (response.status === 401 && refresh) {
        await refresh();

        // Retry with new token
        response = await fetch(url, authOptions);
      }

      return response;
    },
    [accessToken, refresh],
  );

  return authFetch;
}
