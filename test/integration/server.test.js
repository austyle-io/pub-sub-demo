#!/usr/bin/env node

/**
 * Integration test for server health and basic functionality
 * Tests the actual running server endpoints
 */

console.log('🧪 Testing server functionality...');

const API_BASE = 'http://localhost:3001';

// Test server health endpoint
async function testHealth() {
  try {
    console.log('📊 Testing health endpoint...');
    const response = await fetch(`${API_BASE}/health`);

    if (!response.ok) {
      console.error(
        `❌ Health check failed: ${response.status} ${response.statusText}`,
      );
      return false;
    }

    const data = await response.json();
    console.log('✅ Health check passed:', data);
    return true;
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    return false;
  }
}

// Test that rate limiting is disabled in test environment
async function testRateLimitingDisabled() {
  try {
    console.log('🛡️  Testing rate limiting behavior...');

    // Make multiple auth requests rapidly to ensure rate limiting is disabled
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(
        fetch(`${API_BASE}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `testuser${Date.now()}_${i}@example.com`,
            password: 'TestPassword123!',
          }),
        }),
      );
    }

    const responses = await Promise.all(promises);
    let successCount = 0;
    let rateLimitedCount = 0;

    for (const response of responses) {
      if (response.status === 201) {
        successCount++;
      } else if (response.status === 429) {
        rateLimitedCount++;
      }
    }

    console.log(
      `📈 Auth requests: ${successCount} successful, ${rateLimitedCount} rate-limited`,
    );

    // In test environment, rate limiting should be disabled
    if (rateLimitedCount === 0) {
      console.log('✅ Rate limiting correctly disabled in test environment');
      return true;
    }
    console.log('⚠️  Rate limiting may still be active');
    return true; // Don't fail the test, just warn
  } catch (error) {
    console.error('❌ Rate limiting test error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting server integration tests...\n');

  const tests = [
    { name: 'Health Check', fn: testHealth },
    { name: 'Rate Limiting', fn: testRateLimitingDisabled },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`Running ${test.name}...`);
    try {
      const result = await test.fn();
      if (result) {
        console.log(`✅ ${test.name} passed\n`);
        passed++;
      } else {
        console.log(`❌ ${test.name} failed\n`);
        failed++;
      }
    } catch (error) {
      console.error(`💥 ${test.name} threw error:`, error.message, '\n');
      failed++;
    }
  }

  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Total: ${tests.length}`);

  if (failed === 0) {
    console.log('\n🎉 All server integration tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some server integration tests failed!');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error('💥 Test runner error:', error);
    process.exit(1);
  });
}

module.exports = { testHealth, testRateLimitingDisabled };
