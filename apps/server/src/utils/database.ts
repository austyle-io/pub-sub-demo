import type { User } from '@collab-edit/shared';
import { type Collection, type Db, MongoClient } from 'mongodb';
import { dbLogger } from '../services/logger';

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * @summary Connects to the MongoDB database.
 * @remarks
 * This function establishes a connection to the MongoDB database using the URL
 * from the environment variables. It also creates necessary indexes.
 * @returns A promise that resolves to the database instance.
 * @since 1.0.0
 */
export const connectToDatabase = async (): Promise<Db> => {
  if (db) return db;

  const mongoUrl =
    process.env['MONGO_URL'] ?? 'mongodb://localhost:27017/collab_demo';
  dbLogger.info('Attempting to connect to MongoDB', {
    mongoUrl: mongoUrl.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
  });

  try {
    client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db();

    dbLogger.info('Successfully connected to MongoDB');

    // Create indexes
    const users = db.collection<User>('users');
    await users.createIndex({ email: 1 }, { unique: true });

    return db;
  } catch (error) {
    dbLogger.error('Failed to connect to MongoDB', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

/**
 * @summary Closes the database connection.
 * @since 1.0.0
 */
export const closeDatabaseConnection = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};

/**
 * @summary Disconnects from the database.
 * @remarks This is an alias for `closeDatabaseConnection`.
 * @since 1.0.0
 */
export const disconnectFromDatabase = async (): Promise<void> => {
  return closeDatabaseConnection();
};

/**
 * @summary Gets the users collection from the database.
 * @returns The users collection.
 * @throws {Error} If the database is not connected.
 * @since 1.0.0
 */
export const getUsersCollection = (): Collection<User> => {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db.collection<User>('users');
};

/**
 * @summary Gets the database instance.
 * @returns The database instance.
 * @throws {Error} If the database is not connected.
 * @since 1.0.0
 */
export const getDatabase = (): Db => {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
};
