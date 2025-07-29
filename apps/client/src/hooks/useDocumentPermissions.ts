import type { Permissions } from '@shared/schemas/permissions';
import { useEffect, useState } from 'react';
import { useAuthFetch } from '../hooks/useAuthFetch';

/**
 * @summary A React hook for fetching document permissions.
 * @remarks
 * This hook fetches the permissions for a given document, and returns the
 * permissions, loading state, and any errors that occurred.
 * @param docId - The ID of the document to fetch permissions for.
 * @returns An object containing the permissions, loading state, and error.
 * @since 1.0.0
 * @example
 * ```typescript
 * const { perms, loading, error } = useDocumentPermissions(docId);
 * if (loading) return <p>Loading...</p>;
 * if (error) return <p>{error}</p>;
 * if (perms) return <p>Permissions: {JSON.stringify(perms)}</p>;
 * ```
 */
export const useDocumentPermissions = (docId: string) => {
  const authFetch = useAuthFetch();
  const [perms, setPerms] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`/api/documents/${docId}/permissions`);
        const data = await res.json();
        if (!ignore) setPerms(data);
      } catch (_e) {
        if (!ignore) setError('Failed to load permissions');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [docId, authFetch]);

  return { perms, loading, error };
};
