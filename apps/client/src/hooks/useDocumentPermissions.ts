import type { Permissions } from '@shared/schemas/permissions';
import { useEffect, useState } from 'react';
import { useAuthFetch } from '../hooks/useAuthFetch';

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
