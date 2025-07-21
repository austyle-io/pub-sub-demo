#!/usr/bin/env node

/**
 * User Acceptance Test Script
 * Tests critical user workflows for the collaborative editing application
 */

const API_URL = 'http://localhost:3001/api';
let accessToken = '';
let userId = '';
let documentId = '';

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

    // Debug output
    if (result.length === 0) {
      console.log(
        '   DEBUG: Empty result, checking accessToken:',
        !!accessToken,
      );
      console.log('   DEBUG: Result:', JSON.stringify(result));
    } else {
      console.log(
        '   Documents:',
        result.map((d) => ({ id: d.id, title: d.title })),
      );
    }
  } catch (error) {
    console.error('❌ List documents failed:', error.message);
    throw error;
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
    await testUserLogin(userData);
    await testCreateDocument();
    await testGetDocument();
    await testListDocuments();
    await testWebSocketConnection();
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
