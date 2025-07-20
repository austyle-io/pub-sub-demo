import type { JwtPayload } from '@collab-edit/shared';
import type { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

const getSecret = (): string => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

let isConfigured = false;

export function configurePassport(): void {
  if (isConfigured) return;

  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: getSecret(),
    issuer: 'collab-edit',
    audience: 'collab-edit-api',
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (payload: JwtPayload, done) => {
      try {
        // The payload contains all the user info we need
        // In a production app, you might want to fetch fresh user data here
        done(null, payload);
      } catch (error) {
        done(error, false);
      }
    }),
  );

  isConfigured = true;
}

// Type augmentation for Express Request
// Note: TypeScript requires 'interface' for declaration merging.
// This is the only valid way to extend Express types.
declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!isConfigured) {
    configurePassport();
  }
  return passport.authenticate('jwt', { session: false })(req, res, next);
};
