#!/bin/bash

# Test runner script that disables rate limiting
# Sets NODE_ENV=test to disable rate limiting during testing

echo "🧪 Running tests with rate limiting disabled..."
echo "📦 Setting NODE_ENV=test"

# Set test environment
export NODE_ENV=test

# Run the user workflow tests
echo "🚀 Starting user acceptance tests..."
cd apps/server || exit
node test-user-workflows.js

echo "✅ Test completed"
