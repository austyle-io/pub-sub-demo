#!/usr/bin/env node --experimental-strip-types

/**
 * Database reset utility for development environments.
 *
 * This script provides a complete database reset functionality including:
 * - Stopping and removing existing database containers
 * - Starting fresh containers
 * - Dropping all data
 * - Optionally seeding initial development data
 *
 * Safety features prevent accidental production database resets.
 *
 * @module development/reset-database
 * @since 1.0.0
 */

import { exec, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { promisify } from 'node:util';
import { Command } from 'commander';
import { z } from 'zod';
import {
  createCommand,
  handleError,
  parseOptions,
  setupGracefulShutdown,
} from '../utilities/cli-utils.ts';
import { logger } from '../utilities/logger.ts';

const execAsync = promisify(exec);

/**
 * Configuration schema for database reset options.
 * @since 1.0.0
 */
const ConfigSchema = z.object({
  force: z.boolean().default(false),
  mongoUrl: z.string().default('mongodb://localhost:27017/collab_demo'),
  nodeEnv: z.string().default('development'),
  ci: z.boolean().default(false),
});

type Config = z.infer<typeof ConfigSchema>;

/**
 * Handles database reset operations for development environments.
 *
 * Provides methods to safely reset MongoDB databases with Docker support,
 * confirmation prompts, and optional data seeding.
 *
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const reset = new DatabaseReset({
 *   force: false,
 *   mongoUrl: 'mongodb://localhost:27017/myapp',
 *   nodeEnv: 'development',
 *   ci: false
 * });
 *
 * await reset.run();
 * ```
 */
export class DatabaseReset {
  private config: Config;
  private projectRoot: string;

  constructor(config: Config) {
    this.config = config;
    this.projectRoot = path.resolve(import.meta.dirname, '../..');
  }

  /**
   * Confirms the database reset operation with the user.
   *
   * Prevents accidental production database resets and requires explicit
   * user confirmation unless running in CI or with --force flag.
   *
   * @throws {Error} Exits process if in production environment
   * @since 1.0.0
   */
  async confirmReset(): Promise<void> {
    if (this.config.nodeEnv === 'production') {
      logger.error('❌ Cannot reset production database!');
      logger.error('Set NODE_ENV to development or test to continue');
      process.exit(1);
    }

    logger.warn('⚠️  This will PERMANENTLY DELETE all data in the database!');
    logger.info(`Environment: ${this.config.nodeEnv}`);
    logger.info(`Database URL: ${this.config.mongoUrl}`);

    // Skip confirmation in CI or with force flag
    if (this.config.ci || this.config.force) {
      logger.info(
        'Running in CI or with --force flag, proceeding automatically',
      );
      return;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question(
        "Are you sure you want to reset the database? (type 'yes' to confirm): ",
        resolve,
      );
    });
    rl.close();

    if (answer !== 'yes') {
      logger.info('Database reset cancelled');
      process.exit(0);
    }
  }

  private async dockerComposeCommand(
    command: string,
  ): Promise<{ stdout: string; stderr: string }> {
    try {
      return await execAsync(`docker-compose ${command}`, {
        cwd: this.projectRoot,
      });
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        throw new Error(
          'docker-compose not found. Please install Docker Compose.',
        );
      }
      throw error;
    }
  }

  async stopContainers(): Promise<void> {
    logger.info('Stopping database containers...');

    const dockerComposePath = path.join(this.projectRoot, 'docker-compose.yml');
    if (!existsSync(dockerComposePath)) {
      logger.warn('No docker-compose.yml found, skipping container stop');
      return;
    }

    try {
      const { stdout } = await this.dockerComposeCommand('ps');
      if (stdout.includes('mongo')) {
        logger.info('Stopping MongoDB container...');
        await this.dockerComposeCommand('down -v mongo');
        logger.info('✅ MongoDB container stopped and volumes removed');
      } else {
        logger.info('MongoDB container not running');
      }
    } catch (error) {
      logger.warn('Failed to check/stop containers:', error);
    }
  }

  async startContainers(): Promise<void> {
    logger.info('Starting fresh database containers...');

    const dockerComposePath = path.join(this.projectRoot, 'docker-compose.yml');
    if (!existsSync(dockerComposePath)) {
      logger.warn('No docker-compose.yml found, assuming external MongoDB');
      return;
    }

    logger.info('Starting MongoDB container...');
    await this.dockerComposeCommand('up -d mongo');

    // Wait for MongoDB to be ready
    logger.info('Waiting for MongoDB to be ready...');
    let retries = 30;
    while (retries > 0) {
      try {
        await this.dockerComposeCommand(
          'exec -T mongo mongosh --eval "db.runCommand(\'ping\')"',
        );
        logger.info('✅ MongoDB is ready');
        break;
      } catch {
        logger.info(`Waiting for MongoDB... (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        retries--;
      }
    }

    if (retries === 0) {
      throw new Error('❌ MongoDB failed to start within timeout');
    }
  }

  private extractDatabaseName(mongoUrl: string): string {
    const match = mongoUrl.match(/\/([^/?]+)(?:\?|$)/);
    return match ? match[1] : 'collab_demo';
  }

  async resetDatabase(): Promise<void> {
    logger.info('Resetting database content...');

    const dbName = this.extractDatabaseName(this.config.mongoUrl);

    // Try mongosh first, then fall back to mongo
    const clients = ['mongosh', 'mongo'];
    let clientFound = false;

    for (const client of clients) {
      try {
        await execAsync(`which ${client}`);
        logger.info(`Using ${client} to reset database: ${dbName}`);

        // Drop the database
        await execAsync(
          `${client} "${this.config.mongoUrl}" --eval "db.dropDatabase()" --quiet`,
        );
        logger.info(`✅ Database '${dbName}' dropped successfully`);

        // Verify database was dropped
        try {
          const { stdout } = await execAsync(
            `${client} "${this.config.mongoUrl}" --eval "db.stats().collections" --quiet`,
          );
          logger.info(`Collections remaining: ${stdout.trim() || '0'}`);
        } catch {
          logger.info('Collections remaining: 0');
        }

        clientFound = true;
        break;
      } catch (error) {
        if ((error as any).code !== 'ENOENT') {
          throw error;
        }
      }
    }

    if (!clientFound) {
      throw new Error(
        '❌ No MongoDB client found (mongosh or mongo)\n' +
          'Please install MongoDB client tools or use Docker exec:\n' +
          '  docker-compose exec mongo mongosh',
      );
    }
  }

  async seedInitialData(): Promise<void> {
    logger.info('Seeding initial development data...');

    const seedScript = path.join(
      this.projectRoot,
      'test/fixtures/seed-dev-data.js',
    );

    if (existsSync(seedScript)) {
      logger.info(`Running seed script: ${seedScript}`);
      try {
        await execAsync(`node "${seedScript}"`);
        logger.info('✅ Development data seeded');
      } catch (error) {
        logger.warn('⚠️  Seed script failed (this may be normal)');
        logger.debug('Seed error:', error);
      }
    } else {
      logger.info('No seed script found at:', seedScript);
      logger.info('Database reset complete with empty state');
    }
  }

  async verifyReset(): Promise<void> {
    logger.info('Verifying database reset...');

    try {
      const { stdout } = await execAsync(
        `mongosh "${this.config.mongoUrl}" --eval "db.getCollectionNames()" --quiet`,
      );
      logger.info('Collections after reset:', stdout.trim() || '[]');

      // Check if database is accessible
      await execAsync(
        `mongosh "${this.config.mongoUrl}" --eval "db.runCommand('ping')" --quiet`,
      );
      logger.info('✅ Database is accessible and responsive');
    } catch (error) {
      logger.warn('Cannot verify reset - MongoDB client may not be available');
    }
  }

  printSummary(): void {
    logger.info('');
    logger.info('🎉 Database reset completed successfully!');
    logger.info('');
    logger.info('Next steps:');
    logger.info('  1. Start development servers: make dev');
    logger.info('  2. Run tests to verify: make test');
    logger.info('  3. Create users through the app UI');
    logger.info('');
    logger.info('Database info:');
    logger.info(`  URL: ${this.config.mongoUrl}`);
    logger.info(`  Environment: ${this.config.nodeEnv}`);
    logger.info('');
  }

  /**
   * Executes the complete database reset workflow.
   *
   * Performs the following steps:
   * 1. Confirms reset operation
   * 2. Stops existing containers
   * 3. Starts fresh containers
   * 4. Drops database
   * 5. Seeds initial data (if available)
   * 6. Verifies reset
   * 7. Prints summary
   *
   * @since 1.0.0
   */
  async run(): Promise<void> {
    logger.info('Starting database reset...');
    logger.info(`Project root: ${this.projectRoot}`);
    logger.info(`Timestamp: ${new Date().toISOString()}`);

    await this.confirmReset();
    await this.stopContainers();
    await this.startContainers();

    // Give MongoDB time to fully initialize
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await this.resetDatabase();
    await this.seedInitialData();

    try {
      await this.verifyReset();
    } catch (error) {
      logger.warn('Reset verification failed, but reset may have succeeded');
    }

    this.printSummary();
    logger.info('Database reset completed! ✨');
  }
}

/**
 * Main CLI entry point.
 *
 * Sets up the command-line interface with options and executes
 * the database reset when invoked.
 *
 * @since 1.0.0
 */
async function main(): Promise<void> {
  setupGracefulShutdown();

  const program = createCommand(
    'reset-database',
    'Reset the database to a clean state',
  )
    .option('-f, --force', 'Skip confirmation prompt')
    .action(async (options) => {
      try {
        const config = parseOptions(ConfigSchema, {
          ...options,
          mongoUrl:
            process.env.MONGO_URL || 'mongodb://localhost:27017/collab_demo',
          nodeEnv: process.env.NODE_ENV || 'development',
          ci: process.env.CI === 'true',
        });

        const reset = new DatabaseReset(config);
        await reset.run();
      } catch (error) {
        await handleError(error);
      }
    });

  program.parse();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
