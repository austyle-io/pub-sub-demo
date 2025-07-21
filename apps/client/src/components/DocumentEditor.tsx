import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useDocumentPermissions } from '../hooks/useDocumentPermissions';
import { useShareDB } from '../hooks/useShareDB';
import { sanitizeDocumentTitle } from '../utils/input-sanitizer';
import { ErrorBoundary } from './ErrorBoundary';
import { SecureTextArea } from './SecureTextArea';

function AccessDeniedMessage({
  docId,
  error,
}: {
  docId: string;
  error?: string;
}) {
  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        margin: '1rem',
        color: '#856404',
      }}
    >
      <h2 style={{ color: '#856404', marginBottom: '1rem' }}>
        🔒 Access Denied
      </h2>
      <p style={{ marginBottom: '1rem', fontSize: '1.1em' }}>
        You don't have permission to access this document.
      </p>
      {error && (
        <p
          style={{
            marginBottom: '1rem',
            fontSize: '0.9em',
            color: '#dc3545',
            fontStyle: 'italic',
          }}
        >
          Error: {error}
        </p>
      )}
      <div style={{ marginTop: '1.5rem' }}>
        <Link
          to="/documents"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '1rem',
          }}
        >
          ← Back to Documents
        </Link>
        <span style={{ color: '#6c757d', fontSize: '0.9em' }}>
          Document ID: {docId}
        </span>
      </div>
    </div>
  );
}

function LoadingMessage() {
  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6c757d',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          marginBottom: '1rem',
          fontSize: '2rem',
        }}
      >
        ⏳
      </div>
      <p>Loading document...</p>
    </div>
  );
}

export function DocumentEditor(): JSX.Element {
  const { docId } = useParams({ from: '/documents/$docId' });
  const doc = useShareDB(docId);
  const { perms, loading, error } = useDocumentPermissions(docId);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (doc?.data) {
      setContent(doc.data.content ?? '');
    }
  }, [doc]);

  const handleTitleChange = (newTitle: string) => {
    const sanitizedTitle = sanitizeDocumentTitle(newTitle);
    if (doc && perms?.canWrite) {
      // Implement title change logic
      console.log('Title change not implemented yet:', sanitizedTitle);
    }
  };

  const handleContentChange = (newContent: string) => {
    // Content is already sanitized by SecureTextArea
    if (doc && perms?.canWrite) {
      // For now, just update the local state
      // TODO: Implement proper OT diff operations
      console.log('Content changed:', newContent.length, 'characters');
    }
    setContent(newContent);
  };

  if (loading || !doc) {
    return <LoadingMessage />;
  }

  if (error ?? !perms?.canRead) {
    return <AccessDeniedMessage docId={docId} error={error} />;
  }

  const isReadOnly = !perms.canWrite;

  return (
    <ErrorBoundary>
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <h2 style={{ margin: 0 }}>Document Editor</h2>
          <div style={{ fontSize: '0.9em', color: '#6c757d' }}>
            {isReadOnly ? (
              <span style={{ color: '#ffc107' }}>👁️ Read Only</span>
            ) : (
              <span style={{ color: '#28a745' }}>✏️ Editing</span>
            )}
          </div>
        </div>

        <input
          type="text"
          placeholder="Document Title"
          onChange={(e) => handleTitleChange(e.target.value)}
          style={{
            marginBottom: '10px',
            width: '100%',
            padding: '8px',
            opacity: isReadOnly ? 0.7 : 1,
            cursor: isReadOnly ? 'not-allowed' : 'text',
          }}
          readOnly={isReadOnly}
        />

        <SecureTextArea
          value={content}
          onChange={isReadOnly ? () => {} : handleContentChange}
          placeholder={
            isReadOnly
              ? 'You have read-only access to this document.'
              : 'Start typing your document...'
          }
          maxLength={50000}
          rows={20}
        />
      </div>
    </ErrorBoundary>
  );
}
