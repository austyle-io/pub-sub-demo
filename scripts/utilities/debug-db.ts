#!/usr/bin/env node --experimental-strip-types

import { Command } from 'commander';
import { MongoClient } from 'mongodb';
import { z } from 'zod';
import {
  createCommand,
  handleError,
  parseOptions,
  setupGracefulShutdown,
} from './cli-utils.ts';
import { logger } from './logger.ts';

const ConfigSchema = z.object({
  mongoUrl: z.string().default('mongodb://localhost:27017/collab_demo'),
  collection: z.string().default('o_documents'),
  limit: z.number().default(10),
  verbose: z.boolean().default(false),
});

type Config = z.infer<typeof ConfigSchema>;

class DatabaseDebugger {
  private config: Config;
  private client: MongoClient;

  constructor(config: Config) {
    this.config = config;
    this.client = new MongoClient(this.config.mongoUrl);
  }

  async connect(): Promise<void> {
    await this.client.connect();
    logger.info('Connected to MongoDB');
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    logger.info('Disconnected from MongoDB');
  }

  async debugDocuments(): Promise<void> {
    const db = this.client.db();
    const collection = db.collection(this.config.collection);

    // Get total count
    const totalCount = await collection.countDocuments();
    logger.info(`Total documents in ${this.config.collection}: ${totalCount}`);

    if (totalCount === 0) {
      logger.info('No documents found');
      return;
    }

    // Get sample documents
    const docs = await collection.find({}).limit(this.config.limit).toArray();

    logger.info(
      `\nShowing first ${Math.min(docs.length, this.config.limit)} documents:`,
    );
    docs.forEach((doc, index) => {
      logger.info(`\nDocument ${index + 1}:`);
      if (this.config.verbose) {
        logger.info(JSON.stringify(doc, null, 2));
      } else {
        logger.info({
          _id: doc._id,
          d: doc.d,
          type: doc._type,
          version: doc._v,
          data: doc.data ? 'present' : 'missing',
          createData: doc.create?.data ? 'present' : 'missing',
          modified: doc._m?.mtime || 'unknown',
        });
      }
    });

    // Get latest document
    const latestDoc = await collection.findOne(
      {},
      { sort: { '_m.mtime': -1 } },
    );
    if (latestDoc) {
      logger.info('\nLatest modified document:');
      logger.info({
        _id: latestDoc._id,
        d: latestDoc.d,
        modified: latestDoc._m?.mtime || 'unknown',
      });

      if (this.config.verbose) {
        logger.info('Full document:');
        logger.info(JSON.stringify(latestDoc, null, 2));
      }
    }

    // Collection statistics
    const stats = await db.command({ collStats: this.config.collection });
    logger.info('\nCollection statistics:');
    logger.info({
      size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
      avgObjSize: `${stats.avgObjSize} bytes`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
      indexes: stats.nindexes,
    });
  }

  async listCollections(): Promise<void> {
    const db = this.client.db();
    const collections = await db.listCollections().toArray();

    logger.info('\nAvailable collections:');
    collections.forEach((col) => {
      logger.info(`  - ${col.name}`);
    });
  }

  async run(): Promise<void> {
    try {
      await this.connect();

      // List collections if verbose
      if (this.config.verbose) {
        await this.listCollections();
      }

      await this.debugDocuments();
    } finally {
      await this.disconnect();
    }
  }
}

// Main CLI setup
async function main(): Promise<void> {
  setupGracefulShutdown();

  const program = createCommand('debug-db', 'Debug MongoDB database contents')
    .option('-u, --mongo-url <url>', 'MongoDB connection URL')
    .option('-c, --collection <name>', 'Collection to debug', 'o_documents')
    .option('-l, --limit <number>', 'Number of documents to show', '10')
    .action(async (options) => {
      try {
        const config = parseOptions(ConfigSchema, {
          ...options,
          mongoUrl:
            options.mongoUrl ||
            process.env.MONGO_URL ||
            'mongodb://localhost:27017/collab_demo',
          limit: Number.parseInt(options.limit, 10),
          verbose: options.verbose || false,
        });

        const dbDebugger = new DatabaseDebugger(config);
        await dbDebugger.run();
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
