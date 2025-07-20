import jwt from 'jsonwebtoken';
import type { JwtPayload as AuthJwtPayload } from './schemas';

export type { JwtPayload } from './schemas';

const getSecret = (): string => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

export const signAccessToken = (payload: AuthJwtPayload): string => {
  const secret = getSecret();
  return jwt.sign(payload, secret, {
    expiresIn: '15m',
    issuer: 'collab-edit',
    audience: 'collab-edit-api',
  });
};

export const signRefreshToken = (payload: AuthJwtPayload): string => {
  const secret = getSecret();
  return jwt.sign(payload, secret, {
    expiresIn: '7d',
    issuer: 'collab-edit',
    audience: 'collab-edit-refresh',
  });
};

export const verifyAccessToken = (token: string): AuthJwtPayload => {
  const secret = getSecret();
  const decoded = jwt.verify(token, secret, {
    issuer: 'collab-edit',
    audience: 'collab-edit-api',
  }) as AuthJwtPayload;
  return decoded;
};

export const verifyRefreshToken = (token: string): AuthJwtPayload => {
  const secret = getSecret();
  const decoded = jwt.verify(token, secret, {
    issuer: 'collab-edit',
    audience: 'collab-edit-refresh',
  }) as AuthJwtPayload;
  return decoded;
};

export const decodeToken = (token: string): AuthJwtPayload | null => {
  try {
    const decoded = jwt.decode(token) as AuthJwtPayload;
    return decoded;
  } catch {
    return null;
  }
};
