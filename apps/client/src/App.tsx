import { Outlet, useNavigate } from '@tanstack/react-router';
import { LoginForm } from './components/LoginForm';
import { UserInfo } from './components/UserInfo';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';

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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
