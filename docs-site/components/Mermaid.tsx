import mermaid from 'mermaid';
import React, { useEffect, useRef } from 'react';

interface MermaidProps {
  chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = React.useState('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      themeVariables: {
        primaryColor: '#007bff',
        primaryTextColor: '#fff',
        primaryBorderColor: '#0056b3',
        lineColor: '#333',
        secondaryColor: '#6c757d',
        tertiaryColor: '#f8f9fa',
      },
    });

    if (ref.current) {
      mermaid
        .render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart)
        .then((result) => {
          setHtml(result.svg);
        });
    }
  }, [chart]);

  return (
    <div
      ref={ref}
      className="mermaid-container"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Mermaid generates safe SVG content
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
