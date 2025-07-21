import type { IncomingMessage } from 'node:http';
import { type User, verifyAccessToken } from '@collab-edit/shared';
import type { Request } from 'express';

export type AuthenticatedRequest = Request & { user: User };

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

export const authenticateWebSocket = async (
  req: IncomingMessage,
): Promise<User> => {
  // Method 1: Query parameter (for WebSocket connections)
  const url = new URL(req.url ?? '', `http://${req.headers.host}`);
  const tokenFromQuery = url.searchParams.get('token');
  if (tokenFromQuery) {
    return verifyTokenAndGetUser(tokenFromQuery);
  }

  // Method 2: Authorization header (preferred for HTTP)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyTokenAndGetUser(token);
  }

  // Method 3: Secure cookie fallback
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    // Simple cookie parsing for sharedb-token
    const match = cookieHeader.match(/sharedb-token=([^;]+)/);
    if (match?.[1]) {
      return verifyTokenAndGetUser(match[1]);
    }
  }

  throw new Error('No valid authentication provided');
};
