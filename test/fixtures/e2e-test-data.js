/**
 * Enhanced test fixtures for E2E testing
 * Provides comprehensive test data for collaborative document editing
 */

const { MongoClient, ObjectId } = require('mongodb');

// Test user credentials (all use password: 'test123')
const TEST_PASSWORD_HASH =
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewtsOKKiLx.3XsHS';

/**
 * Test Users for E2E testing
 */
const TEST_USERS = [
  {
    _id: new ObjectId('507f1f77bcf86cd799439011'),
    email: 'alice@example.com',
    name: 'Alice Cooper',
    passwordHash: TEST_PASSWORD_HASH,
    role: 'user',
    profile: {
      avatar: null,
      preferences: {
        theme: 'light',
        notifications: true,
      },
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    _id: new ObjectId('507f1f77bcf86cd799439012'),
    email: 'bob@example.com',
    name: 'Bob Smith',
    passwordHash: TEST_PASSWORD_HASH,
    role: 'user',
    profile: {
      avatar: null,
      preferences: {
        theme: 'dark',
        notifications: false,
      },
    },
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
  },
  {
    _id: new ObjectId('507f1f77bcf86cd799439013'),
    email: 'charlie@example.com',
    name: 'Charlie Brown',
    passwordHash: TEST_PASSWORD_HASH,
    role: 'user',
    profile: {
      avatar: null,
      preferences: {
        theme: 'light',
        notifications: true,
      },
    },
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-03T00:00:00Z'),
  },
  {
    _id: new ObjectId('507f1f77bcf86cd799439014'),
    email: 'admin@example.com',
    name: 'Admin User',
    passwordHash: TEST_PASSWORD_HASH,
    role: 'admin',
    profile: {
      avatar: null,
      preferences: {
        theme: 'dark',
        notifications: true,
      },
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
];

/**
 * Test Documents for collaboration testing
 */
const TEST_DOCUMENTS = [
  {
    _id: new ObjectId('607f1f77bcf86cd799439021'),
    title: 'Welcome Document',
    content:
      'Welcome to our collaborative editing platform! This document demonstrates real-time collaboration features.',
    version: 1,
    createdBy: new ObjectId('507f1f77bcf86cd799439011'), // Alice
    permissions: {
      owner: new ObjectId('507f1f77bcf86cd799439011'),
      users: [
        {
          userId: new ObjectId('507f1f77bcf86cd799439011'),
          permission: 'owner',
          grantedAt: new Date('2024-01-01T00:00:00Z'),
          grantedBy: new ObjectId('507f1f77bcf86cd799439011'),
        },
        {
          userId: new ObjectId('507f1f77bcf86cd799439012'),
          permission: 'editor',
          grantedAt: new Date('2024-01-01T01:00:00Z'),
          grantedBy: new ObjectId('507f1f77bcf86cd799439011'),
        },
      ],
      public: false,
      publicPermission: null,
    },
    metadata: {
      tags: ['welcome', 'demo'],
      category: 'documentation',
      language: 'en',
    },
    stats: {
      viewCount: 15,
      editCount: 8,
      collaboratorCount: 2,
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
  },
  {
    _id: new ObjectId('607f1f77bcf86cd799439022'),
    title: 'Team Meeting Notes',
    content: `# Team Meeting - January 15, 2024

## Attendees
- Alice Cooper
- Bob Smith
- Charlie Brown

## Agenda
1. Project updates
2. Sprint planning
3. Technical discussions

## Action Items
- [ ] Update documentation
- [ ] Code review process
- [ ] Testing improvements`,
    version: 12,
    createdBy: new ObjectId('507f1f77bcf86cd799439012'), // Bob
    permissions: {
      owner: new ObjectId('507f1f77bcf86cd799439012'),
      users: [
        {
          userId: new ObjectId('507f1f77bcf86cd799439012'),
          permission: 'owner',
          grantedAt: new Date('2024-01-10T00:00:00Z'),
          grantedBy: new ObjectId('507f1f77bcf86cd799439012'),
        },
        {
          userId: new ObjectId('507f1f77bcf86cd799439011'),
          permission: 'editor',
          grantedAt: new Date('2024-01-10T01:00:00Z'),
          grantedBy: new ObjectId('507f1f77bcf86cd799439012'),
        },
        {
          userId: new ObjectId('507f1f77bcf86cd799439013'),
          permission: 'editor',
          grantedAt: new Date('2024-01-10T02:00:00Z'),
          grantedBy: new ObjectId('507f1f77bcf86cd799439012'),
        },
      ],
      public: false,
      publicPermission: null,
    },
    metadata: {
      tags: ['meeting', 'notes', 'team'],
      category: 'meeting-notes',
      language: 'en',
    },
    stats: {
      viewCount: 45,
      editCount: 23,
      collaboratorCount: 3,
    },
    createdAt: new Date('2024-01-10T00:00:00Z'),
    updatedAt: new Date('2024-01-15T14:22:00Z'),
  },
  {
    _id: new ObjectId('607f1f77bcf86cd799439023'),
    title: 'Public Knowledge Base',
    content: `# Knowledge Base

This is a public document that demonstrates public sharing capabilities.

## Topics
- Getting Started
- Best Practices
- Common Issues
- FAQ

Feel free to contribute!`,
    version: 5,
    createdBy: new ObjectId('507f1f77bcf86cd799439013'), // Charlie
    permissions: {
      owner: new ObjectId('507f1f77bcf86cd799439013'),
      users: [
        {
          userId: new ObjectId('507f1f77bcf86cd799439013'),
          permission: 'owner',
          grantedAt: new Date('2024-01-05T00:00:00Z'),
          grantedBy: new ObjectId('507f1f77bcf86cd799439013'),
        },
      ],
      public: true,
      publicPermission: 'read',
    },
    metadata: {
      tags: ['knowledge', 'public', 'help'],
      category: 'knowledge-base',
      language: 'en',
    },
    stats: {
      viewCount: 120,
      editCount: 8,
      collaboratorCount: 1,
    },
    createdAt: new Date('2024-01-05T00:00:00Z'),
    updatedAt: new Date('2024-01-12T09:15:00Z'),
  },
  {
    _id: new ObjectId('607f1f77bcf86cd799439024'),
    title: 'Private Draft',
    content: 'This is a private document for testing private access controls.',
    version: 1,
    createdBy: new ObjectId('507f1f77bcf86cd799439011'), // Alice
    permissions: {
      owner: new ObjectId('507f1f77bcf86cd799439011'),
      users: [
        {
          userId: new ObjectId('507f1f77bcf86cd799439011'),
          permission: 'owner',
          grantedAt: new Date('2024-01-14T00:00:00Z'),
          grantedBy: new ObjectId('507f1f77bcf86cd799439011'),
        },
      ],
      public: false,
      publicPermission: null,
    },
    metadata: {
      tags: ['private', 'draft'],
      category: 'personal',
      language: 'en',
    },
    stats: {
      viewCount: 3,
      editCount: 1,
      collaboratorCount: 1,
    },
    createdAt: new Date('2024-01-14T00:00:00Z'),
    updatedAt: new Date('2024-01-14T00:00:00Z'),
  },
];

/**
 * Test document versions for revision history testing
 */
const TEST_DOCUMENT_VERSIONS = [
  {
    _id: new ObjectId('707f1f77bcf86cd799439031'),
    documentId: new ObjectId('607f1f77bcf86cd799439021'),
    version: 1,
    content: 'Welcome to our platform!',
    changes: [
      { op: 'retain', n: 0 },
      { op: 'insert', s: 'Welcome to our platform!' },
    ],
    createdBy: new ObjectId('507f1f77bcf86cd799439011'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    _id: new ObjectId('707f1f77bcf86cd799439032'),
    documentId: new ObjectId('607f1f77bcf86cd799439021'),
    version: 2,
    content: 'Welcome to our collaborative editing platform!',
    changes: [
      { op: 'retain', n: 18 },
      { op: 'insert', s: ' collaborative editing' },
      { op: 'retain', n: 9 },
    ],
    createdBy: new ObjectId('507f1f77bcf86cd799439012'),
    createdAt: new Date('2024-01-01T01:00:00Z'),
  },
];

/**
 * Test sessions for authentication testing
 */
const TEST_SESSIONS = [
  {
    _id: 'session_alice_1',
    userId: new ObjectId('507f1f77bcf86cd799439011'),
    token: 'mock_refresh_token_alice',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    userAgent: 'PlaywrightE2E/1.0 CollaborativeEditing',
    ipAddress: '127.0.0.1',
    createdAt: new Date(),
    lastUsedAt: new Date(),
  },
  {
    _id: 'session_bob_1',
    userId: new ObjectId('507f1f77bcf86cd799439012'),
    token: 'mock_refresh_token_bob',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    userAgent: 'PlaywrightE2E/1.0 CollaborativeEditing',
    ipAddress: '127.0.0.1',
    createdAt: new Date(),
    lastUsedAt: new Date(),
  },
];

/**
 * Setup test database with all fixtures
 */
async function setupE2EDatabase(mongoUrl) {
  console.log('📊 Setting up E2E test database...');

  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    const db = client.db();

    // Clear existing collections
    const collections = [
      'users',
      'documents',
      'document_versions',
      'sessions',
      'document_ops',
    ];
    for (const collection of collections) {
      try {
        await db.collection(collection).deleteMany({});
      } catch (_error) {
        // Collection might not exist, ignore error
      }
    }

    // Insert test data
    await db.collection('users').insertMany(TEST_USERS);
    await db.collection('documents').insertMany(TEST_DOCUMENTS);
    await db.collection('document_versions').insertMany(TEST_DOCUMENT_VERSIONS);
    await db.collection('sessions').insertMany(TEST_SESSIONS);

    // Create indexes for better performance
    await createTestIndexes(db);

    console.log('✅ E2E test database setup completed');
    console.log(`   - ${TEST_USERS.length} test users created`);
    console.log(`   - ${TEST_DOCUMENTS.length} test documents created`);
    console.log(
      `   - ${TEST_DOCUMENT_VERSIONS.length} document versions created`,
    );
    console.log(`   - ${TEST_SESSIONS.length} test sessions created`);

    return {
      users: TEST_USERS,
      documents: TEST_DOCUMENTS,
      versions: TEST_DOCUMENT_VERSIONS,
      sessions: TEST_SESSIONS,
    };
  } finally {
    await client.close();
  }
}

/**
 * Create database indexes for test performance
 */
async function createTestIndexes(db) {
  // User indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ role: 1 });

  // Document indexes
  await db.collection('documents').createIndex({ createdBy: 1 });
  await db
    .collection('documents')
    .createIndex({ 'permissions.users.userId': 1 });
  await db.collection('documents').createIndex({ 'permissions.public': 1 });
  await db.collection('documents').createIndex({ createdAt: -1 });
  await db.collection('documents').createIndex({ updatedAt: -1 });
  await db
    .collection('documents')
    .createIndex({ title: 'text', content: 'text' });

  // Document version indexes
  await db
    .collection('document_versions')
    .createIndex({ documentId: 1, version: 1 });
  await db.collection('document_versions').createIndex({ createdBy: 1 });

  // Session indexes
  await db.collection('sessions').createIndex({ userId: 1 });
  await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
  await db.collection('sessions').createIndex({ expiresAt: 1 });
}

/**
 * Get test user by email
 */
function getTestUser(email) {
  return TEST_USERS.find((user) => user.email === email);
}

/**
 * Get test document by title
 */
function getTestDocument(title) {
  return TEST_DOCUMENTS.find((doc) => doc.title === title);
}

/**
 * Get documents accessible by user
 */
function getDocumentsForUser(userId) {
  const userObjectId =
    typeof userId === 'string' ? new ObjectId(userId) : userId;

  return TEST_DOCUMENTS.filter((doc) => {
    // Owner access
    if (doc.createdBy.equals(userObjectId)) return true;

    // Explicit user permission
    if (doc.permissions.users.some((u) => u.userId.equals(userObjectId)))
      return true;

    // Public access
    if (doc.permissions.public) return true;

    return false;
  });
}

/**
 * Collaboration test scenarios
 */
const COLLABORATION_SCENARIOS = {
  // Scenario 1: Two users editing simultaneously
  simultaneousEditing: {
    description: 'Two users edit the same document simultaneously',
    users: ['alice@example.com', 'bob@example.com'],
    document: 'Welcome Document',
    actions: [
      {
        user: 'alice@example.com',
        action: 'insert',
        position: 0,
        text: 'UPDATED: ',
      },
      {
        user: 'bob@example.com',
        action: 'insert',
        position: 100,
        text: ' - Bob was here!',
      },
      {
        user: 'alice@example.com',
        action: 'insert',
        position: 50,
        text: ' (Alice editing)',
      },
    ],
  },

  // Scenario 2: Permission testing
  permissionTest: {
    description: 'Test various permission levels',
    scenarios: [
      {
        user: 'alice@example.com',
        document: 'Welcome Document',
        expectedAccess: 'owner',
      },
      {
        user: 'bob@example.com',
        document: 'Welcome Document',
        expectedAccess: 'editor',
      },
      {
        user: 'charlie@example.com',
        document: 'Welcome Document',
        expectedAccess: 'none',
      },
      {
        user: 'alice@example.com',
        document: 'Private Draft',
        expectedAccess: 'owner',
      },
      {
        user: 'bob@example.com',
        document: 'Private Draft',
        expectedAccess: 'none',
      },
    ],
  },

  // Scenario 3: Public document access
  publicAccess: {
    description: 'Test public document access',
    document: 'Public Knowledge Base',
    users: ['alice@example.com', 'bob@example.com', 'charlie@example.com'],
    expectedAccess: 'read',
  },
};

module.exports = {
  TEST_USERS,
  TEST_DOCUMENTS,
  TEST_DOCUMENT_VERSIONS,
  TEST_SESSIONS,
  COLLABORATION_SCENARIOS,
  setupE2EDatabase,
  getTestUser,
  getTestDocument,
  getDocumentsForUser,
  TEST_PASSWORD: 'test123',
};
