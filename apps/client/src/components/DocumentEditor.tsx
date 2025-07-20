import { useParams } from '@tanstack/react-router';
import { useShareDB } from '../hooks/useShareDB';
import { useState, useEffect } from 'react';
import { type as textUnicode } from 'ot-text-unicode';

export function DocumentEditor(): JSX.Element {
  const { docId } = useParams({ from: '/documents/$docId' });
  const doc = useShareDB(docId);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (doc) {
      setContent(doc.data.content);
      doc.on('op', () => {
        setContent(doc.data.content);
      });
    }
  }, [doc]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    if (doc) {
      const diff = textUnicode.diff(content, newContent);
      if (diff) {
        doc.submitOp([{ p: ['content'], t: 'text-unicode', o: diff }]);
      }
    }
    setContent(newContent);
  };

  if (!doc) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Document Editor</h2>
      <p>Editing document with ID: {docId}</p>
      <textarea
        value={content}
        onChange={handleChange}
        rows={20}
        style={{ width: '100%' }}
      />
    </div>
  );
}
