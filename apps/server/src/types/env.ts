/**
 * Environment variable validation and type inference
 * This provides both runtime validation and compile-time type safety
 */
import { isObject, isString } from 'lodash';

// Environment variable schema definition
export type Env = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  CLIENT_URL: string;
  MONGO_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRY?: string;
  JWT_REFRESH_EXPIRY?: string;
  BCRYPT_ROUNDS?: string;
  LOG_LEVEL?: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly';
};

// Type guard for required environment variables
const getRequiredEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!isString(value) || value.trim() === '') {
    throw new Error(`Required environment variable ${key} is missing or empty`);
  }
  return value;
};

/**
 * Environment validation function with detailed error messages
 * Validates all required environment variables and returns typed configuration
 */
export function validateEnv(): Env {
  const requiredVars = ['MONGO_URL'];

  // Handle JWT secrets - check for either JWT_SECRET or separate access/refresh secrets
  const jwtSecret = process.env['JWT_SECRET'];
  const jwtAccessSecret = process.env['JWT_ACCESS_SECRET'];
  const jwtRefreshSecret = process.env['JWT_REFRESH_SECRET'];

  let finalAccessSecret: string;
  let finalRefreshSecret: string;

  if (jwtSecret && !jwtAccessSecret && !jwtRefreshSecret) {
    // Development mode: use single JWT_SECRET for both
    finalAccessSecret = jwtSecret;
    finalRefreshSecret = `${jwtSecret}_refresh`;
    console.log(
      '🔑 Using single JWT_SECRET for both access and refresh tokens (development mode)',
    );
  } else if (jwtAccessSecret && jwtRefreshSecret) {
    // Production mode: use separate secrets
    finalAccessSecret = jwtAccessSecret;
    finalRefreshSecret = jwtRefreshSecret;
  } else {
    console.error('❌ JWT configuration error:');
    console.error(
      '  Either provide JWT_SECRET (development) or both JWT_ACCESS_SECRET and JWT_REFRESH_SECRET (production)',
    );
    process.exit(1);
  }

  // Check for missing required variables
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((var_) => console.error(`  - ${var_}`));
    console.error(
      '\nPlease check your .env file and ensure all required variables are set.',
    );
    process.exit(1);
  }

  // Validate JWT secrets are different (if using separate secrets)
  if (
    jwtAccessSecret &&
    jwtRefreshSecret &&
    finalAccessSecret === finalRefreshSecret
  ) {
    console.error(
      '❌ JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different',
    );
    console.error(
      'Use different secrets for access and refresh tokens for security.',
    );
    process.exit(1);
  }

  // Validate secret strength
  const minSecretLength = 32;
  if (finalAccessSecret.length < minSecretLength) {
    console.error(
      `❌ JWT secret must be at least ${minSecretLength} characters`,
    );
    console.error('Generate a strong secret with: openssl rand -base64 32');
    process.exit(1);
  }

  // Validate MongoDB URL format
  const mongoUrl = getRequiredEnvVar('MONGO_URL');
  if (
    !mongoUrl.startsWith('mongodb://') &&
    !mongoUrl.startsWith('mongodb+srv://')
  ) {
    console.error('❌ MONGO_URL must be a valid MongoDB connection string');
    console.error('Example: mongodb://localhost:27017/collab_demo');
    process.exit(1);
  }

  // Validate NODE_ENV with proper typing
  const nodeEnv = process.env['NODE_ENV'];
  if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
    console.error('❌ NODE_ENV must be one of: development, production, test');
    process.exit(1);
  }

  // Safe NODE_ENV validation with type guard
  const validNodeEnv: Env['NODE_ENV'] = (() => {
    if (
      nodeEnv === 'development' ||
      nodeEnv === 'production' ||
      nodeEnv === 'test'
    ) {
      return nodeEnv;
    }
    return 'development';
  })();

  const validatedConfig: Env = {
    JWT_ACCESS_SECRET: finalAccessSecret,
    JWT_REFRESH_SECRET: finalRefreshSecret,
    MONGO_URL: mongoUrl,
    NODE_ENV: validNodeEnv,
    PORT: process.env['PORT'] ?? '3001',
    CLIENT_URL: process.env['CLIENT_URL'] ?? 'http://localhost:3000',
    JWT_EXPIRY: process.env['JWT_EXPIRY'] ?? '15m',
    JWT_REFRESH_EXPIRY: process.env['JWT_REFRESH_EXPIRY'] ?? '7d',
    BCRYPT_ROUNDS: process.env['BCRYPT_ROUNDS'] ?? '12',
    LOG_LEVEL: (process.env['LOG_LEVEL'] as Env['LOG_LEVEL']) ?? 'info',
  };

  // Production security validation
  if (validatedConfig.NODE_ENV === 'production') {
    if (
      validatedConfig.CLIENT_URL &&
      !validatedConfig.CLIENT_URL.startsWith('https://')
    ) {
      console.warn('⚠️  CLIENT_URL should use HTTPS in production');
    }

    const minProdSecretLength = 48;
    if (validatedConfig.JWT_ACCESS_SECRET.length < minProdSecretLength) {
      console.warn(
        `⚠️  Consider using longer JWT secrets (${minProdSecretLength}+ chars) in production`,
      );
    }
  }

  console.log('✅ Environment validation passed');
  console.log(`📦 Environment: ${validatedConfig.NODE_ENV}`);
  console.log(`🚀 Port: ${validatedConfig.PORT}`);
  console.log(`🔗 Client URL: ${validatedConfig.CLIENT_URL}`);

  return validatedConfig;
}

// Type guard function for safe environment access
export function isValidEnv(env: unknown): env is Env {
  if (!isObject(env)) return false;

  const obj = env as Record<string, unknown>;

  return (
    isString(obj['NODE_ENV']) &&
    ['development', 'production', 'test'].includes(obj['NODE_ENV'] as string) &&
    isString(obj['PORT']) &&
    isString(obj['CLIENT_URL']) &&
    isString(obj['MONGO_URL']) &&
    isString(obj['JWT_ACCESS_SECRET']) &&
    isString(obj['JWT_REFRESH_SECRET'])
  );
}
