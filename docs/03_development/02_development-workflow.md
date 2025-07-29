# Development Workflow

This document describes the development workflow for this project, from creating a new branch to getting your code merged.

## Branching Model

We use a simplified Gitflow model:

- **`main`**: The main branch, which always contains production-ready code.
- **`develop`**: The development branch, where all new features are integrated.
- **`feat/...`**: Feature branches, created from `develop`.
- **`fix/...`**: Bugfix branches, created from `develop`.

## Step-by-Step Workflow

### 1. Create an Issue

Before you start working on a new feature or bugfix, create an issue in GitHub to track your work.

### 2. Create a Branch

Create a new branch from the `develop` branch. Name your branch according to the type of work you are doing:

- **Feature**: `feat/my-new-feature`
- **Bugfix**: `fix/my-bug-fix`

```bash
git checkout develop
git pull
git checkout -b feat/my-new-feature
```

### 3. Make Your Changes

Make your code changes, following the **[Coding Standards](./01_coding-standards.md)**. As you work, make small, atomic commits with clear and concise commit messages.

### 4. Run Quality Checks

Before you push your changes, run the local quality checks to ensure your code is clean and passes all tests:

```bash
pnpm run lint
pnpm run test
```

### 5. Push Your Changes

Push your branch to the remote repository:

```bash
git push origin feat/my-new-feature
```

### 6. Create a Pull Request

Go to GitHub and create a pull request (PR) from your branch to the `develop` branch. In the PR description, link to the issue you created in step 1.

### 7. Code Review

Another developer will review your code, and they may request changes. Once your PR is approved, it will be merged into the `develop` branch.

### 8. Merging to `main`

Periodically, the `develop` branch will be merged into the `main` branch to create a new production release.
