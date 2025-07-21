import type { User } from '@collab-edit/shared';
import { type Collection, type Db, MongoClient } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  const mongoUrl =
    process.env.MONGO_URL ?? 'mongodb://localhost:27017/collab_demo';
  console.log('Attempting to connect to MongoDB with URL:', mongoUrl);

  try {
    client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db();

    console.log('Connected to MongoDB');

    // Create indexes
    const users = db.collection<User>('users');
    await users.createIndex({ email: 1 }, { unique: true });

    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  return closeDatabaseConnection();
}

export function getUsersCollection(): Collection<User> {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db.collection<User>('users');
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}
