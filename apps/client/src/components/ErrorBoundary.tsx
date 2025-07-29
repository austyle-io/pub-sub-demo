import type React from 'react';
import { Component, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

type State = {
  hasError: boolean;
  error?: Error;
};

/**
 * @summary A React component that catches JavaScript errors anywhere in its child component tree.
 * @remarks
 * This component logs the errors and displays a fallback UI instead of the component
 * tree that crashed.
 * @since 1.0.0
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service (sanitized)
    console.error('Error boundary caught:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'), // Limit stack trace
      componentStack: errorInfo.componentStack
        ?.split('\n')
        .slice(0, 3)
        .join('\n'),
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              padding: '20px',
              border: '1px solid #ff6b6b',
              borderRadius: '8px',
              backgroundColor: '#fff5f5',
              margin: '20px',
            }}
          >
            <h2 style={{ color: '#c92a2a', marginTop: 0 }}>
              Something went wrong
            </h2>
            <p>
              We're sorry, but something unexpected happened. Please try again.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#4c6ef5',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
