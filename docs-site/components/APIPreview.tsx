import type React from 'react';
import { useState } from 'react';

interface APIPreviewProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  description?: string;
  requestBody?: unknown;
  responseExample?: unknown;
  headers?: Record<string, string>;
}

export const APIPreview: React.FC<APIPreviewProps> = ({
  method,
  endpoint,
  description,
  requestBody,
  responseExample,
  headers,
}) => {
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('request');

  const methodColors = {
    GET: 'text-green-600',
    POST: 'text-blue-600',
    PUT: 'text-yellow-600',
    DELETE: 'text-red-600',
    PATCH: 'text-purple-600',
  };

  return (
    <div className="api-preview">
      <div className="api-preview-header">
        <span className={`font-mono font-bold ${methodColors[method]}`}>
          {method}
        </span>
        <code className="ml-2">{endpoint}</code>
      </div>

      {description && (
        <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
      )}

      <div className="mt-4">
        <div className="flex gap-4 border-b">
          <button
            type="button"
            className={`pb-2 ${activeTab === 'request' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('request')}
          >
            Request
          </button>
          <button
            type="button"
            className={`pb-2 ${activeTab === 'response' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('response')}
          >
            Response
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'request' && (
            <div>
              {headers && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Headers</h4>
                  <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-3 rounded">
                    {JSON.stringify(headers, null, 2)}
                  </pre>
                </div>
              )}
              {requestBody && (
                <div>
                  <h4 className="font-semibold mb-2">Request Body</h4>
                  <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-3 rounded">
                    {JSON.stringify(requestBody, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'response' && responseExample && (
            <div>
              <h4 className="font-semibold mb-2">Response Example</h4>
              <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-3 rounded">
                {JSON.stringify(responseExample, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
