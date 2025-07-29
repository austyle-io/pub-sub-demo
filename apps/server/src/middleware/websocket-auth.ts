import type { IncomingMessage } from 'node:http';
import { type User, verifyAccessToken } from '@collab-edit/shared';
import type { Request } from 'express';

/**
 * @summary Type definition for an authenticated request.
 * @remarks This type extends the Express `Request` object to include the `user` property.
 * @since 1.0.0
 */
export type AuthenticatedRequest = Request & { user: User };

/**
 * @summary Verifies a JWT and returns a user object.
 * @param token - The JWT to verify.
 * @returns A user object.
 * @private
 */
const verifyTokenAndGetUser = (token: string): User => {
  const decoded = verifyAccessToken(token);
  return {
    id: decoded.sub,
    email: decoded.email,
    password: '', // Not stored in JWT for security
    role: decoded.role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * @summary Authenticates a WebSocket connection.
 * @remarks
 * This function authenticates a WebSocket connection by checking for a JWT in the
 * `Authorization` header or a secure cookie. It no longer supports authentication
 * via query parameters for security reasons.
 * @param req - The incoming HTTP request.
 * @returns A promise that resolves to the authenticated user.
 * @throws {Error} If no valid authentication is provided.
 * @since 1.0.0
 */
export const authenticateWebSocket = async (
  req: IncomingMessage,
): Promise<User> => {
  // Method 1: Authorization header (preferred for security)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyTokenAndGetUser(token);
  }

  // Method 2: Secure cookie fallback
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    // Simple cookie parsing for sharedb-token
    const match = cookieHeader.match(/sharedb-token=([^;]+)/);
    if (match?.[1]) {
      return verifyTokenAndGetUser(match[1]);
    }
  }

  // SECURITY: Removed query parameter authentication method
  // Query parameters are logged by servers and can expose tokens
  // All WebSocket connections must now use Authorization headers

  throw new Error('No valid authentication provided');
};
