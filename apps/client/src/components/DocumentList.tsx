import type { Document } from '@shared/schemas/document';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuthFetch } from '../hooks/useAuthFetch';
import { useDocumentPermissions } from '../hooks/useDocumentPermissions';
import { sanitizeDocumentTitle, sanitizeText } from '../utils/input-sanitizer';
import { ErrorBoundary } from './ErrorBoundary';

function DocumentListItem({ doc }: { doc: Document }) {
  const { perms, loading } = useDocumentPermissions(doc.id);

  if (loading || !perms?.canRead) {
    return null;
  }

  return (
    <li key={doc.id}>
      <Link to="/documents/$docId" params={{ docId: doc.id }}>
        {sanitizeText(doc.title)}
      </Link>
    </li>
  );
}

export function DocumentList(): JSX.Element {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const authFetch = useAuthFetch();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await authFetch('/api/documents');
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        setDocuments(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred',
        );
      }
    };

    fetchDocuments();
  }, [authFetch]);

  const createDocument = async () => {
    const title = prompt('Enter document title:');
    if (title) {
      const sanitizedTitle = sanitizeDocumentTitle(title);
      try {
        const response = await authFetch('/api/documents', {
          method: 'POST',
          body: JSON.stringify({ title: sanitizedTitle }),
        });
        if (!response.ok) {
          throw new Error('Failed to create document');
        }
        const newDocument = await response.json();
        setDocuments([...documents, newDocument]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred',
        );
      }
    }
  };

  return (
    <ErrorBoundary>
      <div>
        <h2>Documents</h2>
        <button type="button" onClick={createDocument}>
          Create Document
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <ul>
          {documents.map((doc) => (
            <DocumentListItem key={doc.id} doc={doc} />
          ))}
        </ul>
      </div>
    </ErrorBoundary>
  );
}
