/**
 * Password hashing and verification utilities using bcrypt.
 *
 * This module provides secure password hashing and verification functions
 * using the bcrypt algorithm. It automatically adjusts the computational
 * cost based on the environment to balance security and performance.
 *
 * @module auth/password
 * @since 1.0.0
 */

import bcrypt from 'bcrypt';

/**
 * Salt rounds for bcrypt hashing.
 *
 * Uses environment-specific values:
 * - Production: 12 rounds for strong security
 * - Test: 4 rounds for faster test execution
 *
 * Higher values increase security but also computational cost.
 *
 * @internal
 */
const SALT_ROUNDS = process.env['NODE_ENV'] === 'test' ? 4 : 12;

/**
 * Hashes a plain text password using bcrypt.
 *
 * Creates a secure hash that includes the salt, making it safe to store
 * in the database. The hash format includes the algorithm, cost factor,
 * salt, and hashed password.
 *
 * @param password - Plain text password to hash
 * @returns Promise resolving to the hashed password
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const hashedPassword = await hashPassword('MySecurePassword123');
 * // Result: $2b$12$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH (60 character string)
 *
 * // Store in database
 * await db.users.create({
 *   email: 'user@example.com',
 *   password: hashedPassword
 * });
 * ```
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verifies a plain text password against a bcrypt hash.
 *
 * Compares the provided password with the stored hash in a timing-safe manner.
 * This function is designed to prevent timing attacks.
 *
 * @param password - Plain text password to verify
 * @param hashedPassword - Bcrypt hash to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const user = await db.users.findByEmail('user@example.com');
 * const isValid = await verifyPassword('MyPassword123', user.password);
 *
 * if (isValid) {
 *   // Password is correct, proceed with authentication
 *   const tokens = generateTokens(user);
 * } else {
 *   // Invalid password
 *   throw new UnauthorizedError('Invalid credentials');
 * }
 * ```
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
