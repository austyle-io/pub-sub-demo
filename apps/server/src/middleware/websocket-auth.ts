import type { IncomingMessage } from 'node:http';
import { verifyAccessToken } from '@collab-edit/shared';
import type { User } from '../types/auth';
import { parse as parseCookie } from 'cookie';

const verifyTokenAndGetUser = (token: string): User => {
  const decoded = verifyAccessToken(token);
  return {
    id: decoded.sub,
    email: decoded.email,
    role: decoded.role,
  };
};

export const authenticateWebSocket = async (
  req: IncomingMessage,
): Promise<User> => {
  // Method 1: Authorization header (preferred)
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyTokenAndGetUser(token);
  }

  // Method 2: Secure cookie fallback
  const cookies = parseCookie(req.headers.cookie || '');
  if (cookies['sharedb-token']) {
    return verifyTokenAndGetUser(cookies['sharedb-token']);
  }

  throw new Error('No valid authentication provided');
};
