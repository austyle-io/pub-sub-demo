import type { IncomingMessage } from 'node:http';
import { parse } from 'node:url';
import type { JwtPayload } from '@collab-edit/shared';
import { verifyAccessToken, verifyRefreshToken } from '@collab-edit/shared';
import isNil from 'lodash.isnil';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';

export type AuthenticatedRequest = IncomingMessage & {
  user?: {
    id: string;
    email: string;
    role: string;
  };
};

/**
 * WebSocket authentication middleware for ShareDB
 */
export function authenticateWebSocket(
  req: IncomingMessage & { user?: { id: string; email: string; role: string } },
  token?: string,
): void {
  try {
    let verifyFn = verifyAccessToken;
    let actualToken = token;

    if (!actualToken) {
      // Extract token from query parameters
      const { query } = parse(req.url ?? '', true);
      actualToken = query['token'] as string;
    }

    if (!actualToken) {
      throw new Error('No token provided');
    }

    // Try access token first, then refresh token
    let decoded: JwtPayload;
    try {
      decoded = verifyFn(actualToken);
    } catch {
      verifyFn = verifyRefreshToken;
      decoded = verifyFn(actualToken);
    }

    // Type guard to ensure decoded is JwtPayload with required fields
    if (
      isNil(decoded) ||
      !isObject(decoded) ||
      !('sub' in decoded && isString(decoded.sub)) ||
      !('email' in decoded && isString(decoded.email)) ||
      !('role' in decoded && isString(decoded.role))
    ) {
      throw new Error('Invalid token payload');
    }

    // Attach user to request
    const authenticatedReq = req satisfies AuthenticatedRequest;
    if ('user' in authenticatedReq) {
      authenticatedReq.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
    }
  } catch (error) {
    throw new Error(
      `WebSocket authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
