#!/usr/bin/env node
/**
 * Development Data Seeder
 *
 * Seeds the database with sample data for development and testing.
 * This script is called by scripts/development/reset-database.sh
 */

const { MongoClient } = require('mongodb');

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/collab_demo';

const log = (message) => {
  console.log(`[SEED] ${message}`);
};

const logError = (message) => {
  console.error(`[SEED ERROR] ${message}`);
};

const logSuccess = (message) => {
  console.log(`[SEED SUCCESS] ${message}`);
};

async function seedDevelopmentData() {
  log('Starting development data seeding...');

  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(MONGO_URL);
    await client.connect();
    log('Connected to MongoDB');

    const db = client.db();

    // Sample users for development
    const sampleUsers = [
      {
        email: 'demo@example.com',
        // Password: 'demo123' (hashed with bcrypt)
        password:
          '$2b$10$rZTJCJl7iU8GJfyq7gK8dOmGMDw8D5CYzH9LRQy8nCx6wTp2VgA2K',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'editor@example.com',
        password:
          '$2b$10$rZTJCJl7iU8GJfyq7gK8dOmGMDw8D5CYzH9LRQy8nCx6wTp2VgA2K',
        role: 'editor',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'viewer@example.com',
        password:
          '$2b$10$rZTJCJl7iU8GJfyq7gK8dOmGMDw8D5CYzH9LRQy8nCx6wTp2VgA2K',
        role: 'viewer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert users if users collection doesn't exist or is empty
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();

    if (userCount === 0) {
      await usersCollection.insertMany(sampleUsers);
      logSuccess(`Inserted ${sampleUsers.length} sample users`);
    } else {
      log(
        `Users collection already has ${userCount} documents, skipping user seeding`,
      );
    }

    // Sample documents for development
    const sampleDocuments = [
      {
        d: 'sample-doc-1',
        create: {
          data: {
            id: 'sample-doc-1',
            title: 'Welcome to Collaborative Editing',
            content:
              'This is a sample document to demonstrate real-time collaborative editing. Try opening this document in multiple browser tabs and editing simultaneously!',
            acl: {
              owner: 'demo@example.com',
              editors: ['editor@example.com'],
              viewers: ['viewer@example.com'],
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
      {
        d: 'sample-doc-2',
        create: {
          data: {
            id: 'sample-doc-2',
            title: 'DevX Best Practices',
            content:
              'This document contains notes about developer experience improvements:\n\n- Safe script execution with timeouts\n- Organized project structure\n- Comprehensive documentation\n- Unified command interface',
            acl: {
              owner: 'demo@example.com',
              editors: [],
              viewers: ['editor@example.com', 'viewer@example.com'],
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    ];

    // Insert documents using ShareDB structure
    const documentsCollection = db.collection('o_documents');
    const docCount = await documentsCollection.countDocuments();

    if (docCount === 0) {
      await documentsCollection.insertMany(sampleDocuments);
      logSuccess(`Inserted ${sampleDocuments.length} sample documents`);
    } else {
      log(
        `Documents collection already has ${docCount} documents, skipping document seeding`,
      );
    }

    logSuccess('Development data seeding completed successfully!');
  } catch (error) {
    logError(`Seeding failed: ${error.message}`);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      log('Disconnected from MongoDB');
    }
  }
}

// Run the seeder if called directly
if (require.main === module) {
  seedDevelopmentData()
    .then(() => {
      log('Seeding script completed');
      process.exit(0);
    })
    .catch((error) => {
      logError(`Seeding script failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { seedDevelopmentData };
