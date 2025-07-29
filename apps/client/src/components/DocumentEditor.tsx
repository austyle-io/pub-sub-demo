import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useDocumentPermissions } from '../hooks/useDocumentPermissions';
import { useShareDB } from '../hooks/useShareDB';
import { sanitizeDocumentTitle } from '../utils/input-sanitizer';
import { ErrorBoundary } from './ErrorBoundary';
import { SecureTextArea } from './SecureTextArea';

/**
 * @summary A message component to display when access to a document is denied.
 * @param props - The component props.
 * @param props.docId - The ID of the document.
 * @param props.error - An optional error message to display.
 * @returns A JSX element.
 * @private
 */
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

/**
 * @summary A message component to display while the document is loading.
 * @returns A JSX element.
 * @private
 */
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

/**
 * @summary The main document editor component.
 * @remarks
 * This component provides a rich text editor for collaborative document editing.
 * It uses ShareDB for real-time synchronization and handles document permissions.
 * @returns A JSX element.
 * @since 1.0.0
 */
export function DocumentEditor(): React.JSX.Element {
  const { docId } = useParams({ from: '/documents/$docId' });
  const doc = useShareDB(docId);
  const { perms, loading, error } = useDocumentPermissions(docId);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  // Set initial content when document loads
  useEffect(() => {
    if (doc?.data) {
      setContent(doc.data.content ?? '');
      setTitle(doc.data.title ?? '');
    }
  }, [doc]);

  // Listen for remote operations
  useEffect(() => {
    if (!doc) return;

    const handleOp = () => {
      // Update local state when remote changes come in
      setContent(doc.data.content ?? '');
      setTitle(doc.data.title ?? '');
    };

    doc.on('op', handleOp);
    return () => {
      doc.removeListener('op', handleOp);
    };
  }, [doc]);

  const handleTitleChange = (newTitle: string) => {
    const sanitizedTitle = sanitizeDocumentTitle(newTitle);
    if (doc && perms?.canWrite) {
      // Submit OT operation to ShareDB for title change
      const op = [
        {
          p: ['title'], // Path to the title field
          oi: sanitizedTitle, // Object insert (new value)
          od: doc.data.title ?? '', // Object delete (old value)
        },
      ];

      try {
        doc.submitOp(op);
      } catch (error) {
        console.error('Failed to submit title operation:', error);
      }
    }
    // Update local state optimistically
    setTitle(sanitizedTitle);
  };

  const handleContentChange = (newContent: string) => {
    // Content is already sanitized by SecureTextArea
    if (doc && perms?.canWrite) {
      // Submit OT operation to ShareDB
      // Using json0 OT type, we need to replace the entire content field
      const op = [
        {
          p: ['content'], // Path to the content field
          oi: newContent, // Object insert (new value)
          od: doc.data.content ?? '', // Object delete (old value)
        },
      ];

      try {
        doc.submitOp(op);
      } catch (error) {
        console.error('Failed to submit operation:', error);
      }
    }
    // Update local state optimistically
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
          value={title}
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
