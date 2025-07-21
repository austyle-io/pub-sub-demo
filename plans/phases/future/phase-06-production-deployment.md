# Phase 6: Production Deployment

**Status**: 📋 Planned
**Target**: Q1 2025
**Dependencies**: Security hardening complete
**Objective**: Deploy application to production with Docker containerization and cloud hosting

## 🎯 **Overview**

This phase will containerize the application and deploy it to a production cloud environment with proper scaling, monitoring, and security. The deployment will use Docker for containerization and Google Cloud Run for serverless auto-scaling.

## 📋 **Planned Deliverables**

### 🐳 **Docker Containerization**

- **Multi-stage Builds**: Optimized production Docker images
- **Security Hardening**: Non-root users, minimal attack surface
- **Layer Optimization**: Efficient caching and small image sizes
- **Health Checks**: Container health monitoring

### ☁️ **Cloud Deployment**

- **Google Cloud Run**: Serverless container hosting with auto-scaling
- **Load Balancing**: Global HTTP(S) load balancer
- **SSL/TLS**: Automatic HTTPS with managed certificates
- **Domain Configuration**: Custom domain with DNS setup

### 🔧 **Environment Management**

- **Staging Environment**: Pre-production testing environment
- **Production Environment**: Live user-facing deployment
- **Environment Variables**: Secure secret management
- **Configuration Management**: Environment-specific settings

## 🏗️ **Deployment Architecture**

```mermaid
┌─────────────────┐      HTTPS      ┌──────────────────────┐
│   Users/CDN     │ ◄─────────────► │  Google Load         │
│   (Cloudflare)  │                 │  Balancer + SSL      │
└─────────────────┘                 └──────────┬───────────┘
                                               │
                                    ┌──────────▼───────────┐
                                    │  Cloud Run Services  │
                                    │  ┌─────────────────┐ │
                                    │  │   Frontend      │ │
                                    │  │   (React SPA)   │ │
                                    │  └─────────────────┘ │
                                    │  ┌─────────────────┐ │
                                    │  │   Backend       │ │
                                    │  │   (Express API) │ │
                                    │  └─────────────────┘ │
                                    └──────────┬───────────┘
                                               │
                                    ┌──────────▼───────────┐
                                    │   MongoDB Atlas      │
                                    │   (Managed Database) │
                                    └──────────────────────┘
```

## 🐳 **Docker Implementation**

### **Frontend Dockerfile**

```dockerfile
# Multi-stage build for React app
FROM node:20-alpine AS base
RUN corepack enable pnpm

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/client/package.json ./apps/client/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm build --filter=@collab-edit/client

# Production stage
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **Backend Dockerfile**

```dockerfile
# Multi-stage build for Express server
FROM node:20-alpine AS base
RUN corepack enable pnpm
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm build --filter=@collab-edit/server

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy built application
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Set up non-root user
USER nextjs

EXPOSE 8080
CMD ["node", "dist/server.js"]
```

## ☁️ **Cloud Run Configuration**

### **Service Definitions**

```yaml
# frontend-service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: collab-edit-frontend
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "0"
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 1000
      containers:
      - image: gcr.io/PROJECT_ID/collab-edit-frontend:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
        env:
        - name: VITE_API_URL
          value: "https://api.your-domain.com"
```

```yaml
# backend-service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: collab-edit-backend
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "100"
    spec:
      containerConcurrency: 1000
      containers:
      - image: gcr.io/PROJECT_ID/collab-edit-backend:latest
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: "2"
            memory: "2Gi"
        env:
        - name: JWT_ACCESS_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-access-secret
        - name: MONGO_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongo-url
```

## 🔒 **Security Configuration**

### **Secret Management**

```bash
# Create secrets in Google Secret Manager
gcloud secrets create jwt-access-secret --data-file=jwt-access.key
gcloud secrets create jwt-refresh-secret --data-file=jwt-refresh.key
gcloud secrets create mongo-url --data-file=mongo-connection.txt

# Grant Cloud Run access to secrets
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### **Network Security**

```yaml
# Security policies
apiVersion: v1
kind: ConfigMap
metadata:
  name: security-config
data:
  cors-origins: "https://your-domain.com,https://www.your-domain.com"
  rate-limit-rpm: "100"
  max-request-size: "10mb"
```

## 🚀 **CI/CD Pipeline**

### **GitHub Actions Deployment**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}

    - name: Configure Docker
      run: gcloud auth configure-docker

    - name: Build and Push Frontend
      run: |
        docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/collab-edit-frontend:${{ github.sha }} \
          -f apps/client/Dockerfile .
        docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/collab-edit-frontend:${{ github.sha }}

    - name: Build and Push Backend
      run: |
        docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/collab-edit-backend:${{ github.sha }} \
          -f apps/server/Dockerfile .
        docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/collab-edit-backend:${{ github.sha }}

    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy collab-edit-frontend \
          --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/collab-edit-frontend:${{ github.sha }} \
          --platform managed \
          --region us-central1 \
          --allow-unauthenticated

        gcloud run deploy collab-edit-backend \
          --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/collab-edit-backend:${{ github.sha }} \
          --platform managed \
          --region us-central1 \
          --allow-unauthenticated
```

## 📊 **Monitoring & Observability**

### **Health Checks**

```typescript
// Backend health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      memory: 'ok',
      disk: 'ok'
    }
  };

  try {
    // Check MongoDB connection
    await mongoClient.db().admin().ping();
    health.checks.database = 'ok';
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'degraded';
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
    health.checks.memory = 'warning';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### **Logging Configuration**

```typescript
// Production logging setup
const logger = createAppLogger('production', {
  level: 'info',
  enableConsole: true,
  enableFile: false,
  enableExternal: true, // Send to Cloud Logging
  pretty: false
});

// Add request correlation IDs
app.use((req, res, next) => {
  req.correlationId = crypto.randomUUID();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
});
```

## 🧪 **Testing Strategy**

### **Deployment Testing**

```yaml
# End-to-end deployment tests
name: E2E Deployment Tests

on:
  deployment_status:

jobs:
  e2e-tests:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Run Playwright Tests
      run: |
        npx playwright test --config=playwright.prod.config.ts
      env:
        BASE_URL: ${{ github.event.deployment.payload.web_url }}
```

### **Load Testing**

```javascript
// k6 load test script
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 0 },  // Ramp down
  ],
};

export default function() {
  let response = http.get('https://your-domain.com/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## 💰 **Cost Optimization**

### **Resource Optimization**

- **Auto-scaling**: Scale to zero when idle
- **Resource Limits**: Right-size CPU and memory
- **Cold Start Optimization**: Minimize container startup time
- **CDN Integration**: Cache static assets at edge

### **Cost Monitoring**

```bash
# Set up billing alerts
gcloud alpha billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Collab Edit Budget" \
  --budget-amount=50USD \
  --threshold-rule=percent=80,spend-basis=forecasted-spend
```

## 📈 **Success Metrics**

### **Performance Targets**

- **Page Load Time**: < 2 seconds (LCP)
- **API Response Time**: < 200ms (p95)
- **WebSocket Connection**: < 1 second
- **Uptime**: 99.9% availability

### **Scalability Targets**

- **Concurrent Users**: Support 1000+ simultaneous users
- **Documents**: Handle 10,000+ active documents
- **Auto-scaling**: Scale from 0 to 100 instances
- **Global Distribution**: Multi-region deployment

## 🔄 **Rollback Strategy**

### **Blue-Green Deployment**

```bash
# Deploy to staging slot
gcloud run deploy collab-edit-backend-staging \
  --image gcr.io/PROJECT_ID/collab-edit-backend:$NEW_VERSION

# Test staging environment
./scripts/test-staging.sh

# Switch traffic to new version
gcloud run services update-traffic collab-edit-backend \
  --to-revisions collab-edit-backend-staging=100

# If issues, rollback immediately
gcloud run services update-traffic collab-edit-backend \
  --to-revisions collab-edit-backend-production=100
```

## 📚 **References**

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Docker Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/)
- [Kubernetes Health Checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

---

**📋 Phase 6 Planned** - Production deployment with cloud-native architecture and monitoring
