import { Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginForm } from './components/LoginForm';
import { UserInfo } from './components/UserInfo';
import { AuthProvider, useAuth } from './contexts/AuthContext';

/**
 * Main application content: handles authentication state and renders UI accordingly.
 */
function AppContent(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/documents' });
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Collaborative Document Editor - Dev Environment</h1>

      {isAuthenticated ? (
        <>
          <UserInfo />
          <Outlet />
        </>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}

/**
 * Root component that provides authentication context to the application.
 */
function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
