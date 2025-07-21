#!/usr/bin/env node

/**
 * User Acceptance Test Script
 * Tests critical user workflows for the collaborative editing application
 */

const API_URL = 'http://localhost:3001/api';
const MONGO_URL = 'mongodb://localhost:27017/collab_demo';
const { MongoClient } = require('mongodb');
let accessToken = '';
let userId = '';
let documentId = '';

// Helper function to introduce a delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken && !endpoint.includes('/auth/')) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

// Helper function to verify document in MongoDB
async function verifyDocumentInDb(docId) {
  console.log(`\n🔍 Verifying document ${docId} directly in MongoDB`);
  let client;
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db();
    const collection = db.collection('o_documents');
    const doc = await collection.findOne({ d: docId });

    if (doc) {
      console.log('✅ Document found in DB:');
      console.log(JSON.stringify(doc, null, 2));
      return doc;
    } else {
      console.error('❌ Document NOT found in DB.');
      return null;
    }
  } catch (error) {
    console.error('❌ Error verifying document in DB:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Test 1: User Registration

async function testUserRegistration() {
  console.log('\n📝 Test 1: User Registration');

  const timestamp = Date.now();
  const userData = {
    email: `testuser${timestamp}@example.com`,
    password: 'TestPassword123!',
    role: 'editor',
  };

  try {
    const result = await apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    accessToken = result.accessToken;
    userId = result.user.id;

    console.log('✅ User registered successfully');
    console.log(`   Email: ${result.user.email}`);
    console.log(`   Role: ${result.user.role}`);
    console.log(`   Has access token: ${!!result.accessToken}`);

    return userData;
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    throw error;
  }
}

// Test 2: User Login
async function testUserLogin(userData) {
  console.log('\n🔐 Test 2: User Login');

  try {
    const result = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });

    accessToken = result.accessToken;

    console.log('✅ Login successful');
    console.log(`   Has access token: ${!!result.accessToken}`);
    console.log(`   User ID matches: ${result.user.id === userId}`);
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

// Test 3: Create Document
async function testCreateDocument() {
  console.log('\n📄 Test 3: Create Document');

  try {
    const result = await apiCall('/documents', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Collaborative Document',
        content: 'Initial content for testing real-time sync',
      }),
    });

    documentId = result.id;

    console.log('✅ Document created successfully');
    console.log(`   Document ID: ${result.id}`);
    console.log(`   Title: ${result.title}`);
    console.log(`   Owner: ${result.acl.owner === userId}`);

    return result;
  } catch (error) {
    console.error('❌ Document creation failed:', error.message);
    throw error;
  }
}

// Test 4: Get Document
async function testGetDocument() {
  console.log('\n📖 Test 4: Get Document');

  try {
    const result = await apiCall(`/documents/${documentId}`);

    console.log('✅ Document retrieved successfully');
    console.log(`   Title: ${result.title}`);
    console.log(`   Content preview: ${result.content.substring(0, 50)}...`);
    console.log(`   Has ACL: ${!!result.acl}`);
  } catch (error) {
    console.error('❌ Get document failed:', error.message);
    throw error;
  }
}

// Test 5: List Documents
async function testListDocuments() {
  console.log('\n📋 Test 5: List Documents');

  try {
    const result = await apiCall('/documents');

    console.log('✅ Documents listed successfully');
    console.log(`   Total documents: ${result.length}`);
    console.log(
      `   Contains our document: ${result.some((doc) => doc.id === documentId)}`,
    );
    console.log(
      '   Raw API response for List Documents:',
      JSON.stringify(result, null, 2),
    );
  } catch (error) {
    console.error('❌ List documents failed:', error.message);
    throw error;
  }
}

// Test 5.5: Direct MongoDB Query for User Documents
async function testDirectMongoQueryForUserDocuments() {
  console.log('\n🔍 Test 5.5: Direct MongoDB Query for User Documents');
  let client;
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db();
    const collection = db.collection('o_documents');

    const query = {
      $or: [
        { 'create.data.acl.owner': userId },
        { 'create.data.acl.editors': userId },
        { 'create.data.acl.viewers': userId },
      ],
    };

    console.log('   Direct MongoDB Query:', JSON.stringify(query));
    console.log('   User ID for query:', userId);

    const documents = await collection.find(query).toArray();

    console.log(`   Documents found by direct query: ${documents.length}`);
    console.log(
      `   Contains our document: ${documents.some((doc) => doc.d === documentId)}`,
    );
    console.log(
      '   Raw documents from direct query:',
      JSON.stringify(documents, null, 2),
    );
  } catch (error) {
    console.error('❌ Direct MongoDB query failed:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Test 6: WebSocket Connection for Real-time Sync
async function testWebSocketConnection() {
  console.log('\n🔌 Test 6: WebSocket Connection');

  try {
    // Dynamic import for ES module
    const { WebSocket } = await import('ws');
    const ws = new WebSocket(`ws://localhost:3001?token=${accessToken}`);

    return new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log('✅ WebSocket connected successfully');

        // Subscribe to document
        const subscribeMessage = {
          a: 'sub',
          c: 'documents',
          d: documentId,
        };

        ws.send(JSON.stringify(subscribeMessage));

        setTimeout(() => {
          ws.close();
          resolve();
        }, 2000);
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data);
        console.log('   Received message type:', message.a || 'unknown');
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
        reject(error);
      });
    });
  } catch (error) {
    console.error('❌ WebSocket connection failed:', error.message);
    throw error;
  }
}

// Test 7: Update Document Permissions
async function testUpdatePermissions() {
  console.log('\n🔒 Test 7: Update Document Permissions');

  try {
    const result = await apiCall(`/documents/${documentId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({
        viewers: [],
        editors: ['test-editor-id'],
      }),
    });

    console.log('✅ Permissions updated successfully');
    console.log(`   Editors count: ${result.acl.editors.length}`);
  } catch (error) {
    console.error('❌ Update permissions failed:', error.message);
    console.error('   Full error object:', JSON.stringify(error, null, 2));
    throw error;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting User Acceptance Tests');
  console.log('================================');

  try {
    // Run tests in sequence
    const userData = await testUserRegistration();
    await sleep(1000);
    await testUserLogin(userData);
    await sleep(1000);
    await testCreateDocument();
    await sleep(1000);
    await verifyDocumentInDb(documentId);
    await sleep(1000);
    await testGetDocument();
    await sleep(1000);
    await testListDocuments();
    await sleep(1000);
    await testDirectMongoQueryForUserDocuments();
    await sleep(1000);
    await testWebSocketConnection();
    await sleep(1000);
    await testUpdatePermissions();

    console.log('\n✅ All tests passed successfully!');
    console.log('================================');
  } catch (_error) {
    console.log('\n❌ Test suite failed!');
    console.log('================================');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);
