import { useParams } from '@tanstack/react-router';
import { useShareDB } from '../hooks/useShareDB';
import { useState, useEffect } from 'react';
import { type as textUnicode } from 'ot-text-unicode';
import { ErrorBoundary } from './ErrorBoundary';
import { SecureTextArea } from './SecureTextArea';
import { sanitizeDocumentTitle } from '../utils/input-sanitizer';
import { useDocumentPermissions } from '../hooks/useDocumentPermissions';

export function DocumentEditor(): JSX.Element {
  const { docId } = useParams({ from: '/documents/$docId' });
  const doc = useShareDB(docId);
  const { perms, loading, error } = useDocumentPermissions(docId);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (doc) {
      setContent(doc.data.content);
      doc.on('op', () => {
        setContent(doc.data.content);
      });
    }
  }, [doc]);

  const handleTitleChange = (newTitle: string) => {
    const sanitizedTitle = sanitizeDocumentTitle(newTitle);
    // Update document title logic
  };

  const handleContentChange = (newContent: string) => {
    // Content is already sanitized by SecureTextArea
    if (doc && perms?.canWrite) {
      const diff = textUnicode.diff(content, newContent);
      if (diff) {
        doc.submitOp([{ p: ['content'], t: 'text-unicode', o: diff }]);
      }
    }
    setContent(newContent);
  };

  if (loading || !doc) {
    return <div>Loading...</div>;
  }

  if (error || !perms?.canRead) {
    return <div>Access Denied</div>;
  }

  const isReadOnly = !perms.canWrite;

  return (
    <ErrorBoundary>
      <div>
        <h2>Document Editor</h2>
        <p>Editing document with ID: {docId}</p>
        
        <input
          type="text"
          placeholder="Document Title"
          onChange={(e) => handleTitleChange(e.target.value)}
          style={{ marginBottom: '10px', width: '100%', padding: '8px' }}
          readOnly={isReadOnly}
        />
        
        <SecureTextArea
          value={content}
          onChange={handleContentChange}
          placeholder="Start typing your document..."
          maxLength={50000}
          rows={20}
          readOnly={isReadOnly}
        />
      </div>
    </ErrorBoundary>
  );
}
