import type React from 'react';
import { useState } from 'react';

interface CodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlight?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  language = 'typescript',
  filename,
  showLineNumbers = false,
  highlight,
}) => {
  // Unused parameters will be used in future implementations
  void showLineNumbers;
  void highlight;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      {filename && <div className="code-block-filename">{filename}</div>}
      <div className="code-block-container">
        <pre className={`language-${language}`}>
          <code>{children}</code>
        </pre>
        <button
          type="button"
          className="copy-button"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};
