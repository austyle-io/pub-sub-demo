import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';

// Mock the useAuth hook with different return values for each test
const mockUseAuth = vi.fn();

// Mock the AuthContext module
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the router hooks to prevent navigation errors in tests
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});

/**
 * App component tests following React Testing Library best practices:
 * - Test user behavior, not implementation details
 * - Use mocks to control component dependencies
 * - Focus on what users see and interact with
 *
 * References:
 * - https://testing-library.com/docs/guiding-principles/
 * - https://kentcdodds.com/blog/test-isolation-with-react
 */

describe('App', () => {
  it('renders login form when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(<App />);

    // Test what the user sees, not implementation details
    expect(
      screen.getByText('Collaborative Document Editor - Dev Environment'),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Log In' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
  });

  it('renders user info and outlet when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '123',
        email: 'test@example.com',
        role: 'editor',
      },
    });

    render(<App />);

    // Verify authenticated user experience
    expect(
      screen.getByText('Collaborative Document Editor - Dev Environment'),
    ).toBeInTheDocument();

    // Should not show login form when authenticated
    expect(
      screen.queryByRole('heading', { name: 'Log In' }),
    ).not.toBeInTheDocument();

    // Should show the outlet content for routing
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('shows loading state appropriately', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    render(<App />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Log In' }),
    ).not.toBeInTheDocument();
  });
});
