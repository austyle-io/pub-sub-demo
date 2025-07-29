import { type JwtPayload, getAccessTokenSecret } from '@collab-edit/shared';
import type { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

let isConfigured = false;

/**
 * @summary Configures the Passport.js JWT authentication strategy.
 * @remarks
 * This function sets up the JWT strategy for Passport.js, which is used to
 * protect API endpoints. It configures the strategy to extract the JWT from
 * the authorization header and verifies it using the access token secret.
 * @since 1.0.0
 */
export function configurePassport(): void {
  if (isConfigured) return;

  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: getAccessTokenSecret(),
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

/**
 * @summary Middleware for authenticating requests using Passport.js.
 * @remarks
 * This middleware uses the configured JWT strategy to authenticate incoming
 * requests. It ensures that the `configurePassport` function has been called
 * before attempting to authenticate.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 * @since 1.0.0
 */
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
