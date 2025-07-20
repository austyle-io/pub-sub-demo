Below is a turnkey **containerisation playbook** that converts the mono‑repo you just boot‑strapped into an **isolated, loosely‑coupled, VS Code‑ready dev‑container stack**.
Everything runs locally with Docker Compose; each process (client, server, database) is its own container, yet the development experience still feels “one machine” thanks to the Dev Container specification.

---

## 1 ▪ High‑level architecture

```
┌─────────────┐   ws/http   ┌──────────┐   TCP   ┌───────────┐
│  client     │◀──────────▶│  server   │◀──────▶│  MongoDB   │
│ React + Vite│  port 3000 │ Express   │ 27017  │ ShareDB DB │
└─────────────┘            │ + ShareDB │        └───────────┘
          ▲  bind‑mount    │           │  bind‑mount ▲
          │  source code   └───────────┘  source code│
          └────────────── devcontainer (VS Code attaches here)
```

* Each service is **independently rebuildable/restartable**.
* Code is bind‑mounted, so hot‑reload (`vite`, `nodemon`) works exactly as on the host.
* VS Code opens the workspace through **`.devcontainer/devcontainer.json`**, attaches to the *server* container by default, and starts the side‑cars automatically via the referenced `docker-compose.yml` 🔗([Containers.dev][1], [Visual Studio Code][2]).

---

## 2 ▪ Folder layout

```
/
├── .devcontainer
│   ├── devcontainer.json   # spec entry‑point
│   └── docker-compose.yml  # dev‑only compose stack
│
├── apps/
│   ├── client/
│   │   └── Dockerfile.dev
│   └── server/
│       └── Dockerfile.dev
│
├── packages/shared/        # no container – mount into both
└── .dockerignore
```

For a leaner prod image you would add `Dockerfile` (multi‑stage) beside each `Dockerfile.dev`, but **development** images focus on speed & live‑reload.

---

## 3 ▪ Dockerfiles (dev)

### 3.1  `apps/server/Dockerfile.dev`

```Dockerfile
# ---------- base layer shared by client & server ----------
FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /workspace

# ---------- server (Express + ShareDB) ----------
FROM base AS dev
ENV PNPM_HOME=/usr/local/pnpm
ENV PATH="$PNPM_HOME:$PATH"
# copy only lockfile for faster install in build cache
COPY pnpm-lock.yaml ./
RUN pnpm fetch
# full source comes in as a bind‑mount at runtime
CMD ["pnpm","--workspace-root","turbo","run","dev","--filter","apps/server"]
```

### 3.2  `apps/client/Dockerfile.dev`

```Dockerfile
FROM node:20-slim
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /workspace
COPY pnpm-lock.yaml ./
RUN pnpm fetch
CMD ["pnpm","--workspace-root","turbo","run","dev","--filter","apps/client"]
```

> *We copy only the lock‑file so Docker’s build cache is valid until deps change; the full repo arrives at runtime via a volume, so no rebuild is needed for every code edit.*

---

## 4 ▪ `docker-compose.yml` (inside `.devcontainer`)

```yaml
version: "3.9"

services:
  server:
    build:
      context: ../..
      dockerfile: apps/server/Dockerfile.dev
    volumes:
      - ../..:/workspace:cached        # mono‑repo bind‑mount
      - node_modules_server:/workspace/node_modules
    environment:
      - MONGO_URL=mongodb://mongo:27017/collab_demo
      - PORT=3001
    ports:
      - "3001:3001"
    depends_on:
      - mongo

  client:
    build:
      context: ../..
      dockerfile: apps/client/Dockerfile.dev
    volumes:
      - ../..:/workspace:cached
      - node_modules_client:/workspace/node_modules
    environment:
      - VITE_API_URL=http://localhost:3001
      - PORT=3000
    ports:
      - "3000:3000"
    depends_on:
      - server

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongo", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mongo_data:
  node_modules_server:
  node_modules_client:
```

*Two separate `node_modules` volumes keep host FS clean and avoid Linux/Windows UID issues.*

---

## 5 ▪ Dev Container spec – `.devcontainer/devcontainer.json`

```jsonc
{
  "name": "Collab‑Edit‑Dev",
  "dockerComposeFile": "docker-compose.yml",
  "service": "server",             // VS Code attaches here
  "workspaceFolder": "/workspace", // monorepo root in container
  "forwardPorts": [3000, 3001],
  "otherServices": ["client", "mongo"],
  "customizations": {
    "vscode": {
      "settings": {
        "terminal.integrated.defaultProfile.linux": "bash",
        "typescript.tsdk": "node_modules/typescript/lib"
      },
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-typescript-next",
        "mongodb.mongodb-vscode"
      ]
    }
  },
  "postCreateCommand": "pnpm install",
  "runServices": ["mongo", "server", "client"]
}
```

* When you **“Re‑open in Container”** VS Code fires up the stack, installs deps once, and starts both dev servers.
* You can still open a second VS Code window attached to `client` if you want language‑server auto‑restart there (menu ➜ *Remote‑Containers: Attach to Running Container…*).

---

## 6 ▪ Update CI for container parity (optional)

Add a matrix job that spins the same compose stack in GitHub Actions:

```yaml
services:
  mongo:
    image: mongo:7
    ports: [27017:27017]
steps:
  - uses: docker/setup-buildx-action@v3
  - run: docker compose -f .devcontainer/docker-compose.yml up -d mongo
  - run: pnpm lint && pnpm test
```

This federates tests against the same Mongo version used locally.

---

## 7 ▪ Loose coupling & hot‑reload explained

| Concern                  | Solution in compose file                                                      |
| ------------------------ | ----------------------------------------------------------------------------- |
| **Process isolation**    | Separate images & containers (`client`, `server`, `mongo`).                   |
| **Network**              | Docker default bridge; services reach each other by name (`mongo`, `server`). |
| **Source sharing**       | One bind‑mount keeps code DRY across containers.                              |
| **State sharing**        | Only Mongo persists data (`mongo_data` volume).                               |
| **Live reload**          | Each container runs its own watcher (`vite` / `nodemon`).                     |
| **Independent restarts** | `docker compose restart client` etc.                                          |

---

## 8 ▪ Running the stack

```bash
# one‑time (host shell)
git clone <repo>
cd collab-edit-demo
# VS Code ➜ “Reopen in Container” or:
docker compose -f .devcontainer/docker-compose.yml up --build
```

Open [http://localhost:3000](http://localhost:3000).  The React app proxies API calls to `http://localhost:3001`.

---

## 9 ▪ Production images (outline)

1. **Multi‑stage build** in `apps/server/Dockerfile`

   * stages: `base` (install deps), `builder` (turbo build), `runner` (node:20‑slim, copy `dist/`).
2. **Nginx or Vite static server** for client.
3. Compose or K8s manifest with env‑vars for external Mongo / secrets.

*(Kept brief because user asked only about dev containers.)*

---

### References

* Dev‑container JSON reference － containers.dev ([Containers.dev][1])
* Multi‑service dev‑container pattern with `docker-compose.yml` － VS Code docs ([Visual Studio Code][2])
* Docker‑Compose orchestration in VS Code (“Use Docker Compose”) ([Visual Studio Code][3])

---

With these files committed you get **one‑command spin‑up**, zero “works on my machine” drift, and true **loose coupling** – every tier runs in its own Docker context yet shares code for live development through Dev Containers.

[1]: https://containers.dev/implementors/json_reference/?utm_source=chatgpt.com "Dev Container metadata reference"
[2]: https://code.visualstudio.com/remote/advancedcontainers/connect-multiple-containers?utm_source=chatgpt.com "Connect to multiple containers - Visual Studio Code"
[3]: https://code.visualstudio.com/docs/containers/docker-compose?utm_source=chatgpt.com "Use Docker Compose - Visual Studio Code"
