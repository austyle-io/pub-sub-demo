# Docker Development Setup

This project includes Docker configuration for easy development environment setup.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose V2 (included with Docker Desktop)

## Quick Start

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - MongoDB: localhost:27017

3. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f server
   docker-compose logs -f client
   ```

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

## Services

### MongoDB
- Port: 27017
- Database: collab_demo
- Persistent volume for data

### Server
- Port: 3001
- Auto-reloads on code changes
- Environment variables configured for MongoDB connection

### Client
- Port: 3000
- Vite dev server with hot module replacement
- Proxies API requests to server

## Troubleshooting

### Ports already in use
If you get port conflicts, either:
1. Stop the conflicting service, or
2. Change ports in docker-compose.yml

### MongoDB connection issues
Ensure MongoDB container is healthy:
```bash
docker-compose ps
```

### Clean rebuild
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Alternative: Local Development

If you prefer running without Docker:

1. Install MongoDB locally
2. Copy `.env.example` to `.env` and update values
3. Run `pnpm install` in the root
4. Run `pnpm dev` to start both client and server