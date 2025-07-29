# CI/CD Pipeline

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for this project, which is implemented using GitHub Actions.

## Overview

The CI/CD pipeline is defined in the `.github/workflows/ci.yml` file. It is triggered on every push to the `main` and `develop` branches.

## CI Pipeline

The CI (Continuous Integration) pipeline runs on every push to any branch. It consists of the following jobs:

- **Lint**: Checks the code for formatting and style issues with Biome.
- **Test**: Runs all unit and integration tests with Vitest.
- **Build**: Builds the frontend and backend applications to ensure they are compilable.

## CD Pipeline

The CD (Continuous Deployment) pipeline runs only on pushes to the `main` branch. It consists of the following jobs:

- **Build and Push Images**: Builds the production Docker images and pushes them to Google Container Registry (GCR).
- **Deploy to Production**: Deploys the new images to Google Cloud Run.

## Workflow Definition

Here is a simplified version of the `ci.yml` workflow:

```yaml
name: CI/CD

on:
  push:
    branches:
      - main
      - develop

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm run test

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      # ... steps to build and push images ...
      # ... steps to deploy to Cloud Run ...
```

## Secrets Management

We use GitHub Actions secrets to securely store the credentials needed for deploying to GCP. These secrets are configured in the repository settings.
