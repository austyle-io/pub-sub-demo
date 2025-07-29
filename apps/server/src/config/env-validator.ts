import isString from 'lodash.isstring';

type RequiredEnvVars = {
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  MONGO_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT?: string;
  CLIENT_URL?: string;
};

// Type guard for required environment variables
const getRequiredEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!isString(value) || value.trim() === '') {
    throw new Error(`Required environment variable ${key} is missing or empty`);
  }
  return value;
};

export const validateEnvironment = (): RequiredEnvVars => {
  const requiredVars = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URL'];
  const missing = requiredVars.filter((key) => !process.env[key]);

  // Check for missing variables
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    for (const var_ of missing) {
      console.error(`  - ${var_}`);
    }
    console.error(
      '\nPlease check your .env file and ensure all required variables are set.',
    );
    process.exit(1);
  }

  // Safely get required environment variables
  const accessSecret = getRequiredEnvVar('JWT_ACCESS_SECRET');
  const refreshSecret = getRequiredEnvVar('JWT_REFRESH_SECRET');
  const mongoUrl = getRequiredEnvVar('MONGO_URL');

  // Validate JWT secrets are different
  if (accessSecret === refreshSecret) {
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
  if (accessSecret.length < minSecretLength) {
    console.error(
      `❌ JWT_ACCESS_SECRET must be at least ${minSecretLength} characters`,
    );
    console.error('Generate a strong secret with: openssl rand -base64 32');
    process.exit(1);
  }

  if (refreshSecret.length < minSecretLength) {
    console.error(
      `❌ JWT_REFRESH_SECRET must be at least ${minSecretLength} characters`,
    );
    console.error('Generate a strong secret with: openssl rand -base64 32');
    process.exit(1);
  }

  // Validate MongoDB URL format
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
  const validNodeEnv: RequiredEnvVars['NODE_ENV'] = (() => {
    if (
      nodeEnv === 'development' ||
      nodeEnv === 'production' ||
      nodeEnv === 'test'
    ) {
      return nodeEnv;
    }
    return 'development';
  })();

  const validatedConfig: RequiredEnvVars = {
    JWT_ACCESS_SECRET: accessSecret,
    JWT_REFRESH_SECRET: refreshSecret,
    MONGO_URL: mongoUrl,
    NODE_ENV: validNodeEnv,
    PORT: process.env['PORT'] ?? undefined,
    CLIENT_URL: process.env['CLIENT_URL'] ?? undefined,
  };

  const validateProductionSecurity = (config: RequiredEnvVars): void => {
    if (config.NODE_ENV === 'production') {
      // Ensure HTTPS in production
      if (config.CLIENT_URL && !config.CLIENT_URL.startsWith('https://')) {
        console.warn('⚠️  CLIENT_URL should use HTTPS in production');
      }

      // Ensure stronger secrets in production
      const minProdSecretLength = 48;
      if (config.JWT_ACCESS_SECRET.length < minProdSecretLength) {
        console.error(
          `❌ JWT secrets should be at least ${minProdSecretLength} characters in production`,
        );
        process.exit(1);
      }

      console.log(' Production security checks passed');
    }
  };

  validateProductionSecurity(validatedConfig);

  console.log('✅ Environment validation passed');
  console.log(` Environment: ${nodeEnv ?? 'development'}`);
  console.log(` MongoDB: ${mongoUrl.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials

  return validatedConfig;
};

export type Config = RequiredEnvVars;
