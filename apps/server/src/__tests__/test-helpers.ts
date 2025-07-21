import type { User } from '@collab-edit/shared';
import { MongoClient } from 'mongodb';

export async function isMongoDbAvailable(): Promise<boolean> {
  const mongoUrl =
    process.env['MONGO_URL'] ?? 'mongodb://localhost:27017/collab_demo';
  const client = new MongoClient(mongoUrl, {
    serverSelectionTimeoutMS: 2000, // 2 second timeout
  });

  try {
    await client.connect();
    const db = client.db();

    // Try to create an index to check if we have write permissions
    const users = db.collection<User>('users');
    await users.createIndex({ email: 1 }, { unique: true });

    await client.close();
    return true;
  } catch (_error) {
    // MongoDB might be running but require auth, or not running at all
    return false;
  }
}
