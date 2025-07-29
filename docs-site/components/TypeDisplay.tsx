import type React from 'react';
import { useState } from 'react';

interface TypeDisplayProps {
  name: string;
  type: string;
  description?: string;
  properties?: Array<{
    name: string;
    type: string;
    required?: boolean;
    description?: string;
  }>;
  example?: unknown;
}

export const TypeDisplay: React.FC<TypeDisplayProps> = ({
  name,
  type,
  description,
  properties,
  example,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="type-display-container border rounded-lg p-4 my-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-mono text-lg font-semibold">{name}</h3>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        {properties && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-blue-500 hover:text-blue-600"
          >
            {expanded ? 'Hide' : 'Show'} Properties
          </button>
        )}
      </div>

      <div className="mt-3">
        <code className="type-display">{type}</code>
      </div>

      {expanded && properties && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-semibold mb-3">Properties</h4>
          <div className="space-y-3">
            {properties.map((prop) => (
              <div key={prop.name} className="border-l-2 pl-4">
                <div className="flex items-baseline gap-2">
                  <code className="font-mono font-semibold">{prop.name}</code>
                  {prop.required && (
                    <span className="text-xs text-red-500">required</span>
                  )}
                </div>
                <code className="text-sm text-gray-600 dark:text-gray-400">
                  {prop.type}
                </code>
                {prop.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {prop.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {example && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-semibold mb-2">Example</h4>
          <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-3 rounded">
            {JSON.stringify(example, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
