#!/usr/bin/env node

/**
 * Test script to verify rate limiting is disabled in test environment
 */

console.log('🧪 Testing rate limiting fix...');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

// Make multiple rapid auth requests to test rate limiting
async function testRateLimiting() {
  const baseUrl = 'http://localhost:3001/api';
  let successCount = 0;
  let rateLimitedCount = 0;

  console.log('Making 10 rapid auth requests...');

  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${Date.now()}_${i}@example.com`,
          password: 'TestPassword123',
          role: 'editor',
        }),
      })
        .then(async (response) => {
          const text = await response.text();

          if (response.status === 429) {
            rateLimitedCount++;
            console.log(`❌ Request ${i}: Rate limited (429)`);
            return { status: 429, body: text };
          } else if (response.status === 201) {
            successCount++;
            console.log(`✅ Request ${i}: Success (201)`);
            return { status: 201, body: text };
          } else {
            console.log(`⚠️  Request ${i}: Status ${response.status}`);
            return { status: response.status, body: text };
          }
        })
        .catch((error) => {
          console.log(`💥 Request ${i}: Error - ${error.message}`);
          return { error: error.message };
        }),
    );
  }

  await Promise.all(promises);

  console.log('\n📊 Results:');
  console.log(`✅ Successful requests: ${successCount}`);
  console.log(`❌ Rate limited requests: ${rateLimitedCount}`);
  console.log(`📝 Total requests: 10`);

  if (process.env.NODE_ENV === 'test' && rateLimitedCount > 0) {
    console.log(
      '\n🚨 ISSUE: Rate limiting is still active in test environment!',
    );
    process.exit(1);
  } else if (process.env.NODE_ENV !== 'test' && rateLimitedCount === 0) {
    console.log(
      '\n⚠️  WARNING: Rate limiting should be active in non-test environments',
    );
  } else {
    console.log('\n🎉 Rate limiting behavior is correct!');
  }
}

testRateLimiting().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
