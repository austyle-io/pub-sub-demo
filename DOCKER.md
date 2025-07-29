# Docker Setup Guide

This project is fully dockerized for both development and production environments.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 24+ (for local development without Docker)

## Quick Start

### Development Environment

```bash
# Start all services in development mode
docker-compose up

# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

### Production Environment

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up --build

# Start in background
docker-compose -f docker-compose.prod.yml up -d --build

# Stop production services
docker-compose -f docker-compose.prod.yml down
```

## Architecture

### Development Setup

The development environment uses volume mounts for hot reloading:
- **Client**: http://localhost:3000 (Vite dev server)
- **Server**: http://localhost:3001 (Node.js with nodemon)
- **MongoDB**: mongodb://localhost:27017/collab_demo

### Production Setup

The production environment uses optimized multi-stage builds:
- **Client**: http://localhost:3003 (Nginx static server)
- **Server**: http://localhost:3002 (Node.js production server)
- **MongoDB**: mongodb://localhost:27018/collab_demo_prod

## Services

### MongoDB
- Image: `mongo:5.0`
- Persistent volume for data storage
- Health checks enabled
- Auto-restart on failure

### Server (Backend)
- Node.js 24 Alpine Linux
- Includes build tools for native dependencies (bcrypt)
- JWT authentication configured
- WebSocket support for real-time collaboration
- Health endpoint at `/health`

### Client (Frontend)
- Development: Vite dev server with hot module replacement
- Production: Nginx serving optimized static files
- Proxy configuration for API requests
- Single-page application routing support

### Tools Container
- Available for running scripts and maintenance tasks
- Access with: `docker-compose --profile tools run tools bash`

## Environment Variables

### Required for Production

```bash
# JWT Secrets (generate strong random strings)
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# MongoDB URL (if using external database)
MONGO_URL=mongodb://mongo:27017/your-database
```

### Optional Configuration

```bash
# Server port (default: 3001 for dev, 8080 for prod)
PORT=3001

# Client URL for CORS
CLIENT_URL=http://localhost:3000

# API URL for client
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

## Docker Commands

### Building Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build server

# Production build
docker-compose -f docker-compose.prod.yml build
```

### Managing Containers

```bash
# View running containers
docker-compose ps

# Execute commands in running container
docker-compose exec server sh
docker-compose exec client sh

# View container logs
docker-compose logs server -f
docker-compose logs client -f
```

### Database Management

```bash
# Access MongoDB shell
docker-compose exec mongo mongosh collab_demo

# Backup database
docker-compose exec mongo mongodump --db collab_demo --out /tmp/backup

# Restore database
docker-compose exec mongo mongorestore --db collab_demo /tmp/backup/collab_demo
```

## Troubleshooting

### Port Conflicts
If you encounter port conflicts, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "3010:3000"  # Change 3010 to any available port
```

### Node Modules Issues
If you encounter module resolution issues:
```bash
# Remove volumes and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Permission Issues
The production containers run as non-root user `nodejs` (UID 1001) for security. Ensure file permissions are set correctly.

### Health Checks
Both client and server have health checks configured. Monitor service health:
```bash
docker-compose ps
```

## Security Considerations

1. **Non-root User**: Production containers run as non-root user
2. **Minimal Base Images**: Alpine Linux reduces attack surface
3. **Build-time Secrets**: Use Docker BuildKit secrets for sensitive data
4. **Network Isolation**: Services communicate via internal Docker network
5. **Environment Variables**: Never commit secrets to version control

## Performance Optimization

1. **Multi-stage Builds**: Reduces final image size
2. **Layer Caching**: Optimized COPY commands for better caching
3. **pnpm Store Mount**: Caches dependencies between builds
4. **Production Mode**: Optimized for production workloads

## Continuous Integration

The Docker setup is designed to work with CI/CD pipelines:

```bash
# Build images with tags
docker build -t myapp/server:latest apps/server/
docker build -t myapp/client:latest apps/client/

# Push to registry
docker push myapp/server:latest
docker push myapp/client:latest
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)