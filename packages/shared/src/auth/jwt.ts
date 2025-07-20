import jwt from 'jsonwebtoken';
import type { JwtPayload as AuthJwtPayload } from './schemas';

export type { JwtPayload } from './schemas';

export const getAccessTokenSecret = (): string => {
  const secret = process.env['JWT_ACCESS_SECRET'];
  if (!secret) {
    throw new Error(
      'JWT_ACCESS_SECRET not configured. Please check your environment variables.'
    );
  }
  return secret;
};

export const getRefreshTokenSecret = (): string => {
  const secret = process.env['JWT_REFRESH_SECRET'];
  if (!secret) {
    throw new Error(
      'JWT_REFRESH_SECRET not configured. Please check your environment variables.'
    );
  }
  return secret;
};

export const signAccessToken = (payload: AuthJwtPayload): string => {
  const secret = getAccessTokenSecret();
  return jwt.sign(payload, secret, {
    expiresIn: '15m',
    issuer: 'collab-edit',
    audience: 'collab-edit-api',
  });
};

export const signRefreshToken = (payload: AuthJwtPayload): string => {
  const secret = getRefreshTokenSecret();
  return jwt.sign(payload, secret, {
    expiresIn: '7d',
    issuer: 'collab-edit',
    audience: 'collab-edit-refresh',
  });
};

export const verifyAccessToken = (token: string): AuthJwtPayload => {
  const secret = getAccessTokenSecret();
  const decoded = jwt.verify(token, secret, {
    issuer: 'collab-edit',
    audience: 'collab-edit-api',
  }) as AuthJwtPayload;
  return decoded;
};

export const verifyRefreshToken = (token: string): AuthJwtPayload => {
  const secret = getRefreshTokenSecret();
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
