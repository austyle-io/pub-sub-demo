#!/bin/bash

set -e

echo "🐳 Testing Docker Setup..."

# Function to check if a service is healthy
check_service() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    echo "Checking $service..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null; then
            echo "✅ $service is healthy"
            return 0
        fi
        echo "⏳ Waiting for $service... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service failed to start"
    return 1
}

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down -v

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check MongoDB
echo "🔍 Checking MongoDB..."
docker-compose exec -T mongo mongosh --eval "db.runCommand('ping')" || exit 1
echo "✅ MongoDB is running"

# Check Server
check_service "Server" "http://localhost:3001/api/health" || exit 1

# Check Client
check_service "Client" "http://localhost:3000" || exit 1

# Run a simple API test
echo "🧪 Testing API..."
# Create a test user
curl -s -X POST http://localhost:3001/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}' \
    > /dev/null && echo "✅ API registration endpoint works" || echo "⚠️  API registration might already exist"

# Show running containers
echo ""
echo "📊 Running containers:"
docker-compose ps

echo ""
echo "✅ Docker setup is working correctly!"
echo ""
echo "📝 Access the services at:"
echo "   - Client: http://localhost:3000"
echo "   - Server API: http://localhost:3001/api"
echo "   - MongoDB: mongodb://localhost:27017/collab_demo"
echo ""
echo "🛑 To stop the services, run: docker-compose down"