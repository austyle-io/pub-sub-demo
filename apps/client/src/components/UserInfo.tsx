import { useAuth } from '../contexts/AuthContext';

/**
 * @summary A component that displays the current authenticated user's email and role,
 * along with a logout button.
 * @returns A JSX element, or `null` if no user is authenticated.
 * @since 1.0.0
 */
export function UserInfo(): React.JSX.Element | null {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '10px',
        background: '#f5f5f5',
        borderRadius: '4px',
      }}
    >
      <span>
        Logged in as: <strong>{user.email}</strong> ({user.role})
      </span>
      <button
        type="button"
        onClick={logout}
        style={{
          padding: '5px 10px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </div>
  );
}
