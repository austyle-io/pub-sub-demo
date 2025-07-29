#!/usr/bin/env node --experimental-strip-types

import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { handleError, setupGracefulShutdown } from './utilities/cli-utils.ts';
import { logger } from './utilities/logger.ts';

export async function generateSecret(): Promise<string> {
  return randomBytes(32).toString('base64');
}

export async function updateEnvFile(
  filePath: string,
  key: string,
  value: string,
): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const regex = new RegExp(`^${key}=.*$`, 'gm');
  const newContent = content.replace(regex, `${key}=${value}`);
  await fs.writeFile(filePath, newContent);
}

export async function setupEnvironment(): Promise<void> {
  logger.info('Setting up environment variables...');

  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  // Check if .env file exists, create from example if not
  if (!existsSync(envPath)) {
    if (!existsSync(envExamplePath)) {
      throw new Error('.env.example file not found');
    }
    logger.info('Creating .env file from .env.example...');
    await fs.copyFile(envExamplePath, envPath);
  }

  logger.info('Generating strong JWT secrets...');

  // Generate random secrets
  const accessSecret = await generateSecret();
  const refreshSecret = await generateSecret();

  // Update .env file
  await updateEnvFile(envPath, 'JWT_ACCESS_SECRET', accessSecret);
  await updateEnvFile(envPath, 'JWT_REFRESH_SECRET', refreshSecret);

  logger.info('✅ Environment setup complete!');
  logger.info('You may want to update MONGO_URL in .env if needed.');
}

// Main execution
export async function main(): Promise<void> {
  setupGracefulShutdown();

  try {
    await setupEnvironment();
  } catch (error) {
    await handleError(error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
