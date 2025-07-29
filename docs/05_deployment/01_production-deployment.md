# Production Deployment Guide

This guide provides a step-by-step process for deploying the application to a production environment. The deployment strategy is based on Docker and Google Cloud Run.

## Prerequisites

- A Google Cloud Platform (GCP) project with billing enabled.
- The `gcloud` CLI installed and authenticated.
- A custom domain for your application.

## Step 1: Build Docker Images

Build the production Docker images for the frontend and backend:

```bash
docker build -t gcr.io/YOUR_PROJECT_ID/client:latest -f apps/client/Dockerfile .
docker build -t gcr.io/YOUR_PROJECT_ID/server:latest -f apps/server/Dockerfile .
```

## Step 2: Push Images to GCR

Push the images to the Google Container Registry (GCR):

```bash
gcloud auth configure-docker
docker push gcr.io/YOUR_PROJECT_ID/client:latest
docker push gcr.io/YOUR_PROJECT_ID/server:latest
```

## Step 3: Deploy to Cloud Run

Deploy the images to Google Cloud Run:

```bash
# Deploy the backend
gcloud run deploy server \
  --image gcr.io/YOUR_PROJECT_ID/server:latest \
  --platform managed \
  --region YOUR_REGION \
  --allow-unauthenticated

# Deploy the frontend
gcloud run deploy client \
  --image gcr.io/YOUR_PROJECT_ID/client:latest \
  --platform managed \
  --region YOUR_REGION \
  --allow-unauthenticated
```

## Step 4: Configure Load Balancer and Domain

- Create a global HTTP(S) load balancer in the GCP console.
- Create two backend services, one for the `client` service and one for the `server` service.
- Configure the load balancer to route traffic to the appropriate backend service based on the path (e.g., `/api/*` to the server).
- Point your custom domain to the IP address of the load balancer.

## Step 5: Set Up CI/CD

Refer to the **[CI/CD Pipeline](./02_ci-cd-pipeline.md)** guide to automate the deployment process.

