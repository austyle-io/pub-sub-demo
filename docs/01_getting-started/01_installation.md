# Installation Guide

This guide provides detailed instructions for setting up your local development environment. By following these steps, you will have a fully functional instance of the application running on your machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.x or later. We recommend using a version manager like [nvm](https://github.com/nvm-sh/nvm).
- **pnpm**: The only supported package manager for this project. Install it via `npm install -g pnpm`.
- **Docker**: Required for running the local MongoDB instance. Download it from the [Docker website](https://www.docker.com/products/docker-desktop).
- **Git**: For cloning the repository.

## Step 1: Clone the Repository

Clone the project repository to your local machine:

```bash
git clone https://github.com/your-username/pub-sub-demo.git
cd pub-sub-demo
```

## Step 2: Install Dependencies

Install all project dependencies using `pnpm`:

```bash
pnpm install
```

This command will install dependencies for all packages in the monorepo.

## Step 3: Set Up Environment Variables

Copy the example environment file to create your local configuration:

```bash
cp .env.example .env
```

Now, open the `.env` file and customize the variables as needed. The default values are suitable for local development.

## Step 4: Start the Database

The application uses a MongoDB database, which can be easily started with Docker Compose:

```bash
docker-compose up -d
```

This will start a MongoDB container in the background.

## Step 5: Run the Application

Start the frontend and backend development servers concurrently:

```bash
pnpm run dev
```

This command will:
- Start the backend server on `http://localhost:3001`
- Start the frontend development server on `http://localhost:3000`

## Step 6: Verify the Installation

Open your web browser and navigate to `http://localhost:3000`. You should see the application's home page. You can now register a new user and start using the application.

## Troubleshooting

- **Port Conflicts**: If you have other services running on ports `3000` or `3001`, you can change the ports in the `.env` file.
- **Docker Issues**: Ensure that the Docker daemon is running. If you encounter any issues with the MongoDB container, you can view its logs with `docker-compose logs -f`.
