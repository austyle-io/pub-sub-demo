#!/bin/sh
set -e

# Remove any existing node_modules to avoid platform conflicts
echo "Cleaning up node_modules..."
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Run the dev command
echo "Starting development server..."
exec "$@"
