/**
 * Zod-based environment variable validation and type inference
 * This provides both runtime validation and compile-time type safety
 */

import { z } from 'zod';

// Define the environment variable schema using Zod
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().optional().default('3001'),
  CLIENT_URL: z.string().url().optional().default('http://localhost:3000'),
  MONGO_URL: z.string().url('MONGO_URL must be a valid URL'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRY: z.string().optional().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().optional().default('7d'),
  BCRYPT_ROUNDS: z
    .string()
    .regex(/^\d+$/, 'BCRYPT_ROUNDS must be a number')
    .optional()
    .default('12'),
  CORS_ORIGIN: z.string().optional(),
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly'])
    .optional()
    .default('info'),
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters')
    .optional(),
});

// Infer the TypeScript type from the Zod schema
export type Env = z.infer<typeof envSchema>;

// Environment validation function with detailed error messages
export function validateEnv(): Env {
  try {
    const result = envSchema.parse(process.env);

    console.log('✅ Environment validation passed');
    console.log(`📦 Environment: ${result.NODE_ENV}`);
    console.log(`🚀 Port: ${result.PORT}`);

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });

      console.error(
        '\n💡 Please check your .env file and ensure all required variables are set correctly.',
      );
      process.exit(1);
    }

    throw error;
  }
}

// Type guard function for safe environment access
export function isValidEnv(env: unknown): env is Env {
  return envSchema.safeParse(env).success;
}
